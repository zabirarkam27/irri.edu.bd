import { notFound } from "next/navigation";
import Home, { generateMetadata as homeMetadata } from "@/app/page";
import Search, { generateMetadata as searchMetadata } from "@/app/(public)/search/page";
import Contact, { generateMetadata as contactMetadata } from "@/app/(public)/contact/page";
import News, { generateMetadata as newsMetadata } from "@/app/(public)/news/page";
import { collections, PublicPage } from "@/features/public/PublicPage";
import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";
import { AdmissionsPage } from "@/features/public/AdmissionsPage";
import { institutionPages } from "@/features/public/paths";
import { publicMetadata } from "@/lib/seo";
import type { SearchParams } from "@/features/cms/config";

type Props = { params: Promise<{ segments?: string[] }>; searchParams: Promise<SearchParams> };
type Route = { kind: "home" | "news" | "contact" | "search" | "admissions" }
  | { kind: "collection"; base: string; title: string }
  | { kind: "detail"; type: string; slug: string; path: string };

function resolveRoute(segments: string[] = []): Route {
  if (!segments.length) return { kind: "home" as const };
  const [base, slug] = segments;
  if (segments.length === 1) {
    if (base === "news" || base === "contact" || base === "search" || base === "admissions") return { kind: base };
    if (institutionPages.includes(base)) return { kind: "detail" as const, type: "pages", slug: base, path: `/${base}` };
    if (Object.hasOwn(collections, base)) return { kind: "collection" as const, base, title: collections[base].title };
  }
  if (segments.length === 2 && !["researchers", "academic-calendar"].includes(base) &&
      (base === "news" || base === "pages" || Object.hasOwn(collections, base))) {
    const type = base === "news" || base === "pages" ? base : collections[base].api;
    return { kind: "detail" as const, type, slug, path: `/${base}/${encodeURIComponent(slug)}` };
  }
  notFound();
}

export async function generateMetadata({ params }: Props) {
  const route = resolveRoute((await params).segments);
  switch (route.kind) {
    case "home": return homeMetadata();
    case "contact": return contactMetadata();
    case "search": return searchMetadata();
    case "news": return newsMetadata();
    case "admissions": return publicMetadata("Admissions", "", "/admissions", "bn");
    case "collection": return publicMetadata(route.title, route.title, `/${route.base}`, "bn");
    case "detail": return publicContentMetadata(route.type, route.slug, route.path);
  }
}

export default async function BengaliPage({ params, searchParams }: Props) {
  const route = resolveRoute((await params).segments);
  switch (route.kind) {
    case "home": return <Home />;
    case "contact": return <Contact />;
    case "search": return <Search searchParams={searchParams} />;
    case "news": return <News searchParams={searchParams} />;
    case "admissions": return <AdmissionsPage searchParams={searchParams} />;
    case "collection": return <PublicPage slug={route.base} searchParams={searchParams} />;
    case "detail": return <DetailPage type={route.type} slug={route.slug} />;
  }
}
