"use server";

import { revalidatePath } from "next/cache";
import { adminRequest } from "@/features/news/admin";
import { NewsRequestError } from "@/features/news/data";
import { resources } from "./config";
import type { FormState } from "./actions";

export async function runEditorialAction(resource: string, id: string, _state: FormState, data: FormData): Promise<FormState> {
  const isNews = resource === "news";
  const config = Object.hasOwn(resources, resource) ? resources[resource] : null;
  if (!config && !isNews) return { error: "Unknown content type." };
  const date = String(data.get("scheduledAt") ?? "");
  const scheduledAt = date ? new Date(`${date}Z`) : null;
  if (scheduledAt && !Number.isFinite(scheduledAt.getTime())) return { error: "Enter a valid UTC date." };
  try {
    await adminRequest(`/admin/${isNews ? "news" : config!.api}/${encodeURIComponent(id)}/editorial`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: data.get("action"), comment: String(data.get("comment") ?? ""), scheduledAt: scheduledAt?.toISOString() })
    });
  } catch (error) {
    return { error: error instanceof NewsRequestError ? error.message : "Editorial action could not be completed." };
  }
  const base = `/admin/${resource}${resource === "gallery" ? "/albums" : ""}`;
  revalidatePath(`${base}/${id}`);
  return { success: "Editorial action saved." };
}
