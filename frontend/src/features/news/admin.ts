import { cookies, headers } from "next/headers";
import { cache } from "react";
import { getToken } from "next-auth/jwt";
import { newsRequest, NewsRequestError } from "./data";

export async function adminNewsRequest<T>(suffix: string, options?: RequestInit) {
  return adminRequest<T>(`/admin/news${suffix}`, options);
}

export async function adminRequest<T>(path: string, options?: RequestInit) {
  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const secureCookie = cookieStore.getAll().some(({ name }) =>
    name === "__Secure-authjs.session-token" || name.startsWith("__Secure-authjs.session-token.")
  );
  const session = await getToken({
    req: { headers: new Headers({ cookie: requestHeaders.get("cookie") ?? "" }) },
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie
  });
  if (typeof session?.backendToken !== "string") throw new NewsRequestError(401, "Sign in again to manage news.");
  const outgoingHeaders = new Headers(options?.headers);
  outgoingHeaders.set("Authorization", `Bearer ${session.backendToken}`);
  return newsRequest<T>(path, { ...options, headers: outgoingHeaders });
}

export const currentAdmin = cache(async () => {
  return (await adminRequest<{ id: string; name: string; email: string; role: string }>("/auth/me")).data;
});
