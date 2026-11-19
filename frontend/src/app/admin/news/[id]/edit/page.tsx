import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { NewsForm } from "@/features/news/NewsForm";
import { loadAdminNews } from "@/features/news/loadAdminNews";
import { redirect } from "next/navigation";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const post = await loadAdminNews((await params).id);
  if (post.status !== "DRAFT") redirect(`/admin/news/${post.id}`);
  return <div className="grid gap-5"><AdminPageHeader title="Edit news post" description={post.title} /><NewsForm post={post} /></div>;
}
