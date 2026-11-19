"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { changeGalleryImage, removeMedia, saveMedia } from "./actions";

export type MediaRecord = {
  id: string; url: string; filename: string; mimeType: string; size: number;
  type: "IMAGE" | "DOCUMENT"; altText: string | null; createdAt: string;
};

const managed = (url: string) => url.startsWith("/api/v1/media/files/");

export function MediaPicker({ kind, name, initial = "", label }: { kind: MediaRecord["type"]; name: string; initial?: string; label: string }) {
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ data: MediaRecord[]; meta?: { totalPage: number } } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    const query = new URLSearchParams({ kind, search, page: String(page) });
    const timer = window.setTimeout(() => {
      fetch(`/api/admin/media?${query}`, { signal: abort.signal, cache: "no-store" })
        .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
        .then(setResult).catch(() => { if (!abort.signal.aborted) setError(true); });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      abort.abort();
    };
  }, [kind, open, page, search]);
  return <div className="grid gap-2">
    <FormInput label={label} name={name} value={value} onChange={(event) => setValue(event.target.value)} />
    <Button variant="outline" size="sm" type="button" className="w-fit" aria-expanded={open} onClick={() => setOpen(!open)}>Choose from library</Button>
    {open && <div className="grid gap-3 rounded-md border p-3">
      <FormInput label="Search media" value={search} maxLength={200} onChange={(event) => {
        setSearch(event.target.value); setPage(1); setResult(null); setError(false);
      }} />
      {error ? <p role="alert">Media could not be loaded.</p> : !result ? <p role="status">Loading media…</p> :
        <div className="grid gap-2">{result.data.filter((record) => managed(record.url)).map((record) => (
          <button key={record.id} type="button" className="flex items-center gap-2 rounded border p-2 text-left text-sm"
            onClick={() => { setValue(record.url); setOpen(false); }}>
            {record.type === "IMAGE" && <img alt="" src={`/api/admin/media/${record.id}?thumb=1`} width={48} height={32} className="h-8 w-12 object-cover" />}
            <span className="min-w-0 break-words">{record.filename}</span>
          </button>
        ))}{!result.data.some((record) => managed(record.url)) && <p>No matching managed files.</p>}</div>}
      <div className="flex gap-2">
        {page > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => { setResult(null); setPage(page - 1); }}>Previous</Button>}
        {page < (result?.meta?.totalPage ?? 1) && <Button type="button" variant="ghost" size="sm" onClick={() => { setResult(null); setPage(page + 1); }}>Next</Button>}
      </div>
    </div>}
  </div>;
}

export function MediaUpload({ record }: { record?: MediaRecord }) {
  const [state, action, pending] = useActionState(saveMedia.bind(null, record?.id ?? null), {});
  return <form className="grid max-w-lg gap-3" action={action}>
    <FormInput label={record ? "Replacement file" : "File"} name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required />
    <FormInput label="Alternative text" name="altText" maxLength={500} defaultValue={record?.altText ?? ""} />
    <Feedback {...state} />
    <Button className="w-fit" disabled={pending}>{pending ? "Uploading..." : record ? "Replace file" : "Upload file"}</Button>
  </form>;
}

export function MediaDelete({ id }: { id: string }) {
  const [state, action, pending] = useActionState(removeMedia.bind(null, id), {});
  return <form className="grid gap-2" action={action}>
    <label className="flex gap-2 text-sm"><input required name="confirmed" type="checkbox" value="yes" /> Confirm removal</label>
    <Feedback {...state} />
    <Button size="sm" variant="outline" disabled={pending} className="w-fit text-destructive">Delete file</Button>
  </form>;
}

export function GalleryImageForm({ albumId, imageId }: { albumId: string; imageId?: string }) {
  const [state, action, pending] = useActionState(changeGalleryImage.bind(null, albumId, imageId ?? null), {});
  return <form className="grid max-w-lg gap-3" action={action}>
    {!imageId && <>
      <MediaPicker kind="IMAGE" name="asset" label="Image" />
      <FormInput label="Alternative text" name="altText" maxLength={500} />
      <FormInput label="Caption" name="caption" maxLength={1000} />
      <FormInput label="Display order" name="order" type="number" min={0} defaultValue={0} />
    </>}
    <Feedback {...state} />
    <Button size="sm" variant="outline" disabled={pending} className="w-fit">{imageId ? "Detach image" : "Attach image"}</Button>
  </form>;
}

function Feedback({ error, success }: { error?: string; success?: string }) {
  return <>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {success && <p role="status" className="text-sm">{success}</p>}</>;
}
