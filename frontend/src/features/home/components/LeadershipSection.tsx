import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import Link from "next/link";
import { newsRequest } from "@/features/news/data";
import { requestLocale } from "@/lib/request-locale";
import { localePath, localized, tr } from "@/lib/locale";

function initials(name: string) {
  return name
    .replace("Late ", "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export async function LeadershipSection() {
  const [{ locale }, result] = await Promise.all([requestLocale(), newsRequest<{ id: string; name: string; nameBn?: string; slug: string; designation: string; bio?: string }[]>(
    "/people?type=ADMINISTRATION&sortBy=order&sortOrder=asc&limit=6"
  ).catch(() => null)]);
  const leaders = result?.data ?? [];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Administration" title="Leadership and institute administration" />
        {!leaders.length && <p className="mt-4 text-sm text-muted-foreground">{tr(locale, result ? "No published profiles." : "Profiles are temporarily unavailable.")}</p>}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => {
            const name = localized(locale, leader.name, leader.nameBn);
            return (
            <Card key={leader.id}>
              <CardContent className="p-6">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand font-display text-lg font-semibold text-primary-foreground shadow-soft">
                  {initials(leader.name)}
                </span>
                <h3 lang={name.lang} className="mt-5 font-display text-xl font-semibold text-foreground"><Link href={localePath(locale, `/administration/${encodeURIComponent(leader.slug)}`)}>{name.text}</Link></h3>
                <p lang="en" className="mt-2 text-sm font-semibold text-primary">{leader.designation}</p>
                {leader.bio && <p lang="en" className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{leader.bio}</p>}
              </CardContent>
            </Card>
          ); })}
        </div>
      </div>
    </section>
  );
}
