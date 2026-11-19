import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { HeroSection } from "@/features/home/components/HeroSection";
import { InstituteGlance } from "@/features/home/components/InstituteGlance";
import { MissionVisionSection } from "@/features/home/components/MissionVisionSection";
import { LeadershipSection } from "@/features/home/components/LeadershipSection";
import { AcademicResearchSection } from "@/features/home/components/AcademicResearchSection";
import { GalleryPreview } from "@/features/home/components/GalleryPreview";
import { ContentPreviews } from "@/features/home/components/ContentPreviews";
import { ContactCTA } from "@/features/home/components/ContactCTA";
import { requestLocale } from "@/lib/request-locale";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function generateMetadata() {
  const { locale } = await requestLocale();
  return createMetadata(locale === "bn" ? siteConfig.nameBn : siteConfig.name,
    locale === "bn" ? "আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউটের প্রকাশিত তথ্য, গবেষণা ও শিক্ষাক্রম।" : siteConfig.description, "/", locale);
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <InstituteGlance />
        <MissionVisionSection />
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
