"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminRequest } from "@/features/news/admin";
import { NewsRequestError } from "@/features/news/data";
import { institutionFields, releaseSettingsFields, resources, type Field } from "./config";

export type FormState = { error?: string; success?: string; values?: Record<string, string> };

function parse(fields: Field[], form: FormData, institution = false, offset = "Z") {
  const values: Record<string, string> = {};
  const body: Record<string, string | number | boolean | string[] | null> = {};
  let error: string | undefined;
  for (const field of fields) {
    const value = String(form.get(field.name) ?? "").trim();
    if (field.kind === "multi") {
      const selections = form.getAll(field.name).map(String);
      values[field.name] = JSON.stringify(selections);
      body[field.name] = selections;
      continue;
    }
    if (field.kind === "boolean") {
      values[field.name] = value;
      if (value === "true" || value === "false") body[field.name] = value === "true";
      continue;
    }
    values[field.name] = value;
    if (!value) {
      if (field.required) error ??= `${field.label} is required.`;
      if (institution || !["slug", "order"].includes(field.name)) body[field.name] = null;
      continue;
    }
    if (field.kind === "date") {
      const date = new Date(`${value}${offset}`);
      if (Number.isNaN(date.getTime())) error ??= `${field.label} is not a valid date.`;
      else body[field.name] = date.toISOString();
    } else if (field.kind === "number") {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) error ??= `${field.label} is not a valid number.`;
      else body[field.name] = numeric;
    } else if (field.kind === "enum" && !field.options?.includes(value)) {
      error ??= `${field.label} is not valid.`;
    } else {
      if (field.kind === "url" && (institution || !/^(?:\/uploads\/[a-z0-9][a-z0-9._-]*|\/api\/v1\/media\/files\/[a-z0-9-]{1,80})$/i.test(value))) {
        try {
          if (!["http:", "https:"].includes(new URL(value).protocol)) throw new Error();
        } catch {
          error ??= institution ? `${field.label} must be an HTTP or HTTPS URL.` : `${field.label} must be an HTTP(S) URL or an existing upload path.`;
        }
      }
      body[field.name] = value;
    }
  }
  return { values, body, error };
}

const errorMessage = (error: unknown) => {
  if (error instanceof NewsRequestError && error.status === 401) redirect("/admin/login");
  return error instanceof NewsRequestError ? error.message : "The request could not be completed.";
};
const json = (method: string, body: unknown): RequestInit => ({
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
});

export async function saveContent(key: string, id: string | null, _state: FormState, form: FormData): Promise<FormState> {
  if (!Object.hasOwn(resources, key)) return { error: "Unknown content type." };
  const { fields, api } = resources[key];
  const { values, body, error } = parse(fields.filter((field) => field.name !== "status"), form);
  if (error) return { values, error };
  try {
    await adminRequest(`/admin/${api}${id ? `/${encodeURIComponent(id)}` : ""}`, json(id ? "PATCH" : "POST", body));
  } catch (failure) {
    return { values, error: errorMessage(failure) };
  }
  redirect(`/admin/${key}${id ? `${key === "gallery" ? "/albums" : ""}/${id}` : ""}`);
}

export async function deleteContent(key: string, id: string, _state: FormState, form: FormData): Promise<FormState> {
  if (!Object.hasOwn(resources, key) || form.get("confirmed") !== "yes") return { error: "Confirm deletion first." };
  try {
    await adminRequest(`/admin/${resources[key].api}/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (failure) {
    return { error: errorMessage(failure) };
  }
  redirect(`/admin/${key}`);
}

export async function saveInstitution(_state: FormState, form: FormData): Promise<FormState> {
  const { values, body, error } = parse(institutionFields, form, true);
  if (error) return { values, error };
  try {
    await adminRequest("/admin/institution", json("PUT", body));
  } catch (failure) {
    return { values, error: errorMessage(failure) };
  }
  revalidatePath("/admin/institution");
  return { values, success: "Institution profile saved." };
}

export async function saveReleaseSettings(_state: FormState, form: FormData): Promise<FormState> {
  const { values, body, error } = parse(releaseSettingsFields, form, false, "+06:00");
  if (error) return { values, error };
  try {
    await adminRequest("/admin/release-settings", json("PUT", body));
  } catch (failure) {
    return { values, error: errorMessage(failure) };
  }
  revalidatePath("/admin/settings");
  return { values, success: "Release settings saved." };
}

export async function changeAdminRecord(kind: "users" | "inbox", id: string, _state: FormState, form: FormData): Promise<FormState> {
  if (kind !== "users" && kind !== "inbox") return { error: "Unknown record type." };
  const body = kind === "users"
    ? { role: form.get("role"), isActive: form.get("isActive") === "yes" }
    : { isRead: form.get("isRead") === "yes" };
  try {
    await adminRequest(`/admin/${kind}/${encodeURIComponent(id)}`, json("PATCH", body));
  } catch (failure) {
    return { error: errorMessage(failure) };
  }
  revalidatePath(kind === "users" ? "/admin/users" : "/admin/contact-messages");
  return { success: "Saved." };
}
