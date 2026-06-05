import { AdminDataTable } from "@/features/admin/components/AdminDataTable";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { Toolbar } from "@/components/admin/Toolbar";

export function AdminCrudPage({ title }: { title: string }) {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title={title} description="Search, filter, paginate, create, update, delete, and manage publication status." />
      <Toolbar />
      <AdminDataTable />
    </div>
  );
}
