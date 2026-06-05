import { CheckCircle2, Feather, Music, ScrollText } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";

const points = ["Literature and philosophy", "Music and cultural practice", "Archive documentation", "Humanistic values"];

export function TagoreLegacySection() {
  return (
    <section className="bg-background">
      <div className="container-x grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-brand-soft p-8 shadow-soft">
          <div className="grid h-full min-h-[340px] place-items-center rounded-xl border border-border bg-surface/70 p-8 text-center">
            <div>
              <Feather className="mx-auto h-14 w-14 text-primary" strokeWidth={2} />
              <p className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground">Rabindranath Tagore Legacy</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">An academic horizon for Bengali literature, music, philosophy, and culture.</p>
            </div>
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="Legacy" title="A living academic tradition for Tagore studies" />
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            IRRI presents Tagore studies through a calm academic interface while supporting archives, publications, events, notices, galleries, and bilingual content for future English and Bengali experiences.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {points.map((point, index) => {
              const icons = [ScrollText, Music, Feather, CheckCircle2];
              const Icon = icons[index];
              return (
                <li key={point} className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="pt-2 text-sm font-semibold text-foreground">{point}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
