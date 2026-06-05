export function PageHero({ eyebrow = "IRRI", title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <section className="border-b border-border bg-gradient-brand-soft">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
      </div>
    </section>
  );
}
