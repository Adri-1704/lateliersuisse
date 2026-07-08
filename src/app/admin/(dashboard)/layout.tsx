import { redirect } from "next/navigation";
import { getAdminUser } from "@/actions/admin/auth";
import { isAdminUser } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let email = "contact@just-tag.app";

  try {
    const user = await getAdminUser();
    if (user) {
      email = user.email || email;
      const admin = await isAdminUser(user.id, user.email || "");
      if (!admin) {
        redirect("/");
      }
    } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      redirect("/admin/login");
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) {
      throw e;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader email={email} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
