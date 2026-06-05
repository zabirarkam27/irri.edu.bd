import { ImagePlus } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";

export default function Page() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Institution Profile" description="Manage public identity, bilingual profile details, and institutional metadata." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="grid gap-5 md:grid-cols-2">
            <FormInput label="English Name" name="name" defaultValue="International Rabindra Research Institute" />
            <FormInput label="Acronym" name="acronym" defaultValue="IRRI" />
          </div>
          <FormInput label="Bengali Name" name="nameBn" defaultValue="আন্তর্জাতিক রবীন্দ্র রিসার্চ ইনস্টিটিউট" />
          <FormTextarea label="Mission" name="mission" />
          <FormTextarea label="Vision" name="vision" />
          <Button type="button">Save Institution</Button>
        </form>
        <div className="rounded-xl border border-dashed border-primary/40 bg-gradient-brand-soft p-6 shadow-soft">
          <div className="grid min-h-64 place-items-center rounded-xl border border-border bg-card/70 text-center">
            <div>
              <ImagePlus className="mx-auto h-10 w-10 text-primary" strokeWidth={2} />
              <p className="mt-4 font-semibold text-foreground">Upload institute logo</p>
              <p className="mt-2 text-sm text-muted-foreground">PNG, WebP, or SVG preferred</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
