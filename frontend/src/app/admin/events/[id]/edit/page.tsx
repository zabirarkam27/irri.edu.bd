import { AdminContentEditor } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentEditor resource="events" id={(await params).id} />;
}
