import { siteConfig } from "@/config/site";

export async function GET() {
  try {
    const upstream = await fetch(`${siteConfig.apiBaseUrl}/academic-calendar.ics`, { cache: "no-store" });
    if (upstream.ok) return new Response(upstream.body, { headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="irri-academic-calendar.ics"',
      "Cache-Control": "no-store"
    } });
  } catch {
    // Use the same response for an unavailable or unreachable API.
  }
  return new Response("Academic calendar temporarily unavailable.", { status: 503 });
}
