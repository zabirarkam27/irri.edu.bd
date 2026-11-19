"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { runEditorialAction } from "./editorial-action";

export function EditorialControls({ resource, id, status, role, scheduledAt, scheduling }: {
  resource: string; id: string; status: string; role: string; scheduledAt?: string; scheduling: boolean;
}) {
  const [state, action, pending] = useActionState(runEditorialAction.bind(null, resource, id), {});
  const publisher = role === "ADMIN" || role === "SUPER_ADMIN";
  const reviewer = publisher || role === "MODERATOR";
  const choices: [string, string][] = [];
  if (status === "DRAFT" && role !== "MODERATOR") choices.push(["submit", "Submit for review"]);
  if (status === "IN_REVIEW" && reviewer) choices.push(["approve", "Approve"]);
  if ((reviewer && ["IN_REVIEW", "APPROVED"].includes(status)) || (publisher && ["PUBLISHED", "ARCHIVED"].includes(status))) {
    choices.push(["return", "Return to draft"]);
  }
  if (status === "APPROVED" && publisher) {
    choices.push(["publish", "Publish now"]);
    if (scheduling) choices.push(["schedule", scheduledAt ? "Reschedule publication" : "Schedule publication"]);
    if (scheduledAt) choices.push(["cancel", "Cancel schedule"]);
  }
  if (status === "PUBLISHED" && publisher) choices.push(["archive", "Archive"]);
  const [selected, setSelected] = useState("");
  const current = choices.some(([key]) => key === selected) ? selected : choices[0]?.[0];
  if (!choices.length && !scheduledAt) return null;
  return <section className="grid gap-3 border-y py-4">
    <h2 className="font-semibold">Editorial workflow</h2>
    {scheduledAt && <p className="text-sm">Scheduled for <time dateTime={scheduledAt}>{scheduledAt.slice(0, 16).replace("T", " ")} UTC</time></p>}
    {choices.length > 0 && <form action={action} className="grid gap-3">
      <label className="grid gap-1 text-sm">Action
        <select name="action" value={current} onChange={(event) => setSelected(event.target.value)} className="h-10 rounded border bg-background px-3">
          {choices.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      {current === "schedule" && <FormInput label="Publication date (UTC)" type="datetime-local" name="scheduledAt" defaultValue={scheduledAt?.slice(0, 16)} required />}
      <FormInput label="Editorial comment" name="comment" maxLength={2000} />
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="text-sm">{state.success}</p>}
      <Button className="w-fit" disabled={pending}>{pending ? "Saving..." : "Apply action"}</Button>
    </form>}
  </section>;
}
