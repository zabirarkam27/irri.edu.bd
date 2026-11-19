import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadInstitution } from "@/features/home/institution";
import { localePath, localized, tr } from "@/lib/locale";
import { requestLocale } from "@/lib/request-locale";
import { loadPublicRecord, publicAsset } from "@/features/public/DetailPage";

export async function HeroSection() {
  const [institution, { locale }, about] = await Promise.all([
    loadInstitution(), requestLocale(), loadPublicRecord("pages", "about").catch(() => null)
  ]);
  const name = localized(locale, institution.name, institution.nameBn);
  const mission = localized(locale, institution.mission, institution.missionBn);
  const image = publicAsset(about?.ogImage);
  return (
    <section className="relative isolate overflow-hidden bg-primary-pressed text-primary-foreground">
      {image && <>
        <img src={image} alt="" width={1600} height={900} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-foreground/75" />
      </>}
      <div className="container-x grid gap-5 py-12 sm:py-16 lg:py-20">
        {institution.location && <p lang="en" className="flex max-w-3xl items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{institution.location}
        </p>}
        <h1 lang={name.lang} className="max-w-4xl break-words font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{name.text}</h1>
        {mission.text && <p lang={mission.lang} className="max-w-3xl break-words text-base leading-relaxed sm:text-lg">{mission.text}</p>}
        <div className="flex flex-wrap gap-3">
          <Button variant="gold" asChild><Link href={localePath(locale, "/academic-programs")}>
            {tr(locale, "Explore Programs")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link></Button>
          <Button className="border-primary-foreground/60 bg-transparent text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" variant="outline" asChild>
            <Link href={localePath(locale, "/about")}>{tr(locale, "Learn About IRRI")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
