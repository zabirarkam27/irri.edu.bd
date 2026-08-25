import { SectionHeader } from "@/components/shared/SectionHeader";

const tiles = ["Patisar campus", "Research archive", "Cultural program", "Scholarly seminar", "Library reading room", "Documentation lab", "Publication desk", "Cultural courtyard"];

export function GalleryPreview() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader eyebrow="Gallery" title="Campus, culture, and archive moments" href="/gallery" />
        <div className="mt-8 grid auto-rows-[170px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((item, index) => (
            <div key={item} className={index === 0 || index === 5 ? "group relative overflow-hidden rounded-2xl border border-border bg-gradient-brand shadow-soft sm:col-span-2 sm:row-span-2" : "group relative overflow-hidden rounded-2xl border border-border bg-gradient-brand-soft shadow-soft"}>
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--success)/0.22),transparent_35%),linear-gradient(135deg,hsl(var(--primary)/0.92),hsl(var(--primary-pressed)/0.92))]" />
              </div>
              <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/25" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-sm font-semibold text-primary-foreground">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
