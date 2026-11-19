import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { newsRequest } from "@/features/news/data";
import { publicAsset } from "@/features/public/DetailPage";

export async function GalleryPreview() {
  const result = await newsRequest<{
    id: string; title: string; slug: string; images: { url: string; altText: string }[];
  }[]>("/gallery-albums?limit=4").catch(() => null);
  return <section className="border-y border-border bg-surface">
    <div className="container-x py-16 md:py-20 lg:py-24">
      <SectionHeader eyebrow="Gallery" title="Campus, culture, and archive moments" href="/gallery" />
      {!result?.data.length && <p className="mt-4 text-sm text-muted-foreground">{result ? "No published albums." : "Albums are temporarily unavailable."}</p>}
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {result?.data.map((album) => {
          const image = album.images[0];
          const url = publicAsset(image?.url);
          return <li key={album.id}>
            <Link className="grid gap-2 font-semibold underline" href={`/gallery/${encodeURIComponent(album.slug)}`}>
              {url && <img src={url} alt={image.altText} width={400} height={250} loading="lazy" className="aspect-[8/5] w-full rounded-md object-cover" />}
              {album.title}
            </Link>
          </li>;
        })}
      </ul>
    </div>
  </section>;
}
