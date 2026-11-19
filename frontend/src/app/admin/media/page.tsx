import { MediaLibrary } from "@/features/media/MediaLibrary";
import type { SearchParams } from "@/features/cms/config";
export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <MediaLibrary searchParams={searchParams} />;
}
