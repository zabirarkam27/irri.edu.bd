import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { currentAdmin } from "@/features/news/admin";
import { NewsPagination } from "@/features/news/NewsPagination";
import { publicAsset } from "@/features/public/DetailPage";
import { readAdmin, LoadFailure, listQuery } from "./AdminContent";
import { AccessForm, CmsForm, ReadForm } from "./Forms";
import { saveInstitution } from "./actions";
import { institutionFields, type CmsRecord, type SearchParams } from "./config";

export async function Dashboard() {
  const result = await readAdmin<{
    news: number; notices: number; events: number; pages: number; unread: number | null;
    recentNews: { id: string; title: string; status: string }[];
  }>("/admin/dashboard");
  if (!result) return <LoadFailure />;
  const { data } = result;
  const metrics = [
    ["Published news", data.news, "/admin/news?status=PUBLISHED"],
    ["Published notices", data.notices, "/admin/notices?status=PUBLISHED"],
    ["Published events", data.events, "/admin/events?status=PUBLISHED"],
    ["Published pages", data.pages, "/admin/pages?status=PUBLISHED"],
    ...(data.unread === null ? [] : [["Unread messages", data.unread, "/admin/contact-messages?read=unread"]])
  ] as [string, number, string][];
  return <div className="grid gap-6">
    <AdminPageHeader title="Dashboard" description="Publication and inbox activity" />
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map(([label, count, href]) => <div key={label} className="rounded-md border p-4">
        <dt><Link className="underline" href={href}>{label}</Link></dt><dd className="mt-2 text-2xl font-semibold">{count}</dd>
      </div>)}
    </dl>
    <h2 className="text-lg font-semibold">Recently updated news</h2>
    {data.recentNews.length ? <ul className="divide-y border-y">
      {data.recentNews.map((post) => <li className="flex flex-wrap justify-between gap-3 py-3" key={post.id}>
        <Link className="break-words underline" href={`/admin/news/${post.id}`}>{post.title}</Link>
        <span className="text-sm text-muted-foreground">{post.status}</span>
      </li>)}
    </ul> : <p>No news posts yet.</p>}
  </div>;
}

const directories = {
  inbox: { title: "Contact messages", path: "/admin/contact-messages", api: "/admin/inbox" },
  users: { title: "Users", path: "/admin/users", api: "/admin/users" },
  audit: { title: "Audit logs", path: "/admin/audit-logs", api: "/admin/audit-logs" },
  media: { title: "Media library", path: "/admin/media", api: "/admin/media" }
};

type DirectoryRecord = {
  id: string; name?: string; email?: string; phone?: string; subject?: string; message?: string; isRead?: boolean;
  role?: string; isActive?: boolean; action?: string; entity?: string; entityId?: string; userId?: string;
  oldValue?: { status?: string }; newValue?: { status?: string; comment?: string; scheduledAt?: string };
  filename?: string; url?: string; mimeType?: string; size?: number; createdAt: string;
};

export async function AdminDirectory({ kind, searchParams }: { kind: keyof typeof directories; searchParams: Promise<SearchParams> }) {
  const config = directories[kind];
  const query = listQuery(await searchParams, ["page", "search", ...(kind === "inbox" ? ["read"] : kind === "audit" ? ["entity"] : [])]);
  const [result, account] = await Promise.all([
    readAdmin<DirectoryRecord[]>(`${config.api}?${query}`), kind === "users" ? currentAdmin().catch(() => null) : null
  ]);
  return <div className="grid gap-5">
    <AdminPageHeader title={config.title} description={result?.meta ? `${result.meta.total} records` : ""} />
    {result && <form className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm">Search
        <input name="search" maxLength={200} defaultValue={query.get("search") ?? ""} className="h-10 rounded border bg-background px-3" />
      </label>
      {kind === "inbox" && <label className="grid gap-1 text-sm">Read status
        <select name="read" defaultValue={query.get("read") ?? ""} className="h-10 rounded border bg-background px-3">
          <option value="">All</option><option value="unread">Unread</option><option value="read">Read</option>
        </select>
      </label>}
      {kind === "audit" && <label className="grid gap-1 text-sm">Entity
        <input name="entity" maxLength={80} defaultValue={query.get("entity") ?? ""} className="h-10 rounded border bg-background px-3" />
      </label>}
      <Button type="submit">Apply</Button>
    </form>}
    {!result ? <LoadFailure /> : !result.data.length ? <p>No records match this view.</p> : <ul className="divide-y border-y">
      {result.data.map((record) => <li className="grid gap-2 break-words py-4" key={record.id}>
        {kind === "inbox" && <>
          <details>
            <summary className="cursor-pointer font-semibold">{record.subject} <span className="text-sm font-normal">({record.isRead ? "Read" : "Unread"})</span></summary>
            <p className="mt-2 text-sm text-muted-foreground">{record.name} · {record.email}{record.phone ? ` · ${record.phone}` : ""}</p>
            <p className="mt-2 whitespace-pre-wrap">{record.message}</p>
          </details>
          <ReadForm id={record.id} read={Boolean(record.isRead)} />
        </>}
        {kind === "users" && <>
          <p className="font-semibold">{record.name}</p>
          <p className="text-sm">{record.email} · {record.role} · {record.isActive ? "Active" : "Inactive"}</p>
          {account?.role === "SUPER_ADMIN" && <AccessForm id={record.id} role={record.role ?? ""} active={Boolean(record.isActive)} />}
        </>}
        {kind === "audit" && <>
          <p className="font-semibold">{record.action}</p>
          <p className="text-sm">{record.entity} {record.entityId}</p>
          <p className="text-xs text-muted-foreground">Actor: {record.userId ?? "System"}</p>
          {record.oldValue?.status && record.newValue?.status && <p className="text-sm">{record.oldValue.status} to {record.newValue.status}</p>}
          {record.newValue?.comment && <p className="whitespace-pre-wrap text-sm">{record.newValue.comment}</p>}
          {record.newValue?.scheduledAt && <p className="text-sm">{record.newValue.scheduledAt.slice(0, 16).replace("T", " ")} UTC</p>}
        </>}
        {kind === "media" && <>
          <p className="font-semibold">{record.filename}</p>
          <p className="text-sm">{record.mimeType} · {record.size} bytes</p>
          {publicAsset(record.url) && <a className="w-fit underline" href={publicAsset(record.url)}>Open file</a>}
        </>}
        <time dateTime={record.createdAt} className="text-xs text-muted-foreground">{record.createdAt.slice(0, 10)}</time>
      </li>)}
    </ul>}
    {result?.meta && <NewsPagination path={config.path} query={query} {...result.meta} />}
  </div>;
}

export async function InstitutionEditor() {
  const result = await readAdmin<CmsRecord | null>("/admin/institution");
  return <div className="grid gap-5">
    <AdminPageHeader title="Institution profile" description="Public identity and institutional information" />
    {result ? <CmsForm fields={institutionFields} record={result.data} action={saveInstitution} /> : <LoadFailure />}
  </div>;
}

export async function Profile() {
  const account = await currentAdmin().catch(() => null);
  return <div className="grid gap-5">
    <AdminPageHeader title="My profile" description="" />
    {account ? <dl className="grid gap-3">
      <div><dt className="font-medium">Name</dt><dd>{account.name}</dd></div>
      <div><dt className="font-medium">Email</dt><dd>{account.email}</dd></div>
      <div><dt className="font-medium">Role</dt><dd>{account.role}</dd></div>
    </dl> : <LoadFailure />}
  </div>;
}
