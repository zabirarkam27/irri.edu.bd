"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { removeNews, saveNews, type NewsFormState } from "./actions";
import type { NewsPost } from "./data";

export function NewsForm({ post }: { post?: NewsPost }) {
  const [state, submit, pending] = useActionState(saveNews.bind(null, post?.id ?? null), {} as NewsFormState);
  const value = (key: keyof NewsPost) => state.values?.[key] ?? post?.[key] ?? "";
  return (
    <form action={submit} className="grid max-w-3xl gap-4">
      <FormInput label="Title" name="title" required minLength={2} maxLength={250} defaultValue={value("title")} />
      <FormInput label="Bengali title" name="titleBn" maxLength={250} defaultValue={value("titleBn")} />
      <FormInput label="Slug" name="slug" maxLength={200} defaultValue={value("slug")} />
      <FormTextarea label="Excerpt" name="excerpt" maxLength={500} defaultValue={value("excerpt")} />
      <FormTextarea label="Content" name="content" required maxLength={100000} defaultValue={value("content")} />
      <FormTextarea label="Bengali content" name="contentBn" maxLength={100000} defaultValue={value("contentBn")} />
      <FormInput label="SEO title" name="seoTitle" maxLength={250} defaultValue={value("seoTitle")} />
      <FormTextarea label="Meta description" name="metaDescription" maxLength={500} defaultValue={value("metaDescription")} />
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button disabled={pending} className="w-fit">{pending ? "Saving..." : "Save news"}</Button>
    </form>
  );
}

export function DeleteNewsForm({ id }: { id: string }) {
  const [state, submit, pending] = useActionState(removeNews.bind(null, id), {} as NewsFormState);
  return (
    <form action={submit} className="grid gap-3 border-t pt-5">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="confirmed" value="yes" required /> Permanently delete this post
      </label>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button variant="outline" className="w-fit text-destructive" disabled={pending}>{pending ? "Deleting..." : "Delete news"}</Button>
    </form>
  );
}
