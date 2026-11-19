"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { adminNewsRequest } from "./admin";
import { NewsRequestError, newsStatuses, type NewsPost } from "./data";

const formSchema = z.object({
  title: z.string().trim().min(2).max(250),
  slug: z.string().trim().max(200).refine(
    (value) => !value || (value.length >= 2 && /^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u.test(value)),
    "Use at least two characters, with hyphens between words."
  ),
  content: z.string().trim().min(1).max(100000),
  titleBn: z.string().trim().max(250),
  contentBn: z.string().trim().max(100000),
  excerpt: z.string().trim().max(500),
  seoTitle: z.string().trim().max(250),
  metaDescription: z.string().trim().max(500),
  status: z.enum(newsStatuses)
});

export type NewsFormState = { error?: string; values?: Record<string, string> };

export async function saveNews(id: string | null, _previous: NewsFormState, form: FormData): Promise<NewsFormState> {
  const values = Object.fromEntries(Object.keys(formSchema.shape).map((key) => [key, String(form.get(key) ?? "")]));
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), values };

  const { slug, ...fields } = parsed.data;
  try {
    await adminNewsRequest<NewsPost>(id ? `/${encodeURIComponent(id)}` : "", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, ...(slug ? { slug } : {}) })
    });
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 401) redirect("/admin/login");
    return { error: error instanceof NewsRequestError ? error.message : "The news post could not be saved.", values };
  }
  redirect("/admin/news");
}

export async function removeNews(id: string, _previous: NewsFormState, form: FormData): Promise<NewsFormState> {
  if (form.get("confirmed") !== "yes") return { error: "Confirm deletion first." };
  try {
    await adminNewsRequest(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (error) {
    if (error instanceof NewsRequestError && error.status === 401) redirect("/admin/login");
    return { error: error instanceof NewsRequestError ? error.message : "The news post could not be deleted." };
  }
  redirect("/admin/news");
}
