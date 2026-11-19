import assert from "node:assert/strict";

function origin(name) {
  const url = new URL(process.env[name] ?? "");
  const loopback = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  assert.ok(url.protocol === "https:" || (loopback && url.protocol === "http:"), `${name} must use HTTPS outside localhost`);
  assert.equal(url.href, url.origin + "/", `${name} must be an origin without credentials, path or query`);
  return url.origin;
}

async function check(base, path, status, verify = () => {}) {
  const response = await fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(12_000) });
  assert.equal(response.status, status, path);
  await verify(response);
  console.log(`${path}: ${status}`);
}

const frontend = origin("SMOKE_FRONTEND_ORIGIN");
const backend = origin("SMOKE_BACKEND_ORIGIN");
const ready = async (response) => assert.equal((await response.json()).success, true);
const paths = [
  [backend, "/health", 200, ready],
  [backend, "/ready", 200, ready],
  [backend, "/api/v1/editorial/run", 401],
  [frontend, "/", 200],
  [frontend, "/bn", 200, async (res) => assert.ok(/<html lang="bn"/.test(await res.text()), "Bengali language flag is missing")],
  [frontend, "/admissions", 200],
  [frontend, "/admin/login", 200],
  [frontend, "/api/admin/media", 401],
  [frontend, "/robots.txt", 200, async (res) => assert.ok(/^Disallow:\s*\/admin/m.test(await res.text()), "Admin crawl exclusion is missing")],
  [frontend, "/sitemap.xml", 200, async (res) => assert.ok(/\/bn\/admissions/.test(await res.text()), "Bengali admissions URL is missing")]
];
const checks = await Promise.allSettled(paths.map((args) => check(...args)));
for (const [index, result] of checks.entries()) {
  if (result.status === "rejected") {
    const reason = result.reason;
    console.error(`${paths[index][1]} failed: ${reason instanceof assert.AssertionError ? reason.message : reason.name}`);
    process.exitCode = 1;
  }
}
