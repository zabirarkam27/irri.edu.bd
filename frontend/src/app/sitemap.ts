import { publicNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { contentPath } from "@/features/public/paths";
import { localePath } from "@/lib/locale";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const latest = await fetch(`${siteConfig.apiBaseUrl}/sitemap`, { cache: "no-store" })
    .then(async (response) => response.ok ? (await response.json()).data as { type: string; slug: string; updatedAt: string; translated: boolean }[] : [])
    .catch(() => []);
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  function add(path: string, bilingual: boolean, lastModified?: string) {
    const en = new URL(path, siteConfig.url).href;
    const bn = new URL(localePath("bn", path), siteConfig.url).href;
    const alternates = bilingual ? { languages: { en, bn } } : undefined;
    entries.set(en, { url: en, lastModified, alternates });
    if (bilingual) entries.set(bn, { url: bn, lastModified, alternates });
    else entries.delete(bn);
  }
  for (const item of publicNav) add(item.href, true);
  for (const item of latest) {
    const path = contentPath(item.type, item.slug);
    add(path, path === "/admissions" || item.translated, item.updatedAt);
  }
  return [...entries.values()];
}
