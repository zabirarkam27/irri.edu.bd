import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Role } from "@prisma/client";
import { createContactMessage, getContactMessages } from "@/modules/contact/contact.controller";
import { createContactSchema } from "@/modules/contact/contact.validation";
import { requireAuth, requireRole } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";

export const contactRouter = Router();

contactRouter.post("/", rateLimit({ windowMs: 60 * 60 * 1000, limit: 5 }), validateRequest(createContactSchema), createContactMessage);
contactRouter.get("/", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR), getContactMessages);
