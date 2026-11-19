import { AdminLayout as AdminLayoutShell } from "@/components/admin/AdminLayout";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <AdminLayoutShell>
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
