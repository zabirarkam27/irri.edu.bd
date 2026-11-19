import type { NextConfig } from "next";
import { z } from "zod";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  }
};

export default function config() {
  const result = z.object({
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(32).refine((value) => !value.startsWith("replace-with"), "Set a random secret")
  }).safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid frontend configuration: ${result.error.issues.map(({ path, message }) => `${path.join(".")}: ${message}`).join("; ")}`);
  }
  return nextConfig;
}
