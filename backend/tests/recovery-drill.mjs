import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const checksum = (bytes) => createHash("sha256").update(bytes).digest("hex");

export async function verifyRecovery(asset, expectedBytes) {
  const source = new URL(process.env.DATABASE_URL);
  assert.equal(source.hostname, "127.0.0.1");
  assert.equal(source.pathname, "/irri_phase1");
  assert.equal(process.env.NODE_ENV, "test");
  assert.ok(!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL, "Only local media fixtures may be backed up");
  assert.match(asset.storageKey, /^media\/[0-9a-f-]{36}\.(?:png|jpg|webp|pdf)$/);
  assert.match(asset.id, /^[0-9a-z-]+$/i);

  const admin = new URL(source);
  admin.pathname = "/postgres";
  const destination = new URL(source);
  const name = "irri_qa_restore_" + randomUUID().replaceAll("-", "");
  destination.pathname = "/" + name;
  const folder = await mkdtemp(path.join(tmpdir(), "irri-qa-"));
  const archive = path.join(folder, "database.dump");
  const backupFile = path.join(folder, "blob.backup");
  const restoredFile = path.join(folder, "blob.restored");
  let created = false;
  try {
    await run("pg_dump", ["--no-password", "--format=custom", "--file", archive, "--dbname", source.href]);
    await copyFile(path.join(process.cwd(), ".media", asset.storageKey), backupFile);
    await run("createdb", ["--no-password", "--maintenance-db", admin.href, name]);
    created = true;
    await run("pg_restore", ["--no-password", "--exit-on-error", "--no-owner", "--no-privileges", "--dbname", destination.href, archive]);
    const options = ["--no-password", "--dbname", destination.href, "-AtX", "-v", "ON_ERROR_STOP=1", "-c"];
    const restored = await run("psql", [...options, `SELECT "url" || '|' || "storageKey" FROM "MediaAsset" WHERE "id" = '${asset.id}'`]);
    assert.equal(restored.stdout.trim(), asset.url + "|" + asset.storageKey);
    const migrations = await run("psql", [...options, 'SELECT count(*) FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL']);
    assert.ok(Number(migrations.stdout) >= 3, "Applied migrations survived restore");
    await copyFile(backupFile, restoredFile);
    assert.equal(checksum(await readFile(restoredFile)), checksum(expectedBytes));
  } finally {
    try {
      if (created) await run("dropdb", ["--no-password", "--maintenance-db", admin.href, name]);
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  }
}
