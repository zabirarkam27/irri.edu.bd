import type { Prisma } from "@prisma/client";
import { AppError } from "@/errors/AppError";

export const mediaPath = (id: string) => `/api/v1/media/files/${id}`;
export const managedMediaPath = /^\/api\/v1\/media\/files\/([a-zA-Z0-9-]{1,80})$/;

export async function mediaIsReferenced(db: Prisma.TransactionClient, url: string, publicOnly = false) {
  const status = publicOnly ? { status: "PUBLISHED" as const } : {};
  const [page, person, publication, image] = await Promise.all([
    db.page.findFirst({ where: { ogImage: url, ...status }, select: { id: true } }),
    db.person.findFirst({ where: { photoUrl: url, ...status }, select: { id: true } }),
    db.publication.findFirst({ where: { fileUrl: url, ...status }, select: { id: true } }),
    db.galleryImage.findFirst({ where: { url, ...(publicOnly ? { album: status } : {}) }, select: { id: true } })
  ]);
  return Boolean(page || person || publication || image);
}

export async function validateMediaReferences(db: Prisma.TransactionClient, body: Record<string, unknown>) {
  for (const field of ["ogImage", "photoUrl", "fileUrl"]) {
    const url = body[field];
    if (typeof url !== "string") continue;
    const match = managedMediaPath.exec(url);
    if (!match) continue;
    const asset = await db.mediaAsset.findUnique({ where: { id: match[1] }, select: { storageKey: true, type: true, url: true } });
    if (!asset?.storageKey || asset.url !== url || (field !== "fileUrl" && asset.type !== "IMAGE") ||
        (field === "fileUrl" && asset.type !== "DOCUMENT")) {
      throw new AppError(400, "Choose a valid media file for this field");
    }
  }
}
