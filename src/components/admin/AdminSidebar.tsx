"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  MessageSquare,
  Briefcase,
  Mail,
  Newspaper,
  Star,
  Settings,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  FileText,
  Link2,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { title: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { title: "Statistiques", href: "/admin/stats", icon: BarChart3 },
  { title: "Trafic", href: "/admin/traffic", icon: TrendingUp },
  { title: "Coûts WhatsApp", href: "/admin/whatsapp-costs", icon: MessageCircle },
  { title: "Blog", href: "/admin/blog", icon: FileText },
  { title: "Affiliations", href: "/admin/affiliations", icon: Link2 },
  { title: "Restaurants", href: "/admin/restaurants", icon: UtensilsCrossed },
  { title: "Commerçants", href: "/admin/merchants", icon: Store },
  { title: "Avis", href: "/admin/reviews", icon: MessageSquare },
  { title: "Demandes B2B", href: "/admin/b2b-requests", icon: Briefcase },
  { title: "Claims", href: "/admin/claim-requests", icon: ShieldCheck },
  { title: "Contacts", href: "/admin/contacts", icon: Mail },
  { title: "Newsletter", href: "/admin/newsletter", icon: Newspaper },
  { title: "Restaurants du mois", href: "/admin/featured", icon: Star },
  { title: "Paramètres", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[#0f1117]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
          <UtensilsCrossed className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[15px] font-bold text-white">
          Just<span className="text-indigo-400">-Tag</span>{" "}
          <span className="text-[11px] font-normal text-white/30">admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <item.icon className="h-[15px] w-[15px] shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-3">
        <p className="text-[11px] text-white/25">Just-Tag Admin · v1</p>
      </div>
    </aside>
  );
}
