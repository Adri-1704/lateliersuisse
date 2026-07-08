"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/actions/admin/auth";

interface AdminHeaderProps {
  email: string;
}

export function AdminHeader({ email }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await logoutAdmin();
    router.push("/admin/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-[#eaecf0] bg-white px-6 gap-4">
      <div className="flex-1" />
      <span className="text-sm text-gray-500">{email}</span>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <LogOut className="h-3.5 w-3.5" />
        Déconnexion
      </button>
    </header>
  );
}
