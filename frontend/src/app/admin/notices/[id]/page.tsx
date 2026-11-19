import { AdminContentDetail } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentDetail resource="notices" id={(await params).id} />;
}
