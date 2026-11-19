import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { adminRequest, currentAdmin } from "@/features/news/admin";
import { NewsPagination } from "@/features/news/NewsPagination";
import { NewsRequestError } from "@/features/news/data";
import { saveContent } from "./actions";
import { CmsForm, DeleteContentForm } from "./Forms";
import { formValue, resources, type CmsRecord, type SearchParams } from "./config";

export function listQuery(params: SearchParams, fields: string[]) {
  const query = new URLSearchParams();
  for (const key of fields) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) query.set(key, value.trim().slice(0, 200));
  }
  return query;
}

export async function readAdmin<T>(path: string) {
  try {
    return await adminRequest<T>(path);
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 401) redirect("/admin/login");
    if (error instanceof NewsRequestError && error.status === 404) notFound();
    return null;
  }
}

export function LoadFailure() {
  return <p role="alert">This view could not be loaded. Check your access or reload to try again.</p>;
}

export function recordLabel(record: CmsRecord) {
  return formValue(record.title || record.name || record.slug) || record.id;
}

export async function AdminContentList({ resource, searchParams }: { resource: string; searchParams: Promise<SearchParams> }) {
  const config = resources[resource];
  const base = `/admin/${resource}`;
  const sortBy = config.fields.some(({ name }) => name === "title") ? "title" : "name";
  const query = listQuery(await searchParams, ["search", "status", "page", "sortBy", "sortOrder"]);
  const [result, account] = await Promise.all([
    readAdmin<CmsRecord[]>(`/admin/${config.api}?${query}`), currentAdmin().catch(() => null)
  ]);
  return <div className="grid gap-5">
    <AdminPageHeader title={config.label} description={result?.meta ? `${result.meta.total} records` : ""} />
    {account && account.role !== "MODERATOR" && <Button asChild className="w-fit"><Link href={`${base}/${resource === "gallery" ? "albums/" : ""}new`}>New record</Link></Button>}
    <form className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm">Search<input name="search" defaultValue={query.get("search") ?? ""} maxLength={200} className="h-10 rounded border bg-background px-3" /></label>
      {config.fields.some(({ name }) => name === "status") && <label className="grid gap-1 text-sm">Status
        <select name="status" defaultValue={query.get("status") ?? ""} className="h-10 rounded border bg-background px-3">
          <option value="">All statuses</option><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
        </select>
      </label>}
      <label className="grid gap-1 text-sm">Sort by<select name="sortBy" defaultValue={query.get("sortBy") ?? "createdAt"} className="h-10 rounded border bg-background px-3">
        <option value="createdAt">Created date</option><option value={sortBy}>Name or title</option>
      </select></label>
      <label className="grid gap-1 text-sm">Order<select name="sortOrder" defaultValue={query.get("sortOrder") ?? "desc"} className="h-10 rounded border bg-background px-3">
        <option value="desc">Descending</option><option value="asc">Ascending</option>
      </select></label>
      <Button type="submit">Apply</Button>
    </form>
    {!result ? <LoadFailure /> : !result.data.length ? <p>No records match this view.</p> : <ul className="divide-y border-y">
      {result.data.map((record) => <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link className="min-w-0 break-words font-medium underline" href={`${base}/${resource === "gallery" ? "albums/" : ""}${record.id}`}>{recordLabel(record)}</Link>
        {typeof record.status === "string" && <span className="text-sm text-muted-foreground">{record.status}</span>}
      </li>)}
    </ul>}
    {result?.meta && <NewsPagination path={base} query={query} {...result.meta} />}
  </div>;
}

export async function AdminContentEditor({ resource, id }: { resource: string; id?: string }) {
  const config = resources[resource];
  const [record, choices] = await Promise.all([
    id ? readAdmin<CmsRecord>(`/admin/${config.api}/${encodeURIComponent(id)}`) : undefined,
    Promise.all(config.fields.filter((field) => field.resource).map(async (field) => {
      const path = `/admin/${field.resource}`;
      const first = await readAdmin<CmsRecord[]>(`${path}?limit=100&sortOrder=asc`);
      if (!first) return null;
      const pages = await Promise.all(Array.from({ length: Math.max(0, (first.meta?.totalPage ?? 1) - 1) },
        (_, i) => readAdmin<CmsRecord[]>(`${path}?page=${i + 2}&limit=100&sortOrder=asc`)));
      if (pages.some((page) => !page)) return null;
      return [field.name, [first, ...pages].flatMap((page) => page?.data ?? []).map((item) => ({ id: item.id, label: recordLabel(item) }))] as const;
    }))
  ]);
  if (record === null || choices.some((choice) => choice === null)) return <LoadFailure />;
  const options = Object.fromEntries(choices.filter((choice) => choice !== null));
  return <div className="grid gap-5">
    <AdminPageHeader title={id ? "Edit record" : "New record"} description={config.label} />
    <CmsForm fields={config.fields} options={options} record={record?.data} action={saveContent.bind(null, resource, id ?? null)} />
  </div>;
}

export async function AdminContentDetail({ resource, id }: { resource: string; id: string }) {
  const config = resources[resource];
  const [result, account] = await Promise.all([
    readAdmin<CmsRecord>(`/admin/${config.api}/${encodeURIComponent(id)}`), currentAdmin().catch(() => null)
  ]);
  if (!result) return <LoadFailure />;
  const record = result.data;
  return <div className="grid max-w-3xl gap-5">
    <AdminPageHeader title={recordLabel(record)} description={formValue(record.status)} />
    <Link className="w-fit underline" href={`/admin/${resource}/${resource === "gallery" ? "albums/" : ""}${id}/edit`}>Edit</Link>
    <dl className="grid gap-4">{config.fields.map(({ name, label }) => formValue(record[name]) && (
      <div key={name}><dt className="text-sm font-medium">{label}</dt><dd className="whitespace-pre-wrap break-words text-muted-foreground">{formValue(record[name])}</dd></div>
    ))}</dl>
    {account && ["ADMIN", "SUPER_ADMIN"].includes(account.role) && <DeleteContentForm resource={resource} id={id} />}
  </div>;
}
