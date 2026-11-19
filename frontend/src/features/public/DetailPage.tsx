import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { Container } from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import { createMetadata, publicMetadata } from "@/lib/seo";
import { newsRequest, NewsRequestError } from "@/features/news/data";
import { formValue, type CmsRecord } from "@/features/cms/config";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { publicNav } from "@/config/nav";
import { contentPath, institutionPages } from "./paths";
import { requestLocale } from "@/lib/request-locale";
import { localePath, localized, tr, type Locale } from "@/lib/locale";
import { loadInstitution } from "@/features/home/institution";
import { SiteShell } from "@/components/site/SiteShell";
import { CopyCitation } from "./CopyCitation";

const academicFields = [
  ["unitType", "Unit type"], ["location", "Location"], ["objectives", "Objectives"], ["programType", "Program type"],
  ["deliveryMode", "Delivery mode"], ["eligibility", "Eligibility"], ["admissions", "Admissions"], ["applicationStatus", "Application status"],
  ["outcomes", "Learning outcomes"], ["education", "Education"], ["interests", "Research interests"], ["projectStatus", "Project status"],
  ["publicFunding", "Funding"], ["outputs", "Outputs"], ["publicationType", "Publication type"], ["authors", "Authors"],
  ["editors", "Editors"], ["keywords", "Keywords"], ["isbn", "ISBN"], ["issn", "ISSN"], ["doi", "DOI"],
  ["publisher", "Publisher"], ["journal", "Journal"], ["language", "Language"], ["version", "Version"],
  ["rightsStatement", "Rights statement"]
];
type RelatedGroup = { label: string; path: string; records: { id: string; slug: string; title: string; titleBn?: string }[] };

export const loadPublicRecord = cache(async (type: string, slug: string) => {
  try {
    return (await newsRequest<CmsRecord>(`/${type}/${encodeURIComponent(slug)}`)).data;
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 404) {
      if (type === "pages" && institutionPages.includes(slug)) return null;
      notFound();
    }
    throw error;
  }
});

export function publicAsset(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = value.startsWith("/uploads/") || /^\/api\/v1\/media\/files\/[a-z0-9-]{1,80}$/i.test(value)
      ? new URL(value, siteConfig.apiBaseUrl) : new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function publicThumbnail(value: unknown) {
  const url = publicAsset(value);
  return url && typeof value === "string" && value.startsWith("/api/v1/media/files/") ? `${url}?thumb=1` : url;
}

function dateLabel(value: unknown, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : null;
  return date && Number.isFinite(date.getTime())
    ? `${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(date)} ${locale === "bn" ? "ঢাকা সময়" : "Dhaka time"}` : "";
}

export async function publicContentMetadata(type: string, slug: string, path: string) {
  const [record, { locale }] = await Promise.all([loadPublicRecord(type, slug), requestLocale()]);
  if (!record) {
    const title = publicNav.find(({ href }) => href === `/${slug}`)?.label ?? slug;
    return publicMetadata(title, `${title} at ${siteConfig.name}.`, `/${slug}`, locale);
  }
  const translatedTitle = formValue(record.titleBn ?? record.nameBn);
  const translatedBody = formValue(record.contentBn);
  const bilingual = Boolean(translatedTitle.trim() || translatedBody.trim());
  const canonicalPath = contentPath(type === "pages" ? type : path.split("/")[1], formValue(record.slug) || slug);
  const title = locale === "bn" && translatedTitle ? translatedTitle : formValue(record.seoTitle || record.title || record.name);
  const description = locale === "bn" && translatedBody ? translatedBody.slice(0, 160) :
    formValue(record.metaDescription || record.excerpt || record.description || record.abstract || record.bio || record.content).slice(0, 160);
  const meta = createMetadata(title, description || undefined, canonicalPath, bilingual ? locale : "en", bilingual);
  const image = publicAsset(record.ogImage);
  return { ...meta, openGraph: { ...meta.openGraph, ...(image ? { images: [image] } : {}) } };
}

export async function DetailPage({ type, slug }: { type: string; slug: string }) {
  const [record, { locale, path }] = await Promise.all([loadPublicRecord(type, slug), requestLocale()]);
  if (!record) {
    if (path === `/pages/${slug}`) permanentRedirect(localePath(locale, `/${slug}`));
    return <InstitutionPage slug={slug} locale={locale} />;
  }
  const base = { programs: "academic-programs", people: "administration", "gallery-albums": "gallery" }[type] ?? type;
  if (typeof record.slug === "string") {
    const canonical = contentPath(base, record.slug);
    if (record.slug !== slug || (type === "pages" && path.startsWith("/pages/") && canonical !== path)) {
      permanentRedirect(localePath(locale, canonical));
    }
  }
  const title = localized(locale, formValue(record.title ?? record.name), formValue(record.titleBn ?? record.nameBn));
  const body = localized(locale, formValue(record.content ?? record.abstract ?? record.description ?? record.bio), formValue(record.contentBn));
  const start = dateLabel(record.startsAt ?? record.publishedAt, locale);
  const end = dateLabel(record.endsAt, locale);
  const file = publicAsset(record.fileUrl);
  const photo = publicAsset(record.photoUrl);
  const images = Array.isArray(record.images) ? record.images : [];
  const related = Array.isArray(record.related) ? record.related as RelatedGroup[] : [];
  const rows = academicFields.map(([key, label]) => [label, formValue(record[key])]).filter(([, value]) => value);
  const officialEmail = formValue(record.officialEmail);
  const external = publicAsset(record.externalUrl);
  const citation = formValue(record.citation);
  const expiry = dateLabel(record.expiresAt, locale);
  const downloadLabel = type === "publications" ? "Open publication" : type === "courses" ? "Download syllabus" :
    type === "programs" ? "Download brochure" : "Download document";
  return <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1}>
      <div lang={title.lang}><PageHero title={title.text} description={locale === "en" ? formValue(record.excerpt || record.designation) : ""} /></div>
      <Container className="grid gap-6 py-12">
        <Breadcrumbs items={[
          ...(type === "pages" ? [] : [{ label: publicNav.find(({ href }) => href === `/${base}`)?.label ?? base, href: `/${base}` }]),
          { label: title.text }
        ]} />
        {(start || end) && <p className="text-sm text-muted-foreground">{start}{end && ` · ${end}`}</p>}
        <article className="grid max-w-3xl gap-4">
          {photo && <img src={photo} alt={title.text} width={320} height={320} className="h-auto max-w-full rounded-md" />}
          {locale === "bn" && (title.lang === "en" || (body.text && body.lang === "en")) &&
            <p className="text-sm text-muted-foreground">{tr(locale, "Some content is available in English only.")}</p>}
          {[record.venue, !record.authors && record.author, record.level, record.duration, record.code,
            record.credits != null ? `${locale === "bn" ? "ক্রেডিট" : "Credits"}: ${record.credits}` : null].filter(Boolean).map((value, i) => <p key={i}>{formValue(value)}</p>)}
          {body.text && <p lang={body.lang} className="whitespace-pre-wrap break-words">{body.text}</p>}
          {Boolean(rows.length || officialEmail || expiry) && <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => <div key={label} className="min-w-0">
              <dt className="text-sm font-semibold">{tr(locale, label)}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd>
            </div>)}
            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail) && <div className="min-w-0">
              <dt className="text-sm font-semibold">{tr(locale, "Official email")}</dt>
              <dd><a href={`mailto:${encodeURIComponent(officialEmail).replace("%40", "@")}`} className="break-words underline">{officialEmail}</a></dd>
            </div>}
            {expiry && <div><dt className="text-sm font-semibold">{tr(locale, "Expires")}</dt><dd>{expiry}</dd></div>}
          </dl>}
          {file && <div className="flex flex-wrap gap-4">
            {type === "academic-assets" && <a className="w-fit underline" href={`${file}?preview=1`} target="_blank" rel="noopener noreferrer">{tr(locale, "Preview PDF")}</a>}
            <a className="w-fit underline" href={file}>{tr(locale, downloadLabel)}</a>
          </div>}
          {external && <a className="w-fit underline" href={external}>{tr(locale, "External link")}</a>}
          {citation && <section className="grid gap-2 border-t pt-4">
            <h2 className="font-semibold">{tr(locale, "Citation")}</h2>
            <p className="whitespace-pre-wrap break-words">{citation}</p>
            <CopyCitation value={citation} locale={locale} />
          </section>}
        </article>
        {images.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const url = publicAsset(image.url);
            return url && <figure key={image.id}>
              <img src={publicThumbnail(image.url)} alt={formValue(image.altText)} width={640} height={400} loading="lazy" className="aspect-[8/5] w-full rounded-md object-cover" />
              {image.caption && <figcaption className="mt-2 text-sm">{image.caption}</figcaption>}
            </figure>;
          })}
        </div>}
        {related.map((group) => <section key={group.label} className="grid gap-2 border-t pt-4">
          <h2 className="font-semibold">{tr(locale, group.label)}</h2>
          <ul className="grid gap-2">{group.records.map((item) => <li key={item.id}>
            <Link href={localePath(locale, contentPath(group.path, item.slug))} className="break-words underline">{localized(locale, item.title, item.titleBn).text}</Link>
          </li>)}</ul>
        </section>)}
      </Container>
    </main>
    <SiteFooter />
  </>;
}

async function InstitutionPage({ slug, locale }: { slug: string; locale: Locale }) {
  const institution = slug === "research" ? null : await loadInstitution();
  const title = tr(locale, publicNav.find(({ href }) => href === `/${slug}`)?.label ?? slug);
  const rows = institution && (slug === "history"
    ? [["Established", institution.established, null], ["Operations started", institution.approved, null]]
    : slug === "mission-vision" ? [["Mission", institution.mission, institution.missionBn], ["Vision", institution.vision, institution.visionBn]]
    : [["Institute", institution.name, institution.nameBn], ["Location", institution.location, null], ["Mission", institution.mission, institution.missionBn]]);
  return <SiteShell>
    <PageHero title={title} description="" />
    <Container className="grid gap-6 py-12">
      <Breadcrumbs items={[{ label: title }]} />
      {rows ? <dl className="grid max-w-3xl gap-5">
        {rows.filter(([, value]) => value).map(([label, original, translation]) => {
          const value = localized(locale, original!, translation);
          return <div key={label}>
            <dt className="font-semibold">{tr(locale, label!)}</dt>
            <dd lang={value.lang} className="mt-1 whitespace-pre-wrap break-words">{value.text}</dd>
          </div>;
        })}
      </dl> : <Link href={localePath(locale, "/publications")} className="w-fit underline">{tr(locale, "Publications")}</Link>}
    </Container>
  </SiteShell>;
}
