import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { requestLocale } from "@/lib/request-locale";
import { tr } from "@/lib/locale";

export default async function Loading() {
  return <LoadingSpinner label={tr((await requestLocale()).locale, "Loading IRRI content")} />;
}
