import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Settings" description="Site configuration, notification preferences, and sensitive actions." />
      <div className="grid gap-5 lg:grid-cols-2">
        {["Site", "Notifications"].map((group) => (
          <div key={group} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground">{group}</h2>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
              <span className="text-sm font-semibold text-foreground">Enable {group.toLowerCase()} updates</span>
              <button className="relative h-6 w-11 rounded-full bg-primary" aria-label={`Toggle ${group}`}>
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-destructive">Danger zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sensitive system operations should be reviewed before execution.</p>
        <Button className="mt-5" variant="outline">Review system actions</Button>
      </div>
    </div>
  );
}
