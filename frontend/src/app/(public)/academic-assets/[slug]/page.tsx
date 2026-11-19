import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return publicContentMetadata("academic-assets", slug, "/academic-assets");
}

export default async function Page({ params }: Props) {
  return <DetailPage type="academic-assets" slug={(await params).slug} />;
}
