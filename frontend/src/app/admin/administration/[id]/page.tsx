import { AdminContentDetail } from "@/features/cms/AdminContent";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AdminContentDetail resource="administration" id={(await params).id} />;
}
