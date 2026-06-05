import { siteConfig } from "@/config/site";
import type { LoginInput } from "@/features/auth/schemas/auth.schema";

export async function login(input: LoginInput) {
  const response = await fetch(`${siteConfig.apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("Invalid email or password");
  return response.json();
}
