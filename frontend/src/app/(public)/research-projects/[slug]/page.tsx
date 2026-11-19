import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return publicContentMetadata("research-projects", slug, "/research-projects");
}

export default async function Page({ params }: Props) {
  return <DetailPage type="research-projects" slug={(await params).slug} />;
}
