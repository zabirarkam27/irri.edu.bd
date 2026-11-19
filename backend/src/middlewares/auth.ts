import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "@/config/env";
import { AppError } from "@/errors/AppError";
import { prisma } from "@/lib/prisma";
import { catchAsync } from "@/utils/catchAsync";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: Role };
    }
  }
}

export const requireAuth: RequestHandler = catchAsync(async (req, _res, next) => {
  const token = /^Bearer (\S+)$/i.exec(req.headers.authorization ?? "")?.[1];
  if (!token) throw new AppError(401, "Authentication required");

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError(401, "Invalid or expired session");
  }
  if (typeof decoded !== "object" || typeof decoded.id !== "string" || typeof decoded.exp !== "number") {
    throw new AppError(401, "Invalid session");
  }
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, isActive: true }
  });
  if (!user?.isActive) throw new AppError(401, "Invalid session");
  req.user = { id: user.id, email: user.email, role: user.role };
  next();
});

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) throw new AppError(403, "Forbidden");
    next();
  };
}
