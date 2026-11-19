import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Research projects", "Research projects at IRRI.", "/research-projects", "en");

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="research-projects" searchParams={searchParams} />;
}
