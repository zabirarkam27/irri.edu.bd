import { adminRequest } from "@/features/news/admin";
import { NewsRequestError } from "@/features/news/data";

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams;
  const query = new URLSearchParams({ limit: "12" });
  for (const key of ["search", "page", "kind"]) {
    const value = input.get(key);
    if (value) query.set(key, value);
  }
  try {
    const result = await adminRequest(`/admin/media?${query}`);
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return Response.json({ message: "Media could not be loaded" }, { status: error instanceof NewsRequestError ? error.status : 503 });
  }
}
