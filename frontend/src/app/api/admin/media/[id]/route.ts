import { adminFetch } from "@/features/news/admin";
import { NewsRequestError } from "@/features/news/data";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]{1,80}$/i.test(id)) return new Response(null, { status: 404 });
  try {
    const thumb = new URL(request.url).searchParams.get("thumb") === "1" ? "?thumb=1" : "";
    const upstream = await adminFetch(`/admin/media/${id}/file${thumb}`);
    if (!upstream.ok) return new Response(null, { status: upstream.status });
    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff"
    });
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition);
    return new Response(upstream.body, { headers });
  } catch (error) {
    return new Response(null, { status: error instanceof NewsRequestError ? error.status : 503 });
  }
}
