import { publicMetadata } from "@/lib/seo";
import { requestLocale } from "@/lib/request-locale";
import type { SearchParams } from "@/features/cms/config";
import { PublicPage } from "@/features/public/PublicPage";
export async function generateMetadata() {
  return publicMetadata("Notices", "Read the latest published institute notices.", "/notices", (await requestLocale()).locale);
}
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="notices" searchParams={searchParams} />;
}
