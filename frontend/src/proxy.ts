import { NextResponse, type NextRequest } from "next/server";
import { publicNav } from "@/config/nav";

const publicPaths = new Set([...publicNav.map(({ href }) => href.split("/")[1]), "pages", "search"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalized = pathname === "/bn" ? "/" : pathname.startsWith("/bn/") ? pathname.slice(3) : pathname;
  const isBn = normalized !== pathname;
  const publicPath = publicPaths.has(normalized.split("/")[1] ?? "");
  if (isBn && !publicPath) return new NextResponse(null, { status: 404 });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-irri-locale", isBn && publicPath ? "bn" : "en");
  requestHeaders.set("x-irri-path", publicPath ? normalized : "/");
  requestHeaders.set("x-irri-query", publicPath ? request.nextUrl.search : "");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginRoute = pathname === "/admin/login";

  if (!isAdminRoute || isLoginRoute) return NextResponse.next({ request: { headers: requestHeaders } });

  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (!hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\..*).*)"]
};
