import { publicMetadata } from "@/lib/seo";
import { requestLocale } from "@/lib/request-locale";
import { localePath, localized, tr } from "@/lib/locale";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { newsQuery, newsRequest, type NewsPost } from "@/features/news/data";
import { NewsPagination } from "@/features/news/NewsPagination";
export async function generateMetadata() {
  return publicMetadata("News", "Read published news from the institute.", "/news", (await requestLocale()).locale);
}
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, { locale }] = await Promise.all([searchParams, requestLocale()]);
  const query = newsQuery(params);
  const result = await newsRequest<NewsPost[]>(`/news?${query}`).catch(() => null);
  return (
    <SiteShell>
      <section className="container-x grid gap-6 py-12">
        <h1 className="font-display text-4xl font-semibold">{tr(locale, "News")}</h1>
        {!result ? <p role="alert">{tr(locale, "News is temporarily unavailable.")}</p> : result.data.length === 0 ? <p>{tr(locale, "No published news.")}</p> : (
          <ul className="divide-y border-y">
            {result.data.map((post) => {
              const title = localized(locale, post.title, post.titleBn);
              return (
              <li key={post.id} className="grid gap-2 py-4">
                <Link lang={title.lang} className="break-words text-lg font-semibold underline" href={localePath(locale, `/news/${encodeURIComponent(post.slug)}`)}>{title.text}</Link>
                {post.excerpt && <p lang="en" className="break-words text-muted-foreground">{post.excerpt}</p>}
              </li>
            ); })}
          </ul>
        )}
        {result?.meta && <NewsPagination path={localePath(locale, "/news")} locale={locale} query={query} {...result.meta} />}
      </section>
    </SiteShell>
  );
}
