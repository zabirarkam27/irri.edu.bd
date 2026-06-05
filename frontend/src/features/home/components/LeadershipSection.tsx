import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { leaders } from "@/features/home/data";

function initials(name: string) {
  return name
    .replace("Late ", "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export function LeadershipSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Administration" title="Leadership and institute administration" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <Card key={leader.name}>
              <CardContent className="p-6">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand font-display text-lg font-semibold text-primary-foreground shadow-soft">
                  {initials(leader.name)}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em] text-foreground">{leader.name}</h3>
                <p className="mt-2 text-sm font-semibold text-primary">{leader.designation}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{leader.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
