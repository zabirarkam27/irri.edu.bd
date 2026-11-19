import { DetailPage, publicContentMetadata } from "@/features/public/DetailPage";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return publicContentMetadata("events", slug, `/events/${encodeURIComponent(slug)}`);
}
export default async function Page({ params }: Props) {
  return <DetailPage type="events" slug={(await params).slug} />;
}
