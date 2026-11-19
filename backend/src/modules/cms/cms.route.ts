import { Router } from "express";
import { Role } from "@prisma/client";
import { createController, deleteController, detailController, listController, updateController } from "@/modules/cms/cms.controller";
import { createContentSchema, detailParamsSchema, listQuerySchema, updateContentSchema, writeParamsSchema } from "@/modules/cms/cms.validation";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";
import type { ModelName } from "@/modules/cms/cms.service";
import { newsCreateSchema, newsUpdateSchema } from "@/modules/cms/cms.validation";

export function cmsRouter(model: ModelName, readProtected = false) {
  const router = Router();
  const publishedOnly = model === "newsPost" && !readProtected;
  const readMiddleware = readProtected ? [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN,
    ...(model === "newsPost" ? [Role.EDITOR, Role.MODERATOR] : []))] : [];

  router.get("/", ...readMiddleware, validateRequest(listQuerySchema), listController(model, publishedOnly));
  router.get("/:idOrSlug", ...readMiddleware, validateRequest(detailParamsSchema), detailController(model, publishedOnly));
  if (model === "auditLog") return router;
  router.post("/", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), validateRequest(model === "newsPost" ? newsCreateSchema : createContentSchema), createController(model));
  router.patch("/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.MODERATOR), validateRequest(model === "newsPost" ? newsUpdateSchema : updateContentSchema), updateController(model));
  router.delete("/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN), validateRequest(writeParamsSchema), deleteController(model));

  return router;
}
