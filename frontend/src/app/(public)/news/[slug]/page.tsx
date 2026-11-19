import { cache } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { NewsRequestError, newsRequest, type NewsPost } from "@/features/news/data";

type Props = { params: Promise<{ slug: string }> };
const loadNews = cache(async (slug: string) => {
  try {
    return (await newsRequest<NewsPost>(`/news/${encodeURIComponent(slug)}`)).data;
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: Props) {
  const post = await loadNews((await params).slug);
  const metadata = createMetadata(post.seoTitle || post.title, post.metaDescription || post.excerpt || undefined);
  const canonical = new URL(`/news/${encodeURIComponent(post.slug)}`, siteConfig.url).href;
  return { ...metadata, alternates: { canonical }, openGraph: { ...metadata.openGraph, url: canonical } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await loadNews(slug);
  if (post.slug !== slug) permanentRedirect(`/news/${encodeURIComponent(post.slug)}`);
  return (
    <SiteShell>
      <article className="container-x grid max-w-3xl gap-5 py-12">
        <Link href="/news" className="w-fit text-sm underline">All news</Link>
        <h1 className="break-words font-display text-4xl font-semibold">{post.title}</h1>
        {post.titleBn && <p lang="bn" className="break-words text-xl">{post.titleBn}</p>}
        <p className="whitespace-pre-wrap break-words">{post.content}</p>
        {post.contentBn && <p lang="bn" className="whitespace-pre-wrap break-words">{post.contentBn}</p>}
      </article>
    </SiteShell>
  );
}
