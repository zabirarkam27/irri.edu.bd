import { FileText, Image } from "lucide-react";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";

const files = [
  { name: "patisar-campus.webp", type: "Image", size: "1.8 MB", icon: Image },
  { name: "rabindra-research-journal.pdf", type: "PDF", size: "4.2 MB", icon: FileText }
];

export default function Page() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Media Library" description="Manage uploaded images and documents." />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        {files.map((file) => (
          <div key={file.name} className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-b-0">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                <file.icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{file.type} · {file.size}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
