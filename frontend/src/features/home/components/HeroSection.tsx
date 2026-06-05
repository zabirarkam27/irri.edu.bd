import Link from "next/link";
import { ArrowRight, BookOpen, Landmark, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { institution } from "@/features/home/data";

const stats = [
  ["Established", institution.established],
  ["Departments", "3+"],
  ["Degree Levels", "Honors · Masters · PhD"]
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-brand text-primary-foreground">
      <svg className="absolute inset-0 h-full w-full opacity-10" aria-hidden="true">
        <defs>
          <pattern id="hero-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="container-x relative grid gap-12 py-16 md:py-20 lg:grid-cols-12 lg:py-24">
        <div className="flex flex-col justify-center lg:col-span-7">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground/90">
            <Landmark className="h-4 w-4" strokeWidth={2} />
            Est. 2014 · Patisar, Naogaon, Bangladesh
          </div>
          <h1 className="mt-6 max-w-5xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
            {institution.name}
          </h1>
          <p lang="bn" className="mt-4 font-bn text-xl text-primary-foreground/90 sm:text-2xl">
            {institution.nameBn}
          </p>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            {institution.mission}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="gold" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/academic-programs">
                Explore Programs <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 sm:w-auto" asChild>
              <Link href="/about">Learn About IRRI</Link>
            </Button>
          </div>
          <dl className="mt-10 grid gap-3 sm:grid-cols-3">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/65">{label}</dt>
                <dd className="mt-2 text-sm font-semibold text-primary-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-pressed shadow-lifted">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--success)/0.28),transparent_30%),linear-gradient(155deg,hsl(var(--primary-pressed)),hsl(var(--primary)))]" />
            <div className="absolute inset-0 grid place-items-center p-10 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-primary-foreground/50" strokeWidth={2} />
              <p className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-primary-foreground">
                Tagore studies rooted in history, culture, and human values.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/55 to-transparent p-6">
              <Quote className="h-5 w-5 text-primary-foreground/75" strokeWidth={2} />
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/90">
                Research, documentation, education, and cultural practice in one academic home.
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-border bg-card p-5 text-foreground shadow-lifted lg:absolute lg:-bottom-6 lg:-left-6 lg:mt-0 lg:max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Motto</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{institution.motto}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
