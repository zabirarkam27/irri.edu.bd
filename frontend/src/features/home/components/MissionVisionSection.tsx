import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { loadInstitution } from "@/features/home/institution";
import { requestLocale } from "@/lib/request-locale";
import { localized, tr } from "@/lib/locale";

export async function MissionVisionSection() {
  const [institution, { locale }] = await Promise.all([loadInstitution(), requestLocale()]);
  if (!institution.mission && !institution.vision) return null;
  const mission = localized(locale, institution.mission, institution.missionBn);
  const vision = localized(locale, institution.vision, institution.visionBn);
  return (
    <section className="border-y border-border bg-surface">
      <div className="container-x py-16 md:py-20 lg:py-24">
        <SectionHeader title="Mission and Vision" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card className="bg-gradient-brand text-primary-foreground">
            <CardContent className="p-7">
              <h3 className="font-display text-2xl font-semibold">{tr(locale, "Mission")}</h3>
              <p lang={mission.lang} className="mt-4 text-base leading-relaxed">{mission.text}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-7">
              <h3 className="font-display text-2xl font-semibold">{tr(locale, "Vision")}</h3>
              <p lang={vision.lang} className="mt-4 text-base leading-relaxed text-muted-foreground">{vision.text}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
