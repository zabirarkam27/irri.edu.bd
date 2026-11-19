import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { newsRequest } from "@/features/news/data";
import { publicThumbnail } from "@/features/public/DetailPage";
import { requestLocale } from "@/lib/request-locale";
import { localePath, localized, tr } from "@/lib/locale";

export async function GalleryPreview() {
  const [{ locale }, result] = await Promise.all([requestLocale(), newsRequest<{
    id: string; title: string; titleBn?: string; slug: string; images: { url: string; altText: string }[];
  }[]>("/gallery-albums?limit=4").catch(() => null)]);
  return <section className="border-y border-border bg-surface">
    <div className="container-x py-16 md:py-20 lg:py-24">
      <SectionHeader title="Gallery" href="/gallery" />
      {!result?.data.length && <p className="mt-4 text-sm text-muted-foreground">{tr(locale, result ? "No published albums." : "Albums are temporarily unavailable.")}</p>}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {result?.data.map((album) => {
          const image = album.images[0];
          const url = publicThumbnail(image?.url);
          const title = localized(locale, album.title, album.titleBn);
          return <li key={album.id}>
            <Link className="grid gap-2 font-semibold underline" href={localePath(locale, `/gallery/${encodeURIComponent(album.slug)}`)}>
              {url && <img src={url} alt={image.altText} width={400} height={250} loading="lazy" className="aspect-[8/5] w-full rounded-md object-cover" />}
              <span lang={title.lang}>{title.text}</span>
            </Link>
          </li>;
        })}
      </ul>
    </div>
  </section>;
}
