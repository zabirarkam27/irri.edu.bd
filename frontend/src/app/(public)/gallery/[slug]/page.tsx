import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return publicContentMetadata("gallery-albums", slug, `/gallery/${encodeURIComponent(slug)}`);
}
export default async function Page({ params }: Props) {
  return <DetailPage type="gallery-albums" slug={(await params).slug} />;
}
