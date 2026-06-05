import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "@/config/env";
import { AppError } from "@/errors/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: Role };
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) throw new AppError(401, "Authentication required");

  const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string; role: Role };
  req.user = decoded;
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) throw new AppError(403, "Forbidden");
    next();
  };
}
