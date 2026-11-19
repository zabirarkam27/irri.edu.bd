import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";
import multer from "multer";
import sharp from "sharp";
import { Router } from "express";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";
import { AppError } from "@/errors/AppError";
import { getPagination } from "@/utils/query";
import { writeAudit } from "@/utils/audit";
import { listQuerySchema, writeParamsSchema } from "@/modules/cms/cms.validation";
import { deleteObject, readObject, writeObject } from "./storage";
import { mediaIsReferenced, mediaPath } from "./references";

export const mediaRouter = Router();
export const mediaAdminRouter = Router();
const editMedia = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR);
const deleteMedia = requireRole(Role.SUPER_ADMIN, Role.ADMIN);
const maxSize = 4 * 1024 * 1024;
const multipart = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxSize, files: 1, fields: 2, fieldSize: 2000 } }).single("file");
const mediaSelect = {
  id: true, url: true, filename: true, mimeType: true, size: true, type: true,
  altText: true, createdAt: true, uploadedBy: true
} as const;

function verifyFile(file?: Express.Multer.File) {
  if (!file) throw new AppError(400, "Select an image or PDF");
  const filename = file.originalname.split(/[\\/]/).at(-1)?.trim().slice(0, 240) ?? "";
  const ext = filename.split(".").at(-1)?.toLowerCase();
  const buffer = file.buffer;
  if (file.mimetype === "image/jpeg" && (ext === "jpg" || ext === "jpeg") && buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) {
    return { filename, ext: "jpg", type: "IMAGE" as const };
  }
  if (file.mimetype === "image/png" && ext === "png" && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { filename, ext: "png", type: "IMAGE" as const };
  }
  if (file.mimetype === "image/webp" && ext === "webp" && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return { filename, ext: "webp", type: "IMAGE" as const };
  }
  if (file.mimetype === "application/pdf" && ext === "pdf" && buffer.toString("ascii", 0, 5) === "%PDF-") {
    return { filename, ext: "pdf", type: "DOCUMENT" as const };
  }
  throw new AppError(400, "File extension, MIME type and file contents must match a supported JPG, PNG, WebP or PDF");
}

export async function cleanMediaGarbage() {
  const pending = await prisma.mediaGarbage.findMany({ take: 20, orderBy: { createdAt: "asc" } });
  for (const { key } of pending) {
    try {
      await deleteObject(key);
      await prisma.mediaGarbage.deleteMany({ where: { key } });
    } catch {
      console.error("Deferred private media cleanup failed");
    }
  }
}

async function enqueueCleanup(keys: (string | null | undefined)[], db: Prisma.TransactionClient = prisma) {
  const data = keys.filter((key): key is string => Boolean(key)).map((key) => ({ key }));
  if (data.length) await db.mediaGarbage.createMany({ data, skipDuplicates: true });
}

async function discardNewObjects(keys: string[]) {
  for (const key of keys) {
    try {
      await deleteObject(key);
    } catch {
      await enqueueCleanup([key]).catch(() => console.error("Failed to queue new media object for cleanup"));
    }
  }
}

async function storeFile(file: Express.Multer.File | undefined, altText: unknown) {
  const metadata = verifyFile(file);
  const upload = file!;
  const alt = z.string().trim().max(500).optional().safeParse(altText);
  if (!alt.success) throw new AppError(400, "Alt text must be up to 500 characters");
  let thumbnail: Buffer | undefined;
  if (metadata.type === "IMAGE") {
    try {
      thumbnail = await sharp(upload.buffer, { limitInputPixels: 30_000_000 }).rotate()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 }).toBuffer();
    } catch {
      throw new AppError(400, "The image is corrupt or exceeds the supported dimensions");
    }
  }
  const storageKey = "media/" + randomUUID() + "." + metadata.ext;
  const thumbnailKey = thumbnail ? "media/" + randomUUID() + ".webp" : null;
  try {
    await writeObject(storageKey, upload.buffer, upload.mimetype);
    if (thumbnail && thumbnailKey) await writeObject(thumbnailKey, thumbnail, "image/webp");
  } catch (error) {
    await discardNewObjects(thumbnailKey ? [storageKey, thumbnailKey] : [storageKey]);
    throw error;
  }
  return { filename: metadata.filename, type: metadata.type, mimeType: upload.mimetype, size: upload.size,
    storageKey, thumbnailKey, altText: alt.data || null };
}

mediaAdminRouter.get("/", requireAuth, validateRequest(z.object({
  query: listQuerySchema.shape.query.omit({ type: true }).extend({ kind: z.enum(["IMAGE", "DOCUMENT"]).optional() })
})), catchAsync(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where: Prisma.MediaAssetWhereInput = {
    ...(req.query.kind === "IMAGE" || req.query.kind === "DOCUMENT" ? { type: req.query.kind } : {}),
    ...(typeof req.query.search === "string" ? { OR: ["filename", "altText"].map((field) => ({ [field]: { contains: req.query.search, mode: "insensitive" } })) } : {})
  };
  const [data, total] = await Promise.all([
    prisma.mediaAsset.findMany({ where, skip, take, orderBy: [{ createdAt: "desc" }, { id: "asc" }], select: mediaSelect }),
    prisma.mediaAsset.count({ where })
  ]);
  sendResponse(res, 200, { success: true, message: "Media loaded", data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } });
}));

const uploadHandler = catchAsync(async (req, res) => {
  const stored = await storeFile(req.file, req.body.altText);
  const id = randomUUID();
  try {
    const data = await prisma.$transaction(async (db) => {
      const record = await db.mediaAsset.create({ data: { ...stored, id, url: mediaPath(id), uploadedBy: req.user?.id }, select: mediaSelect });
      await writeAudit(req, "UPLOAD_MEDIA", "mediaAsset", record.id, undefined, { type: record.type, size: record.size }, db);
      return record;
    });
    sendResponse(res, 201, { success: true, message: "Media uploaded", data });
  } catch (error) {
    await discardNewObjects([stored.storageKey, ...(stored.thumbnailKey ? [stored.thumbnailKey] : [])]);
    throw error;
  }
});

mediaAdminRouter.post("/upload", requireAuth, editMedia, multipart, uploadHandler);
mediaRouter.post("/upload", requireAuth, editMedia, multipart, uploadHandler);

mediaAdminRouter.put("/:id/file", requireAuth, editMedia, validateRequest(writeParamsSchema), multipart, catchAsync(async (req, res) => {
  const id = String(req.params.id);
  const stored = await storeFile(req.file, req.body.altText);
  let data;
  try {
    data = await prisma.$transaction(async (db) => {
      const previous = await db.mediaAsset.findUniqueOrThrow({ where: { id } });
      if ((!previous.storageKey || previous.type !== stored.type) && await mediaIsReferenced(db, previous.url)) {
        throw new AppError(409, "Replace this linked file with the same media type, or unlink the legacy file first");
      }
      const record = await db.mediaAsset.update({ where: { id }, data: { ...stored, url: mediaPath(id) }, select: mediaSelect });
      await enqueueCleanup([previous.storageKey, previous.thumbnailKey], db);
      await writeAudit(req, "REPLACE_MEDIA", "mediaAsset", id, undefined, { type: record.type, size: record.size }, db);
      return record;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    await discardNewObjects([stored.storageKey, ...(stored.thumbnailKey ? [stored.thumbnailKey] : [])]);
    throw error;
  }
  await cleanMediaGarbage().catch(() => console.error("Could not process the media cleanup queue"));
  sendResponse(res, 200, { success: true, message: "Media replaced", data });
}));

mediaAdminRouter.delete("/:id", requireAuth, deleteMedia, validateRequest(writeParamsSchema), catchAsync(async (req, res) => {
  const id = String(req.params.id);
  await prisma.$transaction(async (db) => {
    const record = await db.mediaAsset.findUniqueOrThrow({ where: { id } });
    if (await mediaIsReferenced(db, record.url)) throw new AppError(409, "Unlink this file from content before deleting it");
    await db.mediaAsset.delete({ where: { id } });
    await enqueueCleanup([record.storageKey, record.thumbnailKey], db);
    await writeAudit(req, "DELETE_MEDIA", "mediaAsset", id, { type: record.type, size: record.size }, undefined, db);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  await cleanMediaGarbage().catch(() => console.error("Could not process the media cleanup queue"));
  sendResponse(res, 200, { success: true, message: "Media deleted" });
}));

function serveFile(admin: boolean) {
  return catchAsync(async (req, res) => {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: String(req.params.id) } });
    if (!asset?.storageKey || (!admin && !(await mediaIsReferenced(prisma, asset.url, true)))) {
      throw new AppError(404, "Media not found");
    }
    const thumbnail = req.query.thumb === "1" && asset.thumbnailKey;
    const body = await readObject(thumbnail || asset.storageKey);
    res.type(thumbnail ? "image/webp" : asset.mimeType);
    res.set({
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": admin ? "same-origin" : "cross-origin"
    });
    if (asset.type !== "IMAGE") res.attachment("document.pdf");
    try {
      await pipeline(body, res);
    } catch {
      if (!res.destroyed) res.destroy();
    }
  });
}
mediaRouter.get("/files/:id", validateRequest(writeParamsSchema), serveFile(false));
mediaAdminRouter.get("/:id/file", requireAuth, validateRequest(writeParamsSchema), serveFile(true));

mediaAdminRouter.post("/gallery/:id", requireAuth, editMedia, validateRequest(writeParamsSchema.extend({ body: z.object({
  assetId: z.string().min(1).max(80),
  altText: z.string().trim().max(500),
  caption: z.string().trim().max(1000),
  order: z.number().int().min(0).max(100000)
}).strict() })), catchAsync(async (req, res) => {
  const albumId = String(req.params.id);
  const data = await prisma.$transaction(async (db) => {
    const album = await db.galleryAlbum.findUniqueOrThrow({ where: { id: albumId }, select: { status: true } });
    if (album.status !== "DRAFT") throw new AppError(409, "Return the album to draft before changing its images");
    const asset = await db.mediaAsset.findUniqueOrThrow({ where: { id: req.body.assetId } });
    if (asset.type !== "IMAGE" || !asset.storageKey) throw new AppError(400, "Select a managed image");
    const altText = req.body.altText || asset.altText;
    if (!altText) throw new AppError(400, "Alternative text is required");
    const image = await db.galleryImage.create({ data: {
      albumId, url: asset.url, altText, caption: req.body.caption || null, order: req.body.order
    } });
    await writeAudit(req, "ATTACH_GALLERY_IMAGE", "galleryAlbum", albumId, undefined, { imageId: image.id }, db);
    return image;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  sendResponse(res, 201, { success: true, message: "Image attached", data });
}));

mediaAdminRouter.delete("/gallery/images/:id", requireAuth, editMedia, validateRequest(writeParamsSchema), catchAsync(async (req, res) => {
  const id = String(req.params.id);
  await prisma.$transaction(async (db) => {
    const image = await db.galleryImage.findUniqueOrThrow({ where: { id }, include: { album: { select: { status: true } } } });
    if (image.album.status !== "DRAFT") throw new AppError(409, "Return the album to draft before changing its images");
    await db.galleryImage.delete({ where: { id } });
    await writeAudit(req, "DETACH_GALLERY_IMAGE", "galleryAlbum", image.albumId, { imageId: id }, undefined, db);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  sendResponse(res, 200, { success: true, message: "Image detached" });
}));
