"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  ImageIcon,
  MessageSquare,
  MessageCircle,
  CreditCard,
  Tag,
  BarChart3,
  Sparkles,
  ShieldCheck,
  QrCode,
  Lightbulb,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    group: "Principal",
    items: [
      { key: "dashboard",    label: "Tableau de bord", href: "",               icon: LayoutDashboard, color: "#e85d26", bg: "#fff3ee" },
      { key: "restaurant",   label: "Mon restaurant",  href: "/mon-restaurant", icon: UtensilsCrossed, color: "#e85d26", bg: "#fff3ee" },
      { key: "photos",       label: "Photos",           href: "/photos",         icon: ImageIcon,       color: "#ec4899", bg: "#fdf2f8" },
      { key: "menu",         label: "Carte",            href: "/carte",          icon: BookOpen,        color: "#8b5cf6", bg: "#f5f3ff" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { key: "whatsapp",     label: "WhatsApp",         href: "/whatsapp",       icon: MessageCircle,   color: "#25D366", bg: "#f0fdf4" },
      { key: "offres",       label: "Offres du moment", href: "/offres",         icon: Tag,             color: "#ef4444", bg: "#fef2f2" },
      { key: "happyhours",   label: "Happy Hours",      href: "/happy-hours",    icon: Sparkles,        color: "#f97316", bg: "#fff7ed" },
      { key: "qrcode",       label: "QR Code",          href: "/qr-code",        icon: QrCode,          color: "#0ea5e9", bg: "#f0f9ff" },
    ],
  },
  {
    group: "Analyse",
    items: [
      { key: "avis",         label: "Avis clients",     href: "/avis",           icon: MessageSquare,   color: "#f59e0b", bg: "#fffbeb" },
      { key: "stats",        label: "Statistiques",     href: "/statistiques",   icon: BarChart3,       color: "#3b82f6", bg: "#eff6ff" },
      { key: "inspiration",  label: "Inspiration IA",   href: "/inspiration",    icon: Lightbulb,       color: "#06b6d4", bg: "#ecfeff" },
    ],
  },
  {
    group: "Compte",
    items: [
      { key: "abonnement",   label: "Abonnement",       href: "/abonnement",     icon: CreditCard,      color: "#6366f1", bg: "#eef2ff" },
      { key: "securite",     label: "Sécurité",         href: "/securite",       icon: ShieldCheck,     color: "#64748b", bg: "#f8fafc" },
    ],
  },
];

export function MerchantSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");

  const basePath = `/${locale}/espace-client`;

  function isActive(href: string) {
    const full = `${basePath}${href}`;
    if (href === "") return pathname === basePath || pathname === `${basePath}/`;
    return pathname.startsWith(full);
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col transition-transform duration-300 md:relative md:z-auto md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      style={{ background: "#0f1117", borderRight: "1px solid #1e2028" }}
    >

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #1e2028" }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}>
          <UtensilsCrossed className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-white">
            Just<span style={{ color: "#e85d26" }}>-Tag</span>
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "#4a4f5e" }}>
            Espace restaurant
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#3a3f4e" }}>
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={`${basePath}${item.href}`}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                    style={active ? {
                      background: item.bg,
                    } : {}}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all"
                      style={{
                        background: active ? item.color : "#1e2028",
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5 transition-colors"
                        style={{ color: active ? "#fff" : "#4a4f5e" }}
                      />
                    </div>
                    <span
                      className="flex-1 text-[13px] font-medium transition-colors"
                      style={{ color: active ? "#0f1117" : "#8a8fa0" }}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <ChevronRight className="h-3 w-3" style={{ color: item.color }} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid #1e2028" }}>
        <p className="text-[11px]" style={{ color: "#3a3f4e" }}>
          © Just-Tag · {t("sidebar.clientArea")}
        </p>
      </div>
    </aside>
  );
}
