import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/shared/PageHero";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { Container } from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { newsRequest, NewsRequestError } from "@/features/news/data";
import { formValue, type CmsRecord } from "@/features/cms/config";

export const loadPublicRecord = cache(async (type: string, slug: string) => {
  try {
    return (await newsRequest<CmsRecord>(`/${type}/${encodeURIComponent(slug)}`)).data;
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 404) notFound();
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

const utc = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
function dateLabel(value: unknown) {
  const date = typeof value === "string" ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? `${utc.format(date)} UTC` : "";
}

export async function publicContentMetadata(type: string, slug: string, path: string) {
  const record = await loadPublicRecord(type, slug);
  const meta = createMetadata(formValue(record.seoTitle || record.title || record.name),
    formValue(record.metaDescription || record.excerpt || record.description) || undefined);
  const navigationSlug = type === "pages" && ["about", "history", "mission-vision", "research"].includes(formValue(record.slug));
  const canonical = new URL(navigationSlug ? `/${record.slug}` : path, siteConfig.url).href;
  const image = publicAsset(record.ogImage);
  return { ...meta, alternates: { canonical }, openGraph: { ...meta.openGraph, url: canonical, ...(image ? { images: [image] } : {}) } };
}

export async function DetailPage({ type, slug }: { type: string; slug: string }) {
  const record = await loadPublicRecord(type, slug);
  const base = { programs: "academic-programs", people: "administration", "gallery-albums": "gallery" }[type] ?? type;
  if (typeof record.slug === "string" && record.slug !== slug) permanentRedirect(`/${base}/${encodeURIComponent(record.slug)}`);
  const title = formValue(record.title ?? record.name);
  const start = dateLabel(record.startsAt ?? record.publishedAt);
  const end = dateLabel(record.endsAt);
  const file = publicAsset(record.fileUrl);
  const photo = publicAsset(record.photoUrl);
  const images = Array.isArray(record.images) ? record.images : [];
  const relatedQuery = type === "programs" ? { resource: "courses", filter: "programId", path: "courses", title: "Related courses" }
    : type === "departments" ? { resource: "programs", filter: "departmentId", path: "academic-programs", title: "Department programs" } : null;
  const related = relatedQuery && await newsRequest<CmsRecord[]>(
    `/${relatedQuery.resource}?${new URLSearchParams({ [relatedQuery.filter]: record.id, limit: "6" })}`
  ).catch(() => null);
  return <>
    <SiteHeader />
    <main>
      <PageHero title={title} description={formValue(record.excerpt || record.designation)} />
      <Container className="grid gap-6 py-12">
        {type !== "pages" && <Link href={`/${base}`} className="w-fit text-sm underline">Back to list</Link>}
        {(start || end) && <p className="text-sm text-muted-foreground">{start}{end && ` to ${end}`}</p>}
        <article className="grid max-w-3xl gap-4">
          {photo && <img src={photo} alt={title} width={320} height={320} className="h-auto max-w-full rounded-md" />}
          {formValue(record.titleBn ?? record.nameBn) && <p lang="bn" className="text-xl">{formValue(record.titleBn ?? record.nameBn)}</p>}
          {[record.venue, record.author, record.level, record.duration, record.code,
            record.credits != null ? `Credits: ${record.credits}` : null].filter(Boolean).map((value, i) => <p key={i}>{formValue(value)}</p>)}
          <p className="whitespace-pre-wrap break-words">{formValue(record.content ?? record.abstract ?? record.description ?? record.bio)}</p>
          {formValue(record.contentBn) && <p lang="bn" className="whitespace-pre-wrap break-words">{formValue(record.contentBn)}</p>}
          {file && <a className="w-fit underline" href={file}>Open publication</a>}
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
        {relatedQuery && Boolean(related?.data.length) && <section className="grid gap-2 border-t pt-4">
          <h2 className="font-semibold">{relatedQuery.title}</h2>
          <ul className="grid gap-2">{related?.data.map((item) => <li key={item.id}>
            <Link href={`/${relatedQuery.path}/${encodeURIComponent(formValue(item.slug))}`} className="underline">{formValue(item.title)}</Link>
          </li>)}</ul>
        </section>}
      </Container>
    </main>
    <SiteFooter />
  </>;
}
