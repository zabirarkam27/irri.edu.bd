import { createMetadata } from "@/lib/seo";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { newsQuery, newsRequest, type NewsPost } from "@/features/news/data";
import { NewsPagination } from "@/features/news/NewsPagination";
export const metadata = createMetadata("News");
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = newsQuery(await searchParams);
  const result = await newsRequest<NewsPost[]>(`/news?${query}`).catch(() => null);
  return (
    <SiteShell>
      <section className="container-x grid gap-6 py-12">
        <h1 className="font-display text-4xl font-semibold">News</h1>
        {!result ? <p role="alert">News is temporarily unavailable.</p> : result.data.length === 0 ? <p>No published news.</p> : (
          <ul className="divide-y border-y">
            {result.data.map((post) => (
              <li key={post.id} className="grid gap-2 py-4">
                <Link className="break-words text-lg font-semibold underline" href={`/news/${encodeURIComponent(post.slug)}`}>{post.title}</Link>
                {post.excerpt && <p className="break-words text-muted-foreground">{post.excerpt}</p>}
              </li>
            ))}
          </ul>
        )}
        {result?.meta && <NewsPagination path="/news" query={query} {...result.meta} />}
      </section>
    </SiteShell>
  );
}
