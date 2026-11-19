import { Router } from "express";
import { Role } from "@prisma/client";
import { createController, deleteController, detailController, listController, updateController } from "@/modules/cms/cms.controller";
import { createContentSchema, detailParamsSchema, listQuerySchema, updateContentSchema, writeParamsSchema } from "@/modules/cms/cms.validation";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";
import type { ModelName } from "@/modules/cms/cms.service";

export function cmsRouter(model: ModelName, readProtected = false) {
  const router = Router();
  const readMiddleware = readProtected ? [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN)] : [];

  router.get("/", ...readMiddleware, validateRequest(listQuerySchema), listController(model));
  router.get("/:idOrSlug", ...readMiddleware, validateRequest(detailParamsSchema), detailController(model));
  if (model === "auditLog") return router;
  router.post("/", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), validateRequest(createContentSchema), createController(model));
  router.patch("/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.MODERATOR), validateRequest(updateContentSchema), updateController(model));
  router.delete("/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN), validateRequest(writeParamsSchema), deleteController(model));

  return router;
}
