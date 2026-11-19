import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import Link from "next/link";
import { newsRequest } from "@/features/news/data";

function initials(name: string) {
  return name
    .replace("Late ", "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export async function LeadershipSection() {
  const result = await newsRequest<{ id: string; name: string; slug: string; designation: string; bio?: string }[]>(
    "/people?type=ADMINISTRATION&sortBy=order&sortOrder=asc&limit=6"
  ).catch(() => null);
  const leaders = result?.data ?? [];
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Administration" title="Leadership and institute administration" />
        {!leaders.length && <p className="mt-4 text-sm text-muted-foreground">{result ? "No published profiles." : "Profiles are temporarily unavailable."}</p>}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <Card key={leader.id}>
              <CardContent className="p-6">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand font-display text-lg font-semibold text-primary-foreground shadow-soft">
                  {initials(leader.name)}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground"><Link href={`/administration/${encodeURIComponent(leader.slug)}`}>{leader.name}</Link></h3>
                <p className="mt-2 text-sm font-semibold text-primary">{leader.designation}</p>
                {leader.bio && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{leader.bio}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
