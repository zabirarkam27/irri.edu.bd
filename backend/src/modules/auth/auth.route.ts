import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "@/modules/auth/auth.controller";
import { loginSchema } from "@/modules/auth/auth.validation";
import { requireAuth } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validateRequest";

export const authRouter = Router();

authRouter.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5 }), validateRequest(loginSchema), login);
authRouter.get("/me", requireAuth, me);
