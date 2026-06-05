import { PageHero as SitePageHero } from "@/components/site/PageHero";

export function PageHero({ title, description }: { title: string; description: string }) {
  return <SitePageHero title={title} description={description} />;
}
