import { AdminContentDetail } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentDetail resource="departments" id={(await params).id} />;
}
