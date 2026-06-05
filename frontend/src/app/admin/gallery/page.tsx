import { ImagePlus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";

export default function Page() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Gallery" description="Upload, organize, and publish visual records from IRRI activities." />
      <div className="rounded-xl border border-dashed border-primary/40 bg-gradient-brand-soft p-8 text-center shadow-soft">
        <ImagePlus className="mx-auto h-10 w-10 text-primary" strokeWidth={2} />
        <p className="mt-4 font-semibold text-foreground">Drop gallery images here</p>
        <p className="mt-2 text-sm text-muted-foreground">Images will appear in albums after upload.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {["Campus", "Archive", "Seminar"].map((item) => (
          <div key={item} className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <div className="aspect-video bg-gradient-brand" />
            <div className="flex items-center justify-between p-4">
              <p className="font-semibold text-foreground">{item}</p>
              <button className="grid h-9 w-9 place-items-center rounded-md text-destructive hover:bg-secondary" aria-label={`Delete ${item}`}>
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
