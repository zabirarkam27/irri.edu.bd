import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import { app } from "../dist/src/app.js";
import { prisma } from "../dist/src/lib/prisma.js";

test("CMS authorization, news lifecycle and optional frontend integration", async (t) => {
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

  const slug = `news-${randomUUID()}`;
  const article = { title: "Integration news", slug, content: "Original content", status: "DRAFT" };
  assert.equal((await api("/admin/news")).status, 401);
  const save = (path, method, body) => api(path, { method, headers, body: JSON.stringify(body) });
  assert.equal((await save("/admin/news", "POST", { title: "Missing content" })).status, 400);
  const created = await save("/admin/news", "POST", article);
  assert.equal(created.status, 201);
  const { data: post } = await created.json();
  const adminDetail = `/admin/news/${post.id}`;
  const publicDetail = `/news/${slug}`;
  try {
    assert.equal((await save("/admin/news", "POST", article)).status, 409);
    assert.equal((await api(adminDetail, { headers })).status, 200);
    assert.equal((await api(publicDetail)).status, 404);
    const drafts = await (await api(`/admin/news?status=DRAFT&search=${slug}&page=1&limit=1`, { headers })).json();
    assert.equal(drafts.meta.total, 0);
    const matches = await (await api("/admin/news?status=DRAFT&search=Integration%20news&limit=1", { headers })).json();
    assert.equal(matches.data.length, 1);
    assert.ok(matches.meta.total >= 1);
    assert.equal((await save(adminDetail, "PATCH", { status: "PUBLISHED", content: "Updated content" })).status, 200);
    assert.equal((await (await api(publicDetail)).json()).data.content, "Updated content");
    for (const status of ["DRAFT", "ARCHIVED"]) {
      assert.equal((await save(adminDetail, "PATCH", { status })).status, 200);
      assert.equal((await api(publicDetail)).status, 404);
    }
    assert.equal((await api(`/news/${post.id}`)).status, 404);
    await prisma.user.update({ where: { email }, data: { role: "EDITOR" } });
    try {
      assert.equal((await api(adminDetail, { method: "DELETE", headers })).status, 403);
    } finally {
      await prisma.user.update({ where: { email }, data: { role: data.user.role } });
    }
    assert.equal((await api(adminDetail, { method: "DELETE", headers })).status, 200);
    assert.equal((await api(adminDetail, { headers })).status, 404);
  } finally {
    await prisma.newsPost.deleteMany({ where: { id: post.id } });
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
        headers: { Cookie: [...cookies.values()].join("; "), ...(form ? { Origin: origin } : {}) },
        ...(form ? { method: "POST", body: form instanceof FormData ? form : new URLSearchParams(form) } : {})
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
    assert.match(await (await visit("/admin/news")).text(), /New post/);
    async function submitNewsForm(path, marker, fields) {
      const response = await visit(path);
      assert.equal(response.status, 200);
      const markup = await response.text();
      const formMarkup = [...markup.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)]
        .map(([html]) => html).find((html) => html.includes(`name="${marker}"`));
      assert.ok(formMarkup, "News form is present");
      const actionInputs = [...formMarkup.matchAll(/<input type="hidden" name="(\$ACTION_[^"]+)"(?: value="([^"]*)")?\/?\s*>/g)];
      assert.ok(actionInputs.length > 0, "Server Action form inputs are present");
      const form = new FormData();
      for (const [, name, value = ""] of actionInputs) {
        form.set(name, value.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&"));
      }
      for (const [key, value] of Object.entries(fields)) form.set(key, value);
      assert.equal((await visit(path, form)).status, 303);
    }
    const uiSlug = `ui-${randomUUID()}`;
    const fields = {
      title: "News created through admin form",
      slug: uiSlug,
      content: "Published through the real admin server action.",
      status: "PUBLISHED"
    };
    try {
      await submitNewsForm("/admin/news/new", "title", fields);
      assert.match(await (await visit(`/news/${uiSlug}`)).text(), /Published through the real admin server action/);
      assert.match(await (await visit("/")).text(), /News created through admin form/);
      const { id } = await prisma.newsPost.findUniqueOrThrow({ where: { slug: uiSlug }, select: { id: true } });
      await submitNewsForm(`/admin/news/${id}/edit`, "title", { ...fields, status: "DRAFT", content: "Edited draft content" });
      const unpublished = await visit(`/news/${uiSlug}`);
      // Next.js can stream an HTTP 200 before rendering its not-found boundary.
      assert.ok([200, 404].includes(unpublished.status));
      const unpublishedMarkup = await unpublished.text();
      assert.doesNotMatch(unpublishedMarkup, /Edited draft content|Published through the real admin server action/);
      assert.match(await (await visit(`/admin/news/${id}`)).text(), /Edited draft content/);
      await submitNewsForm(`/admin/news/${id}`, "confirmed", { confirmed: "yes" });
      assert.equal(await prisma.newsPost.count({ where: { id } }), 0);
    } finally {
      await prisma.newsPost.deleteMany({ where: { slug: uiSlug } });
    }
    const signOutCsrf = await (await visit("/api/auth/csrf")).json();
    const logout = await visit("/api/auth/signout", {
      csrfToken: signOutCsrf.csrfToken, callbackUrl: origin + "/admin/login"
    });
    assert.ok([302, 303].includes(logout.status));
    assert.equal(await (await visit("/api/auth/session")).json(), null);
    assert.ok([302, 307].includes((await visit("/admin/dashboard")).status));
  }
});
