import { Navbar } from "@/components/site/Navbar";
import { requestLocale } from "@/lib/request-locale";

export async function SiteHeader() {
  const { locale, path, query } = await requestLocale();
  return <Navbar locale={locale} path={path} query={query} />;
}
