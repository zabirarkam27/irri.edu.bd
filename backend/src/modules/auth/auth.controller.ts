import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";
import { AppError } from "@/errors/AppError";
import { catchAsync } from "@/utils/catchAsync";
import { sendResponse } from "@/utils/sendResponse";

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) throw new AppError(401, "Invalid email or password");

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) throw new AppError(401, "Invalid email or password");

  const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, signOptions);

  sendResponse(res, 200, {
    success: true,
    message: "Login successful",
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }
  });
});

export const me = catchAsync(async (req, res) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, isActive: true }
  });
  sendResponse(res, 200, { success: true, message: "User fetched", data: user });
});
