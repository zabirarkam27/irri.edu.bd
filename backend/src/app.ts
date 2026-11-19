import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import { globalErrorHandler } from "@/middlewares/globalErrorHandler";
import { notFound } from "@/middlewares/notFound";
import { router } from "@/routes";
import { prisma } from "@/lib/prisma";

export const app = express();

app.set("trust proxy", process.env.VERCEL ? 1 : false);
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = env.FRONTEND_URL.split(",").map((value) => value.trim());
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === "test" ? 1000 : 100,
  message: { success: false, message: "Too many requests" }
}));
app.use("/uploads", express.static(process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "IRRI API is healthy" });
});

app.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: "IRRI API is ready" });
  } catch {
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

app.use("/api/v1", router);
app.use(notFound);
app.use(globalErrorHandler);
