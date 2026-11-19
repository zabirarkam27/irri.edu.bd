import { createMetadata } from "@/lib/seo";
import type { SearchParams } from "@/features/cms/config";
import { PublicPage } from "@/features/public/PublicPage";
export const metadata = createMetadata("Notices");
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="notices" searchParams={searchParams} />;
}
