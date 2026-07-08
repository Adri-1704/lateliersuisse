import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/server";
import { OptinForm } from "./OptinForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("restaurants")
    .select("name_fr, name_de, name_en")
    .eq("slug", slug)
    .single();

  const row = data as unknown as { name_fr: string; name_de: string; name_en: string } | null;
  const name =
    locale === "de" ? row?.name_de : locale === "en" ? row?.name_en : row?.name_fr;

  return {
    title: name ? `Offres WhatsApp — ${name}` : "Recevoir les offres",
    robots: { index: false },
  };
}

export default async function RejoindrePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "joinPage" });

  const supabase = createAdminClient();
  const { data: raw } = await supabase
    .from("restaurants")
    .select("id, slug, name_fr, name_de, name_en, cover_image, city")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!raw) notFound();

  const restaurant = raw as unknown as {
    id: string;
    slug: string;
    name_fr: string;
    name_de: string;
    name_en: string;
    cover_image: string | null;
    city: string;
  };

  const name =
    locale === "de"
      ? restaurant.name_de
      : locale === "en"
      ? restaurant.name_en
      : restaurant.name_fr;

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {restaurant.cover_image && (
          <div className="w-full h-36 rounded-2xl overflow-hidden mb-6 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.cover_image}
              alt={name ?? ""}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6 text-center">
            {restaurant.city && (
              <p className="text-sm font-medium text-[#e85d26] uppercase tracking-wide mb-1">
                {restaurant.city}
              </p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <OptinForm
            restaurantId={restaurant.id}
            restaurantName={name ?? ""}
            labels={{
              firstName: t("firstName"),
              firstNamePlaceholder: t("firstNamePlaceholder"),
              phone: t("phone"),
              phonePlaceholder: t("phonePlaceholder"),
              consent: t("consent"),
              submit: t("submit"),
              submitting: t("submitting"),
              successTitle: t("successTitle"),
              successMessage: t("successMessage"),
              errorInvalid: t("errorInvalid"),
              errorServer: t("errorServer"),
            }}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Propulsé par{" "}
          <a href="https://just-tag.app" className="underline hover:text-[#e85d26]">
            Just-Tag
          </a>
        </p>
      </div>
    </div>
  );
}
