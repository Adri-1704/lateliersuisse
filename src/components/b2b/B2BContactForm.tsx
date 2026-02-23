"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Send, CheckCircle2, Loader2, ShieldCheck, Clock, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cantons } from "@/data/cantons";
import { cuisineCategories } from "@/data/mock-categories";
import { getLocalizedLabel, getLocalizedName } from "@/lib/locale-helpers";
import { submitB2BContactRequest } from "@/actions/b2b-contact";

export function B2BContactForm() {
  const t = useTranslations("b2b.contact");
  const params = useParams();
  const locale = params.locale as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCantonLabelLocal = (c: { label: string; labelDe: string; labelEn: string; labelPt?: string; labelEs?: string }) => {
    return getLocalizedLabel(c, locale);
  };

  const getCuisineLabel = (c: { nameFr: string; nameDe: string; nameEn: string; namePt?: string; nameEs?: string }) => {
    return getLocalizedName(c, locale);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await submitB2BContactRequest({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      restaurantName: formData.get("restaurantName") as string,
      city: formData.get("city") as string,
      message: (formData.get("message") as string) || undefined,
      locale,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error);
    }
  };

  if (isSuccess) {
    return (
      <section id="b2b-contact" className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="rounded-2xl border bg-white p-12 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">
              {t("success")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="b2b-contact" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-gray-600">{t("subtitle")}</p>
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              {t("trustSecure")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("trustNoCommit")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              {t("trustMultilingual")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {t("trustCallback")}
            </span>
          </div>

          <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">{t("firstName")} *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("lastName")} *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">{t("email")} *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="restaurantName">{t("restaurantName")} *</Label>
                  <Input
                    id="restaurantName"
                    name="restaurantName"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t("city")} *</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Canton + Cuisine dropdowns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="canton">{t("canton")}</Label>
                  <select
                    id="canton"
                    name="canton"
                    className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
                  >
                    <option value="">{t("allCantons")}</option>
                    {cantons.map((c) => (
                      <option key={c.value} value={c.value}>
                        {getCantonLabelLocal(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="cuisineType">{t("cuisineType")}</Label>
                  <select
                    id="cuisineType"
                    name="cuisineType"
                    className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
                  >
                    <option value="">{t("allCuisines")}</option>
                    {cuisineCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {getCuisineLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={t("messagePlaceholder")}
                  className="mt-1.5"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{t("error")}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--color-just-tag)] py-6 text-base font-semibold hover:bg-[var(--color-just-tag-dark)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
