import { publicMetadata } from "@/lib/seo";
import { requestLocale } from "@/lib/request-locale";
import type { SearchParams } from "@/features/cms/config";
import { PublicPage } from "@/features/public/PublicPage";
export async function generateMetadata() {
  return publicMetadata("Gallery", "Explore published galleries and image captions.", "/gallery", (await requestLocale()).locale);
}
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="gallery" searchParams={searchParams} />;
}
