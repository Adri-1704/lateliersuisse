"use client";

import { Badge } from "@/components/ui/badge";
import { Percent, UtensilsCrossed, Clock, Sparkles, Gift, Tag } from "lucide-react";
import type { RestaurantPromotion } from "@/data/mock-restaurants";

const promoConfig: Record<string, { icon: typeof Percent; color: string }> = {
  percentage: { icon: Percent, color: "bg-red-500 text-white" },
  fixed_discount: { icon: Tag, color: "bg-red-600 text-white" },
  daily_menu: { icon: UtensilsCrossed, color: "bg-orange-500 text-white" },
  happy_hour: { icon: Clock, color: "bg-purple-500 text-white" },
  free_item: { icon: Gift, color: "bg-green-500 text-white" },
  special_event: { icon: Sparkles, color: "bg-blue-500 text-white" },
};

export function PromotionBadge({ promotion, size = "default" }: { promotion: RestaurantPromotion; size?: "sm" | "default" }) {
  const config = promoConfig[promotion.type] || promoConfig.special_event;
  const Icon = config.icon;

  const label = promotion.type === "percentage" && promotion.discountPercentage
    ? `-${promotion.discountPercentage}%`
    : promotion.title;

  const showIcon = promotion.type !== "percentage";

  return (
    <Badge className={`${config.color} border-0 ${size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"}`}>
      {showIcon && <Icon className={`mr-1 ${size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}`} />}
      {label}
    </Badge>
  );
}

export function PromotionBanner({ promotions }: { promotions: RestaurantPromotion[] }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-red-600">Offres du moment</h4>
      <div className="flex flex-wrap gap-2">
      {promotions.map((promo, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <PromotionBadge promotion={promo} />
          {promo.description && (
            <span className="text-sm text-red-700">{promo.description}</span>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}
