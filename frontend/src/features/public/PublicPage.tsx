import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { Container } from "@/components/shared/Container";
import { NewsPagination } from "@/features/news/NewsPagination";
import { newsRequest } from "@/features/news/data";
import { formValue, type CmsRecord, type SearchParams } from "@/features/cms/config";
import { DetailPage } from "./DetailPage";

export const collections: Record<string, { api: string; title: string }> = {
  administration: { api: "people", title: "Administration" },
  "academic-programs": { api: "programs", title: "Academic Programs" },
  courses: { api: "courses", title: "Courses" },
  departments: { api: "departments", title: "Departments" },
  gallery: { api: "gallery-albums", title: "Gallery" },
  publications: { api: "publications", title: "Publications" },
  notices: { api: "notices", title: "Notices" },
  events: { api: "events", title: "Events" }
};

export async function PublicPage({ slug, searchParams }: { slug: string; searchParams?: Promise<SearchParams> }) {
  const collection = collections[slug];
  if (!collection) return <DetailPage type="pages" slug={slug} />;
  const params = await searchParams;
  const page = typeof params?.page === "string" && /^[1-9]\d{0,6}$/.test(params.page) ? params.page : "1";
  const query = new URLSearchParams({ page });
  if (slug === "administration") {
    query.set("sortBy", "order");
    query.set("sortOrder", "asc");
    query.set("type", "ADMINISTRATION");
  }
  const result = await newsRequest<CmsRecord[]>(`/${collection.api}?${query}`).catch(() => null);
  return <>
    <SiteHeader />
    <main>
      <PageHero title={collection.title} description="" />
      <Container className="grid gap-6 py-12">
        {slug === "academic-programs" && <Link href="/departments" className="w-fit underline">Departments</Link>}
        {!result ? <p role="alert">This content is temporarily unavailable.</p> : !result.data.length ? <p>No published records.</p> : (
          <ul className="divide-y border-y">
            {result.data.map((record) => <li key={record.id} className="grid gap-2 py-4">
              <Link className="break-words text-lg font-semibold underline" href={`/${slug}/${encodeURIComponent(formValue(record.slug))}`}>{formValue(record.title ?? record.name)}</Link>
              {formValue(record.designation ?? record.excerpt ?? record.description ?? record.author) && (
                <p className="break-words text-muted-foreground">{formValue(record.designation ?? record.excerpt ?? record.description ?? record.author)}</p>
              )}
            </li>)}
          </ul>
        )}
        {result?.meta && <NewsPagination path={`/${slug}`} query={query} {...result.meta} />}
      </Container>
    </main>
    <SiteFooter />
  </>;
}
