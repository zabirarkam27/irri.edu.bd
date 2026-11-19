import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { adminNewsRequest } from "@/features/news/admin";
import { newsQuery, newsStatuses, type NewsPost } from "@/features/news/data";
import { NewsPagination } from "@/features/news/NewsPagination";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = newsQuery(await searchParams, true);
  const result = await adminNewsRequest<NewsPost[]>(`?${query}`).catch(() => null);
  return (
    <div className="grid gap-5">
      <AdminPageHeader title="News" description="Manage news posts." />
      <Button asChild className="w-fit"><Link href="/admin/news/new">New post</Link></Button>
      <form className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">Search
          <input name="search" maxLength={200} defaultValue={query.get("search") ?? ""} className="h-10 rounded-md border bg-background px-3" />
        </label>
        <label className="grid gap-1 text-sm">Status
          <select name="status" defaultValue={query.get("status") ?? ""} className="h-10 rounded-md border bg-background px-3">
            <option value="">All statuses</option>
            {newsStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm">Sort
          <select name="sortBy" defaultValue={query.get("sortBy") ?? ""} className="h-10 rounded-md border bg-background px-3">
            <option value="updatedAt">Recently updated</option><option value="title">Title</option>
          </select>
        </label>
        <Button type="submit">Apply</Button>
      </form>
      {!result ? <p role="alert">News could not be loaded. Reload to try again.</p> :
        result.data.length === 0 ? <p>No posts match this view.</p> : (
          <ul className="divide-y border-y">
            {result.data.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 break-words"><p className="font-medium">{post.title}</p><p className="text-sm text-muted-foreground">{post.status}</p></div>
                <div className="flex gap-4 text-sm">
                  <Link className="underline" href={`/admin/news/${post.id}`}>Preview</Link>
                  {post.status === "DRAFT" && <Link className="underline" href={`/admin/news/${post.id}/edit`}>Edit</Link>}
                </div>
              </li>
            ))}
          </ul>
        )}
      {result?.meta && <NewsPagination path="/admin/news" query={query} {...result.meta} />}
    </div>
  );
}
