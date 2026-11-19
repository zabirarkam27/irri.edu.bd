import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/shared/Container";
import { PageHero } from "@/components/shared/PageHero";
import { formValue, type CmsRecord, type SearchParams } from "@/features/cms/config";
import { NewsPagination } from "@/features/news/NewsPagination";
import { newsRequest, NewsRequestError } from "@/features/news/data";
import { localePath, localized, tr } from "@/lib/locale";
import { requestLocale } from "@/lib/request-locale";
import { contentPath } from "./paths";

export async function AdmissionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [{ locale }, params] = await Promise.all([requestLocale(), searchParams]);
  const t = (text: string) => tr(locale, text);
  const page = typeof params.page === "string" && /^[1-9]\d{0,6}$/.test(params.page) ? params.page : "1";
  const query = new URLSearchParams({ page, sortBy: "title", sortOrder: "asc" });
  const [guidance, catalogue] = await Promise.all([
    newsRequest<CmsRecord>("/pages/admissions").catch((error: unknown) =>
      error instanceof NewsRequestError && error.status === 404 ? undefined : null),
    newsRequest<CmsRecord[]>(`/programs?${query}`).catch(() => null)
  ]);
  const information = localized(locale, formValue(guidance?.data.content), formValue(guidance?.data.contentBn));
  const helpfulLinks = [
    ["/academic-programs", "Academic Programs"],
    ["/academic-calendar", "Academic calendar"],
    ["/academic-assets?kind=RESOURCE", "Forms and resources"],
    ["/contact", "Contact IRRI"]
  ];

  return <SiteShell>
    <PageHero title={t("Admissions")} description="" />
    <Container className="grid gap-8 py-10">
      <Breadcrumbs items={[{ label: t("Admissions") }]} />
      <section className="grid max-w-3xl gap-3" aria-labelledby="admission-guidance">
        <h2 id="admission-guidance" className="text-xl font-semibold">{t("Admission guidance")}</h2>
        {guidance === null ? <p role="alert">{t("This content is temporarily unavailable.")}</p> :
          information.text ? <p lang={information.lang} className="whitespace-pre-wrap break-words">{information.text}</p> :
            <p className="text-muted-foreground">{t("No admission guidance has been published yet.")}</p>}
      </section>
      <section className="grid gap-4" aria-labelledby="admission-programs">
        <h2 id="admission-programs" className="text-xl font-semibold">{t("Published programs")}</h2>
        {!catalogue ? <p role="alert">{t("This content is temporarily unavailable.")}</p> :
          !catalogue.data.length ? <p className="text-muted-foreground">{t("No published records.")}</p> :
            <ul className="divide-y border-y">
              {catalogue.data.map((program) => {
                const title = localized(locale, formValue(program.title), formValue(program.titleBn));
                const status = formValue(program.applicationStatus);
                return <li key={program.id} className="grid min-w-0 gap-2 py-4">
                  <Link className="w-fit break-words font-semibold underline" lang={title.lang}
                    href={localePath(locale, contentPath("academic-programs", formValue(program.slug)))}>{title.text}</Link>
                  {status && <p className="break-words text-sm text-muted-foreground">{t("Application status")}: <span lang="en">{status}</span></p>}
                </li>;
              })}
            </ul>}
        {catalogue?.meta && <NewsPagination path={localePath(locale, "/admissions")} query={query} locale={locale} {...catalogue.meta} />}
      </section>
      <nav aria-label={t("Admission resources")} className="flex flex-wrap gap-x-5 gap-y-3 border-t pt-5">
        {helpfulLinks.map(([href, label]) => <Link key={href} href={localePath(locale, href)} className="underline">{t(label)}</Link>)}
      </nav>
    </Container>
  </SiteShell>;
}
