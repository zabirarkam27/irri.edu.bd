import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z.string().url().regex(/^postgres(?:ql)?:\/\//),
  JWT_SECRET: z.string().min(16).refine((value) => !value.startsWith("replace-with"), "Set a random secret"),
  JWT_EXPIRES_IN: z.string().regex(/^[1-9]\d{0,5}[smhdw]$/).default("7d"),
  FRONTEND_URL: z.string().refine((value) => value.split(",").every((entry) => {
    const origin = entry.trim();
    try {
      const url = new URL(origin);
      return ["http:", "https:"].includes(url.protocol) && url.origin === origin;
    } catch {
      return false;
    }
  }), "Use comma-separated HTTP(S) origins without a trailing slash").default("http://localhost:3000")
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid backend configuration: ${result.error.issues.map(({ path, message }) => `${path.join(".")}: ${message}`).join("; ")}`);
}
export const env = result.data;
