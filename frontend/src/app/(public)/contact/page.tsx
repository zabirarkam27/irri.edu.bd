import { publicMetadata } from "@/lib/seo";
import { requestLocale } from "@/lib/request-locale";
import { SiteShell } from "@/components/site/SiteShell";
import { loadInstitution } from "@/features/home/institution";
import { ContactPage } from "@/features/contact/ContactPage";
export async function generateMetadata() {
  return publicMetadata("Contact", "Contact the institute about its research, programs, and publications.", "/contact", (await requestLocale()).locale);
}

export default async function Page() {
  const [{ locale }, institution] = await Promise.all([requestLocale(), loadInstitution()]);
  return <SiteShell><ContactPage locale={locale} address={institution.location} /></SiteShell>;
}
