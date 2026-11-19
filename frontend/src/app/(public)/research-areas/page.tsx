import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Research areas", "Research areas at IRRI.", "/research-areas", "en");

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="research-areas" searchParams={searchParams} />;
}
