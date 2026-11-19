import { AdminDirectory } from "@/features/cms/AdminOperations";
import type { SearchParams } from "@/features/cms/config";
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <AdminDirectory kind="audit" searchParams={searchParams} />;
}
