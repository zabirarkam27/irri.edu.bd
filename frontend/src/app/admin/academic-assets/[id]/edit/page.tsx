import { AdminContentEditor } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentEditor resource="academic-assets" id={(await params).id}/>;
}
