"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UtensilsCrossed, Clock } from "lucide-react";

interface PlatDuJourData {
  id: string;
  text: string;
  image_url: string | null;
  price: string | null;
  posted_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return "Hier";
}

export function PlatDuJour({ restaurantId }: { restaurantId: string }) {
  const [plat, setPlat] = useState<PlatDuJourData | null>(null);

  useEffect(() => {
    fetch(`/api/plat-du-jour?restaurant_id=${restaurantId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.platDuJour) {
          // Only show if posted today
          const postedDate = new Date(data.platDuJour.posted_at);
          const today = new Date();
          if (postedDate.toDateString() === today.toDateString()) {
            setPlat(data.platDuJour);
          }
        }
      })
      .catch(() => {});
  }, [restaurantId]);

  if (!plat) return null;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 bg-amber-500 px-4 py-2.5">
        <UtensilsCrossed className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">Plat du jour</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-amber-100">
          <Clock className="h-3 w-3" />
          {timeAgo(plat.posted_at)}
        </span>
      </div>

      <div className="p-4">
        {/* Image */}
        {plat.image_url && (
          <div className="relative mb-3 h-48 w-full overflow-hidden rounded-xl">
            <Image
              src={plat.image_url}
              alt="Plat du jour"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 400px"
            />
          </div>
        )}

        {/* Text */}
        <p className="text-base font-medium text-gray-900 leading-relaxed">
          {plat.text}
        </p>

        {/* Price */}
        {plat.price && (
          <div className="mt-3 inline-block rounded-full bg-amber-500 px-4 py-1.5 text-sm font-bold text-white">
            {plat.price}
          </div>
        )}
      </div>
    </div>
  );
}
