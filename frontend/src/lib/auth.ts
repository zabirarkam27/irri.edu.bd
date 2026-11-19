import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { siteConfig } from "@/config/site";
import { loginSchema } from "@/features/auth/schemas/auth.schema";

export const { handlers, auth, signOut } = NextAuth({
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const response = await fetch(`${siteConfig.apiBaseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.data),
            cache: "no-store"
          });
          if (!response.ok) return null;
          const { data } = await response.json();
          if (typeof data?.token !== "string" || !data.user?.id) return null;
          return { ...data.user, backendToken: data.token };
        } catch {
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user && "backendToken" in user) token.backendToken = user.backendToken;
      return token;
    },
    async session({ session, token }) {
      if (typeof token.backendToken === "string") {
        const response = await fetch(`${siteConfig.apiBaseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token.backendToken}` },
          cache: "no-store"
        }).catch(() => null);
        if (response?.ok) return session;
      }
      return { expires: session.expires, user: undefined } as unknown as typeof session;
    }
  },
  session: { strategy: "jwt" }
});
