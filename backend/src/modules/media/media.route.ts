import path from "path";
import multer from "multer";
import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/markdown"
]);

const uploadDir = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, allowedTypes.has(file.mimetype))
});

export const mediaRouter = Router();

mediaRouter.post(
  "/upload",
  requireAuth,
  requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR),
  upload.single("file"),
  catchAsync(async (req, res) => {
    if (!req.file) throw new Error("File upload failed");
    const asset = await prisma.mediaAsset.create({
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: req.file.mimetype.startsWith("image/") ? "IMAGE" : "DOCUMENT",
        altText: req.body.altText,
        uploadedBy: req.user?.id
      }
    });
    sendResponse(res, 201, { success: true, message: "Media uploaded", data: asset });
  })
);
