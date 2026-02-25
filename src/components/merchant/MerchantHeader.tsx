"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import { logoutMerchant } from "@/actions/merchant/auth";

interface MerchantHeaderProps {
  email: string;
  restaurantName?: string;
}

export function MerchantHeader({ email, restaurantName }: MerchantHeaderProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");

  async function handleLogout() {
    await logoutMerchant(locale);
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      {restaurantName && (
        <span className="text-sm font-medium text-foreground">{restaurantName}</span>
      )}
      <div className="flex-1" />
      <span className="text-sm text-muted-foreground">{email}</span>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        {t("sidebar.logout")}
      </Button>
    </header>
  );
}
