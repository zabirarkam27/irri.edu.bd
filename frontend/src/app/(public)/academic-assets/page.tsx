import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Repository and resources", "Repository and resources at IRRI.", "/academic-assets", "en");

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="academic-assets" searchParams={searchParams} />;
}
