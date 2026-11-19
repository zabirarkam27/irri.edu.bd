import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";
import { requestLocale } from "@/lib/request-locale";

export async function generateMetadata() {
  return publicMetadata("Departments", "Browse the institute's published departments.", "/departments", (await requestLocale()).locale);
}
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) { return <PublicPage slug="departments" searchParams={searchParams} />; }
