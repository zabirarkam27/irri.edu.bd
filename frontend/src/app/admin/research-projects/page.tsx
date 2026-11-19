import { AdminContentList } from "@/features/cms/AdminContent";
import type { SearchParams } from "@/features/cms/config";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <AdminContentList resource="research-projects" searchParams={searchParams}/>;
}
