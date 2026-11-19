import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import jwt from "jsonwebtoken";
import { app } from "../dist/src/app.js";
import { prisma } from "../dist/src/lib/prisma.js";

test("phase 1 API authorization and validation", async (t) => {
  const database = new URL(process.env.DATABASE_URL);
  assert.equal(database.hostname, "127.0.0.1");
  assert.equal(database.pathname, "/irri_phase1");
  const verifyFrontend = process.env.PHASE1_VERIFY_FRONTEND === "1";
  const server = app.listen(verifyFrontend ? 5000 : 0, "127.0.0.1");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const api = (path, options) => fetch(`${base}/api/v1${path}`, options);

  assert.equal((await fetch(`${base}/ready`)).status, 200);
  assert.equal((await api("/auth/me")).status, 401);
  assert.equal((await api("/auth/me", { headers: { Authorization: "Bearer invalid" } })).status, 401);
  assert.equal((await api("/news?page=0")).status, 400);

  const email = process.env.SEED_ADMIN_EMAIL;
  const response = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: process.env.SEED_ADMIN_PASSWORD })
  });
  assert.equal(response.status, 200);
  const { data } = await response.json();
  const headers = { Authorization: `Bearer ${data.token}`, "Content-Type": "application/json" };
  assert.equal((await api("/auth/me", { headers })).status, 200);
  assert.equal((await api("/audit-logs", { headers })).status, 200);
  assert.equal((await api("/news", {
    method: "POST", headers, body: JSON.stringify({ title: "Test", content: "Test", role: "SUPER_ADMIN" })
  })).status, 400);

  const expired = jwt.sign({ id: data.user.id }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal((await api("/auth/me", { headers: { Authorization: `Bearer ${expired}` } })).status, 401);

  await prisma.user.update({ where: { email }, data: { role: "EDITOR" } });
  try {
    assert.equal((await api("/audit-logs", { headers })).status, 403);
    assert.equal((await api("/news/missing", { method: "DELETE", headers })).status, 403);
    await prisma.user.update({ where: { email }, data: { isActive: false } });
    assert.equal((await api("/auth/me", { headers })).status, 401);
  } finally {
    await prisma.user.update({ where: { email }, data: { role: data.user.role, isActive: true } });
  }

  if (verifyFrontend) {
    const origin = "http://127.0.0.1:3301";
    const requireFrontend = createRequire(new URL("../../frontend/package.json", import.meta.url));
    const frontend = spawn(process.execPath, [
      requireFrontend.resolve("next/dist/bin/next"),
      "start", "-H", "127.0.0.1", "-p", "3301"
    ], {
      cwd: fileURLToPath(new URL("../../frontend/", import.meta.url)),
      env: {
        ...process.env, NODE_ENV: "production", AUTH_URL: origin, NEXTAUTH_URL: origin,
        NEXT_IGNORE_INCORRECT_LOCKFILE: "1"
      },
      stdio: "inherit"
    });
    t.after(async () => {
      if (frontend.exitCode !== null) return;
      const closed = once(frontend, "close");
      frontend.kill();
      await closed;
    });
    const cookies = new Map();
    async function visit(path, form) {
      const result = await fetch(origin + path, {
        redirect: "manual",
        headers: { Cookie: [...cookies.values()].join("; ") },
        ...(form ? { method: "POST", body: new URLSearchParams(form) } : {})
      });
      for (const cookie of result.headers.getSetCookie()) {
        const pair = cookie.split(";")[0];
        const separator = pair.indexOf("=");
        const name = pair.slice(0, separator);
        if (pair.length === separator + 1) cookies.delete(name);
        else cookies.set(name, pair);
      }
      return result;
    }
    let csrfResponse;
    for (let attempt = 0; attempt < 40 && !csrfResponse; attempt++) {
      csrfResponse = await visit("/api/auth/csrf").catch(() => null);
      if (!csrfResponse) await delay(250);
    }
    assert.equal(csrfResponse?.status, 200);
    assert.ok([302, 307].includes((await visit("/admin/dashboard")).status));
    const { csrfToken } = await csrfResponse.json();
    const login = await visit("/api/auth/callback/credentials", {
      email, password: process.env.SEED_ADMIN_PASSWORD, csrfToken, callbackUrl: origin + "/admin/dashboard"
    });
    assert.ok([302, 303].includes(login.status));
    assert.equal((await visit("/admin/dashboard")).status, 200);
    const session = await (await visit("/api/auth/session")).json();
    assert.equal(session.user.email, email);
    assert.ok(!JSON.stringify(session).includes("backendToken"));
    const signOutCsrf = await (await visit("/api/auth/csrf")).json();
    const logout = await visit("/api/auth/signout", {
      csrfToken: signOutCsrf.csrfToken, callbackUrl: origin + "/admin/login"
    });
    assert.ok([302, 303].includes(logout.status));
    assert.equal(await (await visit("/api/auth/session")).json(), null);
    assert.ok([302, 307].includes((await visit("/admin/dashboard")).status));
  }
});
