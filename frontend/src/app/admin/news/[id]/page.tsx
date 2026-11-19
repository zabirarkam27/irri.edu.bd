import Link from "next/link";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { DeleteNewsForm } from "@/features/news/NewsForm";
import { loadAdminNews } from "@/features/news/loadAdminNews";
import { adminNewsRequest, currentAdmin } from "@/features/news/admin";
import { EditorialControls } from "@/features/cms/EditorialControls";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, account, editorial] = await Promise.all([
    loadAdminNews(id), currentAdmin().catch(() => null),
    adminNewsRequest<{ enabled: boolean; schedule: { scheduledAt: string } | null }>(`/${encodeURIComponent(id)}/editorial`).catch(() => null)
  ]);
  return (
    <div className="grid max-w-3xl gap-5">
      <AdminPageHeader title={post.title} description={post.status} />
      <div className="flex gap-4 text-sm">
        {post.status === "DRAFT" && <Link className="underline" href={`/admin/news/${post.id}/edit`}>Edit</Link>}
        {post.status === "PUBLISHED" && <Link className="underline" href={`/news/${encodeURIComponent(post.slug)}`}>Public page</Link>}
      </div>
      <article className="whitespace-pre-wrap break-words">{post.content}</article>
      {post.contentBn && <article lang="bn" className="whitespace-pre-wrap break-words">{post.contentBn}</article>}
      {account && editorial && <EditorialControls resource="news" id={id} status={post.status} role={account.role}
        scheduling={editorial.data.enabled} scheduledAt={editorial.data.schedule?.scheduledAt} />}
      {account && ["ADMIN", "SUPER_ADMIN"].includes(account.role) && ["DRAFT", "ARCHIVED"].includes(post.status) && <DeleteNewsForm id={post.id} />}
    </div>
  );
}
