import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return publicContentMetadata("pages", slug, `/pages/${encodeURIComponent(slug)}`);
}
export default async function Page({ params }: Props) { return <DetailPage type="pages" slug={(await params).slug} />; }
