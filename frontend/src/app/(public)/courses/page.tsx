import { createMetadata } from "@/lib/seo";
import type { SearchParams } from "@/features/cms/config";
import { PublicPage } from "@/features/public/PublicPage";
export const metadata = createMetadata("Courses");
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="courses" searchParams={searchParams} />;
}
