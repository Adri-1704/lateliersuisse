import { redirect } from "next/navigation";
import { getAdminUser } from "@/actions/admin/auth";
import { isAdminUser } from "@/lib/admin";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let email = "contact@just-tag.app";

  try {
    const user = await getAdminUser();
    if (user) {
      email = user.email || email;

      // ── Admin role check — defense in depth (C1 fix) ──
      // Even if the middleware let the request through (e.g. no ADMIN_EMAILS set),
      // we verify again at the Server Component level with full DB access.
      const admin = await isAdminUser(user.id, user.email || "");
      if (!admin) {
        redirect("/");
      }
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Supabase is configured but no user session — redirect to login
      redirect("/admin/login");
    }
    // If Supabase is NOT configured, allow access with default email (demo mode)
  } catch (e) {
    // Re-throw Next.js redirect errors (they use a special NEXT_REDIRECT error)
    if (e && typeof e === "object" && "digest" in e) {
      throw e;
    }
    // Supabase error — continue in demo mode
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader email={email} />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
