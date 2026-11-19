"use server";

import { revalidatePath } from "next/cache";
import { adminRequest } from "@/features/news/admin";
import { NewsRequestError } from "@/features/news/data";
import type { FormState } from "@/features/cms/actions";

const message = (error: unknown) => error instanceof NewsRequestError ? error.message : "Media action could not be completed.";

export async function saveMedia(id: string | null, _state: FormState, form: FormData): Promise<FormState> {
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024) return { error: "Select a JPG, PNG, WebP or PDF up to 4 MiB." };
  const body = new FormData();
  body.set("file", file);
  body.set("altText", String(form.get("altText") ?? ""));
  try {
    await adminRequest(id ? `/admin/media/${encodeURIComponent(id)}/file` : "/admin/media/upload", { method: id ? "PUT" : "POST", body });
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/admin/media");
  return { success: id ? "File replaced." : "File uploaded." };
}

export async function removeMedia(id: string, _state: FormState, form: FormData): Promise<FormState> {
  if (form.get("confirmed") !== "yes") return { error: "Confirm deletion first." };
  try {
    await adminRequest(`/admin/media/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath("/admin/media");
  return { success: "File deleted." };
}

export async function changeGalleryImage(albumId: string, imageId: string | null, _state: FormState, form: FormData): Promise<FormState> {
  const asset = String(form.get("asset") ?? "");
  const id = asset.match(/^\/api\/v1\/media\/files\/([a-z0-9-]{1,80})$/i)?.[1];
  if (!imageId && !id) return { error: "Select an image from the media library." };
  try {
    if (imageId) {
      await adminRequest(`/admin/media/gallery/images/${encodeURIComponent(imageId)}`, { method: "DELETE" });
    } else {
      await adminRequest(`/admin/media/gallery/${encodeURIComponent(albumId)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: id, altText: String(form.get("altText") ?? ""), caption: String(form.get("caption") ?? ""), order: Number(form.get("order") ?? 0) })
      });
    }
  } catch (error) {
    return { error: message(error) };
  }
  revalidatePath(`/admin/gallery/albums/${albumId}`);
  return { success: imageId ? "Image detached." : "Image added." };
}
