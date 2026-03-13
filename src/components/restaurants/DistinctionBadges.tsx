"use client";

import { Badge } from "@/components/ui/badge";
import type { RestaurantBadge } from "@/data/mock-restaurants";

const badgeStyles: Record<string, { icon: string; bg: string; text: string }> = {
  michelin_star: { icon: "⭐", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  michelin_bib: { icon: "🍴", bg: "bg-red-50 border-red-200", text: "text-red-700" },
  gaultmillau: { icon: "🏆", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" },
  atelier_suisse_selection: { icon: "🇨🇭", bg: "bg-[var(--color-just-tag)]/10 border-[var(--color-just-tag)]/20", text: "text-[var(--color-just-tag)]" },
};

export function DistinctionBadges({ badges, size = "default" }: { badges: RestaurantBadge[]; size?: "sm" | "default" }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => {
        const style = badgeStyles[badge.type] || badgeStyles.atelier_suisse_selection;
        return (
          <Badge
            key={i}
            variant="outline"
            className={`${style.bg} ${style.text} ${size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"}`}
          >
            {style.icon} {badge.label}
            {badge.score && ` ${badge.score}`}
          </Badge>
        );
      })}
    </div>
  );
}
