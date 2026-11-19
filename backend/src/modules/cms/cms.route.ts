import { Router } from "express";
import { Role } from "@prisma/client";
import { createController, deleteController, detailController, listController, updateController } from "@/modules/cms/cms.controller";
import { detailParamsSchema, listQuerySchema, modelWriteSchemas, writeParamsSchema } from "@/modules/cms/cms.validation";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";
import type { ModelName } from "@/modules/cms/cms.service";

export function cmsRouter(model: ModelName, readProtected = false) {
  const router = Router();
  const publishedOnly = !readProtected && ["page", "person", "department", "program", "course", "newsPost", "notice", "event", "galleryAlbum", "publication"].includes(model);
  const readMiddleware = readProtected ? [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN,
    ...(model !== "auditLog" ? [Role.EDITOR, Role.MODERATOR] : []))] : [];

  router.get("/", ...readMiddleware, validateRequest(listQuerySchema), listController(model, publishedOnly));
  router.get("/:idOrSlug", ...readMiddleware, validateRequest(detailParamsSchema), detailController(model, publishedOnly));
  if (model === "auditLog" || (model === "mediaAsset" && readProtected)) return router;
  const schemas = modelWriteSchemas(model);
  router.post("/", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), validateRequest(schemas.create), createController(model));
  router.patch("/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.MODERATOR), validateRequest(schemas.update), updateController(model));
  router.delete("/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN), validateRequest(writeParamsSchema), deleteController(model));

  return router;
}
