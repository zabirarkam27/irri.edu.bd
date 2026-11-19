"use client";

import { useActionState } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Button } from "@/components/ui/button";
import { changeAdminRecord, deleteContent, type FormState } from "./actions";
import { formValue, type CmsRecord, type Field } from "./config";

export const roles = ["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR"];
const initialState: FormState = {};

export function CmsForm({ fields, record, options, action }: {
  fields: Field[];
  record?: CmsRecord | null;
  options?: Record<string, { id: string; label: string }[]>;
  action: (state: FormState, data: FormData) => Promise<FormState>;
}) {
  const [state, submit, pending] = useActionState(action, initialState);
  return (
    <form action={submit} className="grid max-w-3xl gap-4">
      {fields.map((field) => {
        const existing = record ? formValue(record[field.name]) : field.initial ?? "";
        const raw = state.values?.[field.name] ?? existing;
        const value = field.kind === "date" ? raw.slice(0, 19) : raw;
        const props = { name: field.name, required: field.required, defaultValue: value };
        if (field.kind === "area") return <FormTextarea key={field.name} label={field.label} {...props} />;
        if (field.kind === "enum" || field.kind === "relation") return (
          <label key={field.name} className="grid gap-2 text-sm font-medium">{field.label}
            <select {...props} className="h-10 rounded-md border bg-background px-3">
              {field.kind === "relation" && <option value="">None</option>}
              {field.kind === "relation" && value && !options?.[field.name]?.some(({ id }) => id === value) && <option value={value}>Current selection</option>}
              {field.options?.map((option) => <option key={option}>{option}</option>)}
              {options?.[field.name]?.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        );
        return <FormInput key={field.name} label={field.label} {...props} step={field.kind === "number" ? "any" : field.kind === "date" ? "1" : undefined}
          inputMode={field.kind === "url" ? "url" : undefined}
          type={field.kind === "date" ? "datetime-local" : field.kind === "number" ? "number" : "text"} />;
      })}
      <FormFeedback state={state} />
      <Button className="w-fit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
    </form>
  );
}

export function DeleteContentForm({ resource, id }: { resource: string; id: string }) {
  const [state, action, pending] = useActionState(deleteContent.bind(null, resource, id), initialState);
  return <form action={action} className="grid gap-3 border-t pt-4">
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="confirmed" value="yes" required /> Permanently delete this record</label>
    <FormFeedback state={state} />
    <Button variant="outline" className="w-fit text-destructive" disabled={pending}>{pending ? "Deleting..." : "Delete"}</Button>
  </form>;
}

export function AccessForm({ id, role, active }: { id: string; role: string; active: boolean }) {
  const [state, action, pending] = useActionState(changeAdminRecord.bind(null, "users", id), initialState);
  return <form action={action} className="flex flex-wrap items-end gap-3">
    <label className="grid gap-1 text-sm">Role<select name="role" defaultValue={role} className="h-9 rounded border bg-background px-2">
      {roles.map((value) => <option key={value}>{value}</option>)}
    </select></label>
    <label className="flex h-9 items-center gap-2 text-sm"><input type="checkbox" name="isActive" value="yes" defaultChecked={active} /> Active</label>
    <Button size="sm" variant="outline" disabled={pending}>{pending ? "Saving..." : "Save access"}</Button>
    <FormFeedback state={state} />
  </form>;
}

export function ReadForm({ id, read }: { id: string; read: boolean }) {
  const [state, action, pending] = useActionState(changeAdminRecord.bind(null, "inbox", id), initialState);
  return <form action={action} className="grid gap-2">
    <input type="hidden" name="isRead" value={read ? "no" : "yes"} />
    <Button size="sm" variant="outline" className="w-fit" disabled={pending}>{pending ? "Saving..." : read ? "Mark unread" : "Mark read"}</Button>
    <FormFeedback state={state} />
  </form>;
}

function FormFeedback({ state }: { state: FormState }) {
  return <>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="text-sm">{state.success}</p>}
  </>;
}
