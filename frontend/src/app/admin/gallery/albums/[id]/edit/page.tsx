import { AdminContentEditor } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentEditor resource="gallery" id={(await params).id} />;
}
