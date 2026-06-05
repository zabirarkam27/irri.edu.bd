import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";

export function AdminFormPage({ title }: { title: string }) {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title={title} description="CMS form with SEO fields, status management, and validation-ready inputs." />
      <form className="grid max-w-3xl gap-5 rounded-xl border border-border bg-card p-6 shadow-soft">
        <FormInput label="Title" name="title" required />
        <FormInput label="Slug" name="slug" required />
        <FormTextarea label="Description" name="description" />
        <FormInput label="SEO Title" name="seoTitle" />
        <FormTextarea label="Meta Description" name="metaDescription" />
        <label className="grid gap-2 text-sm font-medium">
          Status
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
            <option>DRAFT</option>
            <option>PUBLISHED</option>
            <option>ARCHIVED</option>
          </select>
        </label>
        <Button type="button">Save</Button>
      </form>
    </div>
  );
}
