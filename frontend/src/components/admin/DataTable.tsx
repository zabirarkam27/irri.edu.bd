import Link from "next/link";
import { Edit3 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";

const rows = [
  { title: "About IRRI", type: "Page", status: "PUBLISHED", updatedAt: "2026-05-01" },
  { title: "Admission information session", type: "Notice", status: "DRAFT", updatedAt: "2026-05-04" },
  { title: "Rabindra Jayanti symposium", type: "Event", status: "PUBLISHED", updatedAt: "2026-05-08" }
];

export function DataTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="sticky top-0 bg-secondary/60 text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Title</th>
              <th scope="col" className="px-5 py-3 font-semibold">Type</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 font-semibold">Updated</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.title} className="border-t border-border transition-colors hover:bg-secondary/30">
                <td className="px-5 py-4 font-semibold text-foreground">{row.title}</td>
                <td className="px-5 py-4 text-muted-foreground">{row.type}</td>
                <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                <td className="px-5 py-4 text-muted-foreground">{row.updatedAt}</td>
                <td className="px-5 py-4 text-right">
                  <Link href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-pressed">
                    <Edit3 className="h-4 w-4" strokeWidth={2} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
