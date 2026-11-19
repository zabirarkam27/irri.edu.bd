import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return publicContentMetadata("research-areas", slug, "/research-areas");
}

export default async function Page({ params }: Props) {
  return <DetailPage type="research-areas" slug={(await params).slug} />;
}
