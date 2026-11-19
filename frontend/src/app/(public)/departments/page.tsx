import { PublicPage } from "@/features/public/PublicPage";
import type { SearchParams } from "@/features/cms/config";
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) { return <PublicPage slug="departments" searchParams={searchParams} />; }
