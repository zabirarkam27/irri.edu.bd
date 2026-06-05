import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="hidden bg-gradient-brand p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-foreground/10">
            <GraduationCap className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <p className="font-display text-xl font-semibold tracking-[-0.02em]">IRRI Admin</p>
            <p className="text-sm text-primary-foreground/70">Academic CMS control room</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/65">International Rabindra Research Institute</p>
          <h1 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance">
            Manage a calm, trustworthy academic publishing system.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80">
            Publish institute pages, notices, research updates, events, gallery records, and administration content from one secure dashboard.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft">
              <GraduationCap className="h-6 w-6" strokeWidth={2} />
            </div>
            <CardTitle className="font-display text-2xl font-semibold tracking-[-0.02em]">Admin Login</CardTitle>
            <CardDescription>Manage IRRI website content and institute records.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm callbackUrl={callbackUrl ?? "/admin/dashboard"} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
