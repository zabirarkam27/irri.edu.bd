import Link from "next/link";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { DeleteNewsForm } from "@/features/news/NewsForm";
import { loadAdminNews } from "@/features/news/loadAdminNews";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const post = await loadAdminNews((await params).id);
  return (
    <div className="grid max-w-3xl gap-5">
      <AdminPageHeader title={post.title} description={post.status} />
      <div className="flex gap-4 text-sm">
        <Link className="underline" href={`/admin/news/${post.id}/edit`}>Edit</Link>
        {post.status === "PUBLISHED" && <Link className="underline" href={`/news/${encodeURIComponent(post.slug)}`}>Public page</Link>}
      </div>
      <article className="whitespace-pre-wrap break-words">{post.content}</article>
      {post.contentBn && <article lang="bn" className="whitespace-pre-wrap break-words">{post.contentBn}</article>}
      <DeleteNewsForm id={post.id} />
    </div>
  );
}
