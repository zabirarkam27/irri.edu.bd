import { AdminDataTable } from "@/features/admin/components/AdminDataTable";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { DashboardStats } from "@/features/admin/components/DashboardStats";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Dashboard" description="Overview of CMS content, publishing activity, and institute data." />
      <DashboardStats />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AdminPageHeader title="Recent News" description="Latest publishing activity from the content team." />
          <div className="mt-4">
            <AdminDataTable />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground">Latest Notices</h2>
            <div className="mt-5 grid gap-4">
              {["Admission information session", "Library access schedule", "Call for papers"].map((notice) => (
                <div key={notice} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <p className="text-sm font-semibold text-foreground">{notice}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Updated recently</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
