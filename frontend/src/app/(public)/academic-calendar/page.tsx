import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Academic calendar", "Academic calendar at IRRI.", "/academic-calendar", "en");

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="academic-calendar" searchParams={searchParams} />;
}
