import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { institution } from "@/features/home/data";

export function MissionVisionSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Purpose" title="Mission and Vision" description={institution.motto} />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card className="bg-gradient-brand text-primary-foreground">
            <CardContent className="p-7">
              <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">Mission</h3>
              <p className="mt-4 text-base leading-relaxed text-primary-foreground/85">{institution.mission}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-7">
              <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">Vision</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{institution.vision}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
