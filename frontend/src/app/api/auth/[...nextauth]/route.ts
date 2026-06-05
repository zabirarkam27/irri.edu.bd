import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { siteConfig } from "@/config/site";

const { handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const response = await fetch(`${siteConfig.apiBaseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data)
          });

          if (response.ok) {
            const payload = await response.json();
            return payload.data?.user ?? null;
          }
        } catch {
          // Allow the temporary fallback below to handle unavailable backend databases.
        }

        if (
          process.env.ADMIN_FALLBACK_EMAIL &&
          process.env.ADMIN_FALLBACK_PASSWORD &&
          parsed.data.email === process.env.ADMIN_FALLBACK_EMAIL &&
          parsed.data.password === process.env.ADMIN_FALLBACK_PASSWORD
        ) {
          return {
            id: "fallback-admin",
            name: "Super Admin",
            email: process.env.ADMIN_FALLBACK_EMAIL,
            role: "SUPER_ADMIN"
          };
        }

        return null;
      }
    })
  ],
  session: { strategy: "jwt" }
});

export const { GET, POST } = handlers;
