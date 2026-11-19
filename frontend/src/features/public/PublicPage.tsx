import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { Container } from "@/components/shared/Container";
import { NewsPagination } from "@/features/news/NewsPagination";
import { newsRequest } from "@/features/news/data";
import { formValue, type CmsRecord, type SearchParams } from "@/features/cms/config";
import { DetailPage } from "./DetailPage";
import { requestLocale } from "@/lib/request-locale";
import { localePath, localized, tr } from "@/lib/locale";

export const collections: Record<string, { api: string; title: string }> = {
  administration: { api: "people", title: "Administration" },
  "academic-programs": { api: "programs", title: "Academic Programs" },
  courses: { api: "courses", title: "Courses" },
  departments: { api: "departments", title: "Departments" },
  gallery: { api: "gallery-albums", title: "Gallery" },
  publications: { api: "publications", title: "Publications" },
  researchers: { api: "people", title: "Researchers" },
  "research-areas": { api: "research-areas", title: "Research areas" },
  "research-projects": { api: "research-projects", title: "Research projects" },
  "academic-assets": { api: "academic-assets", title: "Repository and resources" },
  "academic-calendar": { api: "events", title: "Academic calendar" },
  notices: { api: "notices", title: "Notices" },
  events: { api: "events", title: "Events" }
};

export async function PublicPage({ slug, searchParams }: { slug: string; searchParams?: Promise<SearchParams> }) {
  const collection = collections[slug];
  if (!collection) return <DetailPage type="pages" slug={slug} />;
  const [params, { locale }] = await Promise.all([searchParams, requestLocale()]);
  const t = (text: string) => tr(locale, text);
  const page = typeof params?.page === "string" && /^[1-9]\d{0,6}$/.test(params.page) ? params.page : "1";
  const query = new URLSearchParams({ page });
  const read = (key: string, max = 80) => typeof params?.[key] === "string" ? params[key].trim().slice(0, max) : "";
  const search = read("search", 200);
  if (search) query.set("search", search);
  const assetList = slug === "academic-assets";
  const departmentFilter = ["researchers", "courses", "academic-programs", "research-areas", "research-projects", "publications"].includes(slug);
  const calendar = slug === "academic-calendar";
  const kind = read("kind");
  if (assetList && ["RESOURCE", "REPOSITORY"].includes(kind)) query.set("kind", kind);
  for (const key of assetList ? ["language", "categoryId"] : departmentFilter ? ["departmentId", ...(slug === "publications" ? ["publicationType"] : [])] : []) {
    const value = read(key);
    if (value) query.set(key, value);
  }
  if (slug === "researchers") query.set("type", read("type") === "FACULTY" ? "FACULTY" : "RESEARCHER");
  if (calendar) {
    query.set("academicCalendar", "true");
    query.set("sortBy", "startsAt");
    query.set("sortOrder", "asc");
  }
  if (slug === "administration") {
    query.set("sortBy", "order");
    query.set("sortOrder", "asc");
    query.set("type", "ADMINISTRATION");
  }
  const [result, options] = await Promise.all([
    newsRequest<CmsRecord[]>(`/${collection.api}?${query}`).catch(() => null),
    assetList || departmentFilter ? newsRequest<CmsRecord[]>(`/${assetList ? "categories" : "departments"}?limit=100&sortBy=name&sortOrder=asc`).catch(() => null) : null
  ]);
  const optionKey = assetList ? "categoryId" : "departmentId";
  const detailBase = slug === "researchers" ? "administration" : calendar ? "events" : slug;
  const control = "h-10 max-w-full rounded border bg-background px-3";
  return <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <PageHero title={t(collection.title)} description="" />
      <Container className="grid gap-6 py-12">
        {slug === "academic-programs" && <Link href={localePath(locale, "/departments")} className="w-fit underline">{t("Departments")}</Link>}
        {calendar && <a className="w-fit underline" href="/academic-calendar.ics">{t("Download calendar")}</a>}
        {(assetList || departmentFilter || calendar || slug === "departments") && <form className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-0 gap-1 text-sm">{t("Search terms")}<input name="search" className={control} maxLength={200} defaultValue={search} /></label>
          {assetList && <label className="grid gap-1 text-sm">{t("Content type")}<select name="kind" className={control} defaultValue={query.get("kind") ?? ""}>
            <option value="">{t("All content")}</option><option value="REPOSITORY">{t("Repository")}</option><option value="RESOURCE">{t("Resources")}</option>
          </select></label>}
          {slug === "researchers" && <label className="grid gap-1 text-sm">{t("Profile type")}<select name="type" className={control} defaultValue={query.get("type") ?? "RESEARCHER"}>
            <option value="RESEARCHER">{t("Researchers")}</option><option value="FACULTY">{t("Faculty")}</option>
          </select></label>}
          {Boolean(options?.data.length) && <label className="grid min-w-0 max-w-full gap-1 text-sm">{t(assetList ? "Category" : "Department")}
            <select name={optionKey} className={control} defaultValue={query.get(optionKey) ?? ""}><option value="">{t("All content")}</option>
              {options?.data.map((item) => <option key={item.id} value={item.id}>{localized(locale, formValue(item.name), formValue(item.nameBn)).text}</option>)}
            </select></label>}
          {(assetList || slug === "publications") && <label className="grid min-w-0 gap-1 text-sm">{t(assetList ? "Language" : "Publication type")}
            <input className={control} name={assetList ? "language" : "publicationType"} maxLength={80} defaultValue={query.get(assetList ? "language" : "publicationType") ?? ""} />
          </label>}
          <button className="h-10 rounded bg-primary px-4 text-primary-foreground">{t("Search")}</button>
        </form>}
        {!result ? <p role="alert">{t("This content is temporarily unavailable.")}</p> : !result.data.length ? <p>{t("No published records.")}</p> : (
          <ul className="divide-y border-y">
            {result.data.map((record) => {
              const title = localized(locale, formValue(record.title ?? record.name), formValue(record.titleBn ?? record.nameBn));
              return <li key={record.id} className="grid gap-2 py-4">
              <Link lang={title.lang} className="break-words text-lg font-semibold underline" href={localePath(locale, `/${detailBase}/${encodeURIComponent(formValue(record.slug))}`)}>{title.text}</Link>
              {calendar && typeof record.startsAt === "string" && <time dateTime={record.startsAt} className="text-sm text-muted-foreground">
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(record.startsAt))}
              </time>}
              {formValue(record.designation ?? record.excerpt ?? record.description ?? record.author) && (
                <p lang="en" className="break-words text-muted-foreground">{formValue(record.designation ?? record.excerpt ?? record.description ?? record.author)}</p>
              )}
            </li>; })}
          </ul>
        )}
        {result?.meta && <NewsPagination path={localePath(locale, `/${slug}`)} locale={locale} query={query} {...result.meta} />}
      </Container>
    </main>
    <SiteFooter />
  </>;
}
