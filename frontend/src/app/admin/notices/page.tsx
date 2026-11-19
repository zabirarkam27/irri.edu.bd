import { AdminContentList } from "@/features/cms/AdminContent";
import type { SearchParams } from "@/features/cms/config";

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <AdminContentList resource="notices" searchParams={searchParams} />;
}
