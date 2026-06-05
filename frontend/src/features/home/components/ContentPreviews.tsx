import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { events, news, notices } from "@/features/home/data";

export function ContentPreviews() {
  return (
    <>
      <section className="bg-background">
        <div className="container-x grid gap-8 py-16 md:py-20 lg:grid-cols-3 lg:py-24">
          <div className="lg:col-span-2">
            <Preview title="Latest News" href="/news" items={news} eyebrow="News" />
          </div>
          <Preview title="Latest Notices" href="/notices" items={notices} eyebrow="Notices" compact />
        </div>
      </section>
      <section className="border-y border-border bg-surface">
        <div className="container-x py-16 md:py-20 lg:py-24">
          <SectionHeader eyebrow="Events" title="Upcoming events" href="/events" />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {events.map((item) => {
              const date = new Date(item.date);
              return (
                <Card key={item.slug}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-brand text-center text-primary-foreground shadow-soft">
                      <span>
                        <span className="block font-display text-2xl font-semibold">{date.getDate()}</span>
                        <span className="block text-[10px] font-semibold uppercase tracking-widest">{date.toLocaleString("en", { month: "short", year: "2-digit" })}</span>
                      </span>
                    </div>
                    <div>
                      <Link href={`/events/${item.slug}`} className="font-semibold leading-snug text-foreground hover:text-primary-pressed">
                        {item.title}
                      </Link>
                      <p className="mt-2 text-sm text-muted-foreground">Patisar campus and online archive desk</p>
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

function Preview({ title, href, items, eyebrow, compact }: { title: string; href: string; items: typeof news; eyebrow: string; compact?: boolean }) {
  return (
    <div>
      <SectionHeader eyebrow={eyebrow} title={title} href={href} />
      <div className={compact ? "mt-6 grid gap-4" : "mt-6 grid gap-5 md:grid-cols-2"}>
        {items.map((item) => (
          <Card key={item.slug}>
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <CalendarDays className="h-4 w-4" strokeWidth={2} /> {item.date}
              </p>
              <Link href={`${href}/${item.slug}`} className="mt-3 block font-semibold leading-snug text-foreground hover:text-primary-pressed">
                {item.title}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
