"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import Link from "next/link";
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
  Store,
  MessageSquare,
  Briefcase,
  Mail,
  Newspaper,
  Star,
  Loader2,
} from "lucide-react";

const navItems = [
  { title: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { title: "Restaurants", href: "/admin/restaurants", icon: UtensilsCrossed },
  { title: "Commercants", href: "/admin/merchants", icon: Store },
  { title: "Avis", href: "/admin/reviews", icon: MessageSquare },
  { title: "Demandes B2B", href: "/admin/b2b-requests", icon: Briefcase },
  { title: "Contacts", href: "/admin/contacts", icon: Mail },
  { title: "Newsletter", href: "/admin/newsletter", icon: Newspaper },
  { title: "Restaurants du mois", href: "/admin/featured", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2">
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
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
        <p className="text-xs text-muted-foreground">Just-Tag.ch Admin</p>
      </SidebarFooter>
    </Sidebar>
  );
}
