import { Mail, Reply, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Contact Messages" description="Inbox for public inquiries and collaboration requests." />
      <div className="grid gap-4">
        {["Research collaboration request", "Admission inquiry", "Publication access"].map((subject, index) => (
          <div key={subject} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
                <Mail className="h-5 w-5" strokeWidth={2} />
                {index === 0 ? <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-success" /> : null}
              </span>
              <div>
                <p className="font-semibold text-foreground">{subject}</p>
                <p className="mt-1 text-sm text-muted-foreground">Visitor message · received recently</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Reply className="h-4 w-4" /> Reply</Button>
              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
