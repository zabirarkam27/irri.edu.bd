import path from "node:path";
import { createReadStream } from "node:fs";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import { del, get, put } from "@vercel/blob";
import { AppError } from "@/errors/AppError";

const localRoot = path.resolve(process.cwd(), ".media");

function storageKey(key: string) {
  if (!/^media\/[0-9a-f-]{36}\.(?:jpg|png|webp|pdf)$/.test(key)) throw new AppError(404, "Media not found");
  return key;
}

function token() {
  const value = process.env.BLOB_READ_WRITE_TOKEN;
  if (!value && (process.env.NODE_ENV === "production" || process.env.VERCEL)) {
    throw new AppError(503, "Private media storage is unavailable");
  }
  return value;
}

export async function writeObject(key: string, data: Buffer, contentType: string) {
  const safeKey = storageKey(key);
  const credential = token();
  if (credential) {
    await put(safeKey, data, { access: "private", addRandomSuffix: false, contentType, token: credential });
  } else {
    await mkdir(path.join(localRoot, "media"), { recursive: true });
    await writeFile(path.join(localRoot, safeKey), data, { flag: "wx" });
  }
}

export async function readObject(key: string) {
  const safeKey = storageKey(key);
  const credential = token();
  if (!credential) return createReadStream(path.join(localRoot, safeKey));
  const result = await get(safeKey, { access: "private", token: credential });
  if (!result || result.statusCode !== 200 || !result.stream) throw new AppError(404, "Media not found");
  return Readable.fromWeb(result.stream as unknown as ReadableStream);
}

export async function deleteObject(key: string) {
  const safeKey = storageKey(key);
  const credential = token();
  if (credential) await del(safeKey, { token: credential });
  else await unlink(path.join(localRoot, safeKey)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}
