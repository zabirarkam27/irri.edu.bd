import { AdmissionsPage } from "@/features/public/AdmissionsPage";
import type { SearchParams } from "@/features/cms/config";
import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Admissions", "Official admission guidance and published programs at IRRI.", "/admissions", "en");

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <AdmissionsPage searchParams={searchParams} />;
}
