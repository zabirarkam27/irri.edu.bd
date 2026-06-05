import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { HeroSection } from "@/features/home/components/HeroSection";
import { InstituteGlance } from "@/features/home/components/InstituteGlance";
import { MissionVisionSection } from "@/features/home/components/MissionVisionSection";
import { TagoreLegacySection } from "@/features/home/components/TagoreLegacySection";
import { LeadershipSection } from "@/features/home/components/LeadershipSection";
import { AcademicResearchSection } from "@/features/home/components/AcademicResearchSection";
import { GalleryPreview } from "@/features/home/components/GalleryPreview";
import { ContentPreviews } from "@/features/home/components/ContentPreviews";
import { ContactCTA } from "@/features/home/components/ContactCTA";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <InstituteGlance />
        <MissionVisionSection />
        <TagoreLegacySection />
        <LeadershipSection />
        <AcademicResearchSection />
        <GalleryPreview />
        <ContentPreviews />
        <ContactCTA />
      </main>
      <SiteFooter />
    </>
  );
}
