"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  ImageIcon,
  MessageSquare,
  CreditCard,
  Loader2,
} from "lucide-react";

export function MerchantSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");
  const { setOpenMobile, isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();

  const basePath = `/${locale}/espace-client`;

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  const navItems = [
    { title: t("sidebar.dashboard"), href: basePath, icon: LayoutDashboard },
    { title: t("sidebar.myRestaurant"), href: `${basePath}/mon-restaurant`, icon: UtensilsCrossed },
    { title: t("sidebar.menu"), href: `${basePath}/carte`, icon: BookOpen },
    { title: t("sidebar.photos"), href: `${basePath}/photos`, icon: ImageIcon },
    { title: t("sidebar.reviews"), href: `${basePath}/avis`, icon: MessageSquare },
    { title: t("sidebar.subscription"), href: `${basePath}/abonnement`, icon: CreditCard },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href={basePath} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-just-tag)] text-white">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold">
            Just<span className="text-[var(--color-just-tag)]">-Tag</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === basePath
                    ? pathname === basePath || pathname === `${basePath}/`
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        startTransition(() => {
                          router.push(item.href);
                        });
                      }}
                      className={cn(isPending && !isActive && "cursor-wait")}
                    >
                      <item.icon className={cn("h-4 w-4", isPending && isActive && "animate-pulse")} />
                      <span>{item.title}</span>
                      {isPending && isActive && (
                        <Loader2 className="ml-auto h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-6 py-3">
        <p className="text-xs text-muted-foreground">Just-Tag.ch {t("sidebar.clientArea")}</p>
      </SidebarFooter>
    </Sidebar>
  );
}
