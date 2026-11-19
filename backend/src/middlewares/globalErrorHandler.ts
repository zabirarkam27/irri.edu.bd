import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { AppError } from "@/errors/AppError";

export const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues.map((issue) => issue.message).join(", ");
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else if (["P2002", "P2003"].includes(error.code)) {
      statusCode = 409;
      message = error.code === "P2002" ? "Duplicate record" : "Related record conflict";
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid or missing record fields";
  } else if (error instanceof MulterError) {
    statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = statusCode === 413 ? "File is too large" : "Invalid upload";
  } else if (error?.type === "entity.parse.failed" || error instanceof URIError) {
    statusCode = 400;
    message = "Malformed request";
  } else if (error?.type === "entity.too.large") {
    statusCode = 413;
    message = "Request is too large";
  }

  if (statusCode === 500) console.error("API request failed", { method: _req.method, errorType: error?.constructor?.name });
  res.status(statusCode).json({ success: false, message });
};
