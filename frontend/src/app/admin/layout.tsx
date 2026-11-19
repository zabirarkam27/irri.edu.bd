import { AdminLayout as AdminLayoutShell } from "@/components/admin/AdminLayout";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { currentAdmin } from "@/features/news/admin";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await currentAdmin().catch(() => null);
  if (!account) redirect("/admin/login");
  return (
    <AdminLayoutShell account={{ name: account.name, role: account.role }}>
      <form action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}>
        <button type="submit" className="mb-4 rounded-md border px-3 py-2 text-sm">Sign out</button>
      </form>
      {children}
    </AdminLayoutShell>
  );
}
