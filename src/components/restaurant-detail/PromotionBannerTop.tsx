import { Tag } from "lucide-react";
import type { RestaurantPromotion } from "@/data/mock-restaurants";

interface Props {
  promotions: RestaurantPromotion[];
}

const typeConfig: Record<string, { label: string; value?: string }> = {
  percentage:    { label: "Réduction" },
  fixed_discount:{ label: "Réduction" },
  daily_menu:    { label: "Menu du jour" },
  happy_hour:    { label: "Happy Hour" },
  free_item:     { label: "Article offert" },
  special_event: { label: "Offre spéciale" },
};

export function PromotionBannerTop({ promotions }: Props) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
          <Tag className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              Offre du moment
            </span>
            {promotions[0].discountPercentage && (
              <span className="inline-flex items-center rounded-full bg-orange-600 px-2.5 py-0.5 text-xs font-bold text-white">
                -{promotions[0].discountPercentage}%
              </span>
            )}
            {promotions[0].endDate && (
              <span className="text-xs text-gray-600">
                Jusqu&apos;au {new Date(promotions[0].endDate).toLocaleDateString("fr-CH")}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900">{promotions[0].title}</h3>
          {promotions[0].description && (
            <p className="mt-1 text-sm text-gray-700">{promotions[0].description}</p>
          )}

          {promotions.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {promotions.slice(1).map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 text-xs font-medium text-orange-700"
                >
                  <Tag className="h-3 w-3" />
                  {p.title}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
