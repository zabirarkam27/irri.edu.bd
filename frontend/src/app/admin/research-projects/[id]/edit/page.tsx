import { AdminContentEditor } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentEditor resource="research-projects" id={(await params).id}/>;
}
