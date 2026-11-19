import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { listQuery, LoadFailure, readAdmin } from "@/features/cms/AdminContent";
import type { SearchParams } from "@/features/cms/config";
import { currentAdmin } from "@/features/news/admin";
import { NewsPagination } from "@/features/news/NewsPagination";
import { publicAsset } from "@/features/public/DetailPage";
import { MediaDelete, MediaUpload, type MediaRecord } from "./MediaControls";

export async function MediaLibrary({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = listQuery(await searchParams, ["search", "kind", "page"]);
  const [result, account] = await Promise.all([readAdmin<MediaRecord[]>(`/admin/media?${query}`), currentAdmin().catch(() => null)]);
  const canUpload = account && account.role !== "MODERATOR";
  const canDelete = account?.role === "ADMIN" || account?.role === "SUPER_ADMIN";
  return <div className="grid gap-6">
    <AdminPageHeader title="Media library" description={result?.meta ? `${result.meta.total} files` : ""} />
    {canUpload && <details className="grid rounded-md border p-4">
      <summary className="mb-3 cursor-pointer font-semibold">Upload media</summary><MediaUpload />
    </details>}
    <form className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm">Search<input name="search" maxLength={200} defaultValue={query.get("search") ?? ""} className="h-10 rounded border bg-background px-3" /></label>
      <label className="grid gap-1 text-sm">Type<select name="kind" defaultValue={query.get("kind") ?? ""} className="h-10 rounded border bg-background px-3">
        <option value="">All files</option><option value="IMAGE">Images</option><option value="DOCUMENT">Documents</option>
      </select></label>
      <Button>Apply</Button>
    </form>
    {!result ? <LoadFailure /> : !result.data.length ? <p>No matching files.</p> : <ul className="divide-y border-y">
      {result.data.map((record) => {
        const preview = record.url.startsWith("/api/v1/media/files/") ? `/api/admin/media/${record.id}` : publicAsset(record.url);
        const thumbnail = record.url.startsWith("/api/v1/media/files/") ? `${preview}?thumb=1` : preview;
        return <li key={record.id} className="grid gap-3 py-4">
          <div className="flex gap-3">
            {record.type === "IMAGE" && thumbnail && <img src={thumbnail} alt={record.altText ?? ""} width={80} height={56} className="h-14 w-20 shrink-0 rounded object-cover" />}
            <div className="min-w-0 break-words">
              <p className="font-medium">{record.filename}</p>
              <p className="text-sm text-muted-foreground">{record.mimeType} · {Math.ceil(record.size / 1024)} KiB · {record.createdAt.slice(0, 10)}</p>
              {preview && <a className="text-sm underline" href={preview}>{record.type === "IMAGE" ? "Open image" : "Download document"}</a>}
            </div>
          </div>
          {(canUpload || canDelete) && <details>
            <summary className="cursor-pointer text-sm underline">Manage file</summary>
            <div className="mt-3 grid gap-4">{canUpload && <MediaUpload record={record} />}{canDelete && <MediaDelete id={record.id} />}</div>
          </details>}
        </li>;
      })}
    </ul>}
    {result?.meta && <NewsPagination path="/admin/media" query={query} {...result.meta} />}
  </div>;
}
