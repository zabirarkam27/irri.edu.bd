import { AdminContentEditor } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentEditor resource="notices" id={(await params).id} />;
}
