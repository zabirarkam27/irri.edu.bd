import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { newsRequest, type NewsPost } from "@/features/news/data";

export async function ContentPreviews() {
  type PreviewRecord = NewsPost & { startsAt?: string; venue?: string };
  const [newsResult, noticeResult, eventResult] = await Promise.all([
    newsRequest<PreviewRecord[]>("/news?limit=4&sortBy=createdAt&sortOrder=desc").catch(() => null),
    newsRequest<PreviewRecord[]>("/notices?limit=4").catch(() => null),
    newsRequest<PreviewRecord[]>("/events?limit=3&sortBy=startsAt&sortOrder=desc").catch(() => null)
  ]);
  const asPreview = (post: PreviewRecord) => ({
    title: post.title,
    slug: post.slug,
    date: (post.publishedAt || post.createdAt).slice(0, 10)
  });
  const news = newsResult?.data.map(asPreview);
  const notices = noticeResult?.data.map(asPreview) ?? [];
  const events = eventResult?.data ?? [];
  return (
    <>
      <section className="bg-background">
        <div className="container-x grid gap-8 py-16 md:py-20 lg:grid-cols-3 lg:py-24">
          <div className="lg:col-span-2">
            <Preview title="Latest News" href="/news" items={news ?? []} eyebrow="News" />
            {!news?.length && <p className="mt-4 text-sm text-muted-foreground">{news ? "No published news." : "News is temporarily unavailable."}</p>}
          </div>
          <Preview title="Latest Notices" href="/notices" items={notices} eyebrow="Notices" compact />
        </div>
      </section>
      <section className="border-y border-border bg-surface">
        <div className="container-x py-16 md:py-20 lg:py-24">
          <SectionHeader eyebrow="Events" title="Recent events" href="/events" />
          {!events.length && <p className="mt-4 text-sm text-muted-foreground">{eventResult ? "No published events." : "Events are temporarily unavailable."}</p>}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {events.map((item) => {
              const date = new Date(item.startsAt ?? item.createdAt);
              return (
                <Card key={item.slug}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-brand text-center text-primary-foreground shadow-soft">
                      <span>
                        <span className="block font-display text-2xl font-semibold">{date.getUTCDate()}</span>
                        <span className="block text-[10px] font-semibold uppercase tracking-widest">{date.toLocaleString("en", { month: "short", year: "2-digit", timeZone: "UTC" })}</span>
                      </span>
                    </div>
                    <div>
                      <Link href={`/events/${encodeURIComponent(item.slug)}`} className="font-semibold leading-snug text-foreground hover:text-primary-pressed">
                        {item.title}
                      </Link>
                      {item.venue && <p className="mt-2 text-sm text-muted-foreground">{item.venue}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

function Preview({ title, href, items, eyebrow, compact }: { title: string; href: string; items: { title: string; slug: string; date: string }[]; eyebrow: string; compact?: boolean }) {
  return (
    <div>
      <SectionHeader eyebrow={eyebrow} title={title} href={href} />
      {compact && !items.length && <p className="mt-4 text-sm text-muted-foreground">No notices to display.</p>}
      <div className={compact ? "mt-6 grid gap-4" : "mt-6 grid gap-5 md:grid-cols-2"}>
        {items.map((item) => (
          <Card key={item.slug}>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <CalendarDays className="h-4 w-4" strokeWidth={2} /> {item.date}
              </p>
              <Link href={`${href}/${encodeURIComponent(item.slug)}`} className="mt-3 block font-semibold leading-snug text-foreground hover:text-primary-pressed">
                {item.title}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
