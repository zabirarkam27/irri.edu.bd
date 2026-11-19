import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Researchers", "Researchers at IRRI.", "/researchers", "en");

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PublicPage slug="researchers" searchParams={searchParams} />;
}
