import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { NewsForm } from "@/features/news/NewsForm";
import { loadAdminNews } from "@/features/news/loadAdminNews";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const post = await loadAdminNews((await params).id);
  return <div className="grid gap-5"><AdminPageHeader title="Edit news post" description={post.title} /><NewsForm post={post} /></div>;
}
