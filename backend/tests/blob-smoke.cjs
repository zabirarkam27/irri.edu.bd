const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { head } = require("@vercel/blob");
const { writeObject, deleteObject } = require("../dist/src/modules/media/storage.js");

async function main() {
  assert.ok(process.env.BLOB_READ_WRITE_TOKEN, "Private Blob credentials are required");
  const key = "media/" + randomUUID() + ".pdf";
  const data = Buffer.from("%PDF-1.4\n% private storage smoke fixture\n");
  try {
    await writeObject(key, data, "application/pdf");
    const object = await head(key, { token: process.env.BLOB_READ_WRITE_TOKEN });
    assert.ok([401, 403, 404].includes((await fetch(object.url)).status));
    const child = execFileSync(process.execPath, ["-e",
      "const { readObject } = require('./dist/src/modules/media/storage.js'); readObject(process.argv[1]).then(stream => stream.pipe(process.stdout)).catch(() => process.exitCode = 1)",
      key
    ], { cwd: require("node:path").resolve(__dirname, "..") });
    assert.deepEqual(child, data);
    console.log("Private Blob write, unauthorized access denial, and read in a fresh process passed.");
  } finally {
    await deleteObject(key);
  }
}

main().catch((error) => {
  console.error("Private Blob smoke test failed:", error.name);
  process.exitCode = 1;
});
