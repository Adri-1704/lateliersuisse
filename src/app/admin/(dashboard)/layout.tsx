import { redirect } from "next/navigation";
import { getAdminUser } from "@/actions/admin/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let email = "admin@just-tag.ch";

  try {
    const user = await getAdminUser();
    if (user) {
      email = user.email || email;
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV !== "development") {
      // Supabase is configured but no user session — redirect to login (production only)
      redirect("/admin/login");
    }
    // In development or if Supabase is NOT configured, allow access with default email (demo mode)
  } catch (e) {
    // Re-throw redirect errors (Next.js uses exceptions for redirects)
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
