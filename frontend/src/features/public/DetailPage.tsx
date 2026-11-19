import { cache } from "react";
import { notFound } from "next/navigation";
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
    const url = value.startsWith("/uploads/") ? new URL(value, siteConfig.apiBaseUrl) : new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
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
  const title = formValue(record.title ?? record.name);
  const start = dateLabel(record.startsAt ?? record.publishedAt);
  const end = dateLabel(record.endsAt);
  const file = publicAsset(record.fileUrl);
  const photo = publicAsset(record.photoUrl);
  const images = Array.isArray(record.images) ? record.images : [];
  const base = { programs: "academic-programs", people: "administration", "gallery-albums": "gallery" }[type] ?? type;
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
              <img src={url} alt={formValue(image.altText)} width={640} height={400} loading="lazy" className="aspect-[8/5] w-full rounded-md object-cover" />
              {image.caption && <figcaption className="mt-2 text-sm">{image.caption}</figcaption>}
            </figure>;
          })}
        </div>}
      </Container>
    </main>
    <SiteFooter />
  </>;
}
