import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/PageHero";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { Container } from "@/components/shared/Container";
import { events, news, notices } from "@/features/home/data";

const sources = {
  news,
  notices,
  events,
  publications: [
    { title: "Journal of Rabindra Research, Volume 1", slug: "journal-of-rabindra-research-volume-1", date: "2026-01-01" }
  ]
};

export function DetailPage({ type, slug }: { type: keyof typeof sources; slug: string }) {
  const item = sources[type].find((entry) => entry.slug === slug);
  if (!item) notFound();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero title={item.title} description={`Published on ${item.date}`} />
        <Container className="py-14">
          <article className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            <p>
              This page is wired for slug-based CMS content. When the backend is connected, it will render the published
              record for this slug with bilingual title, body, SEO fields, and related media.
            </p>
          </article>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
