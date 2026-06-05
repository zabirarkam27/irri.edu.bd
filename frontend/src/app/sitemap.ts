import { publicNav } from "@/config/nav";
import { siteConfig } from "@/config/site";

export default function sitemap() {
  return publicNav.map((item) => ({
    url: `${siteConfig.url}${item.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: item.href === "/" ? 1 : 0.7
  }));
}
