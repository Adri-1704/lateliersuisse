"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Clock, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClaimPendingCardProps {
  claim: { id: string; restaurant_id: string; created_at: string };
}

export function ClaimPendingCard({ claim }: ClaimPendingCardProps) {
  const t = useTranslations("merchantPortal.pending");
  const locale = useLocale();
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadRestaurantName() {
      // Lecture publique (RLS "Public can view published restaurants") : on ne
      // fait que récupérer un nom d'affichage, aucune donnée sensible.
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("restaurants") as any)
        .select("name_fr")
        .eq("id", claim.restaurant_id)
        .maybeSingle() as { data: { name_fr: string } | null };
      if (!cancelled && data?.name_fr) {
        setRestaurantName(data.name_fr);
      }
    }
    loadRestaurantName();
    return () => {
      cancelled = true;
    };
  }, [claim.restaurant_id]);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(claim.created_at));

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl bg-white p-8 text-center" style={{ border: "1.5px solid #eaecf0" }}>
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}
        >
          <Clock className="h-8 w-8" style={{ color: "#e85d26" }} />
        </div>

        <h1 className="mt-4 text-2xl font-black text-gray-900">{t("title")}</h1>

        <p className="mt-3 text-[15px] text-gray-600">
          {restaurantName ? t("description", { name: restaurantName }) : t("descriptionGeneric")}
        </p>

        <p className="mt-2 text-[13px] text-gray-400">{t("submittedOn", { date: formattedDate })}</p>

        <div
          className="mt-6 flex items-start gap-3 rounded-xl p-4 text-left"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#16a34a" }} />
          <p className="text-[13px]" style={{ color: "#15803d" }}>
            {t("reassurance")}
          </p>
        </div>
      </div>
    </div>
  );
}
