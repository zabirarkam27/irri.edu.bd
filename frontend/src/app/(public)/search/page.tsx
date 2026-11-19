import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { newsRequest } from "@/features/news/data";
import { NewsPagination } from "@/features/news/NewsPagination";
import { publicNav } from "@/config/nav";
import { contentPath } from "@/features/public/paths";
import { Button } from "@/components/ui/button";
import { localePath, localized, tr } from "@/lib/locale";
import { requestLocale } from "@/lib/request-locale";

const filters = ["pages", "news", "notices", "events", "publications", "academic-programs", "courses", "departments", "administration", "research-areas", "research-projects", "gallery"];
const typeLabel = (type: string) => publicNav.find(({ href }) => href === `/${type}`)?.label ?? "Pages";
type Hit = { type: string; slug: string; title: string; titleBn: string | null; excerpt: string | null; excerptBn: string | null };
export async function generateMetadata() {
  const { locale } = await requestLocale();
  return { title: tr(locale, "Search"), robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, { locale }] = await Promise.all([searchParams, requestLocale()]);
  const t = (text: string) => tr(locale, text);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const type = typeof params.type === "string" && filters.includes(params.type) ? params.type : "";
  const page = typeof params.page === "string" && /^(?:[1-9]\d{0,2}|1000)$/.test(params.page) ? params.page : "1";
  const query = new URLSearchParams({ q, page });
  if (type) query.set("type", type);
  const result = q.length >= 2 ? await newsRequest<Hit[]>(`/search?${query}`).catch(() => null) : null;
  return <SiteShell>
    <section className="container-x grid gap-6 py-12">
      <h1 className="font-display text-3xl font-semibold">{t("Search")}</h1>
      <form action={localePath(locale, "/search")} className="flex flex-wrap items-end gap-3" role="search">
        <label className="grid w-full gap-2 text-sm sm:w-auto sm:min-w-0 sm:flex-1">{t("Search terms")}
          <input name="q" type="search" defaultValue={q} minLength={2} maxLength={120} required className="h-10 w-full rounded-md border bg-background px-3" />
        </label>
        <label className="grid gap-2 text-sm">{t("Content type")}
          <select name="type" defaultValue={type} className="h-10 max-w-full rounded-md border bg-background px-3">
            <option value="">{t("All content")}</option>
            {filters.map((filter) => <option key={filter} value={filter}>{t(typeLabel(filter))}</option>)}
          </select>
        </label>
        <Button type="submit">{t("Search")}</Button>
      </form>
      {q.length < 2 ? <p>{t("Enter at least two characters.")}</p> : !result ? <p role="alert">{t("Search is temporarily unavailable.")}</p> :
        result.data.length ? <ul className="divide-y border-y">
          {result.data.map((item) => {
            const title = localized(locale, item.title, item.titleBn);
            const excerpt = localized(locale, item.excerpt || "", item.excerptBn);
            return <li key={`${item.type}/${item.slug}`} className="grid gap-2 py-4">
              <p className="text-sm text-muted-foreground">{t(typeLabel(item.type))}</p>
              <Link lang={title.lang} className="break-words font-semibold underline" href={localePath(locale, contentPath(item.type, item.slug))}>{title.text}</Link>
              {excerpt.text && <p lang={excerpt.lang} className="break-words text-muted-foreground">{excerpt.text}</p>}
            </li>;
          })}
        </ul> : <p>{t("No matching published content.")}</p>}
      {result?.meta && <NewsPagination path={localePath(locale, "/search")} locale={locale} query={query} {...result.meta} />}
    </section>
  </SiteShell>;
}
