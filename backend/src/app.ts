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

export const app = express();

app.set("trust proxy", 1);
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
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use("/uploads", express.static(process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "IRRI API is healthy" });
});

app.use("/api/v1", router);
app.use(notFound);
app.use(globalErrorHandler);
