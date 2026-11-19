import { siteConfig } from "@/config/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/search", "/bn/search"] },
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
