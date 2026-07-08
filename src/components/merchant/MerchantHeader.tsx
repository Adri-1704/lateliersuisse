"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, ExternalLink } from "lucide-react";
import { logoutMerchant } from "@/actions/merchant/auth";

interface MerchantHeaderProps {
  email: string;
  restaurantName?: string;
}

export function MerchantHeader({ email, restaurantName }: MerchantHeaderProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");

  const initials = restaurantName
    ? restaurantName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")
    : email[0]?.toUpperCase() || "?";

  async function handleLogout() {
    await logoutMerchant(locale);
  }

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-4 px-6"
      style={{ background: "#fff", borderBottom: "1px solid #eaecf0" }}
    >
      {/* Restaurant pill */}
      {restaurantName && (
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1"
          style={{ background: "#f5f6fa", border: "1px solid #eaecf0" }}
        >
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
          >
            {initials}
          </div>
          <span className="text-[13px] font-semibold text-gray-800">{restaurantName}</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Email */}
      <span className="hidden text-[12px] text-gray-400 sm:block">{email}</span>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
      >
        <LogOut className="h-3.5 w-3.5" />
        {t("sidebar.logout")}
      </button>
    </header>
  );
}
