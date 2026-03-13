"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Send, CheckCircle2, Loader2, ShieldCheck, Clock, Globe, Lock, ArrowRight, Phone } from "lucide-react";
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

  const [mode, setMode] = useState<"choice" | "contact">("choice");
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

          {/* Two options */}
          {mode === "choice" && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                href={`/${locale}/partenaire-inscription`}
                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-[var(--color-just-tag)] bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[var(--color-just-tag-dark)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10">
                  <ArrowRight className="h-7 w-7 text-[var(--color-just-tag)]" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">S&apos;inscrire directement</h3>
                  <p className="mt-1 text-sm text-gray-600">Choisissez votre plan et creez votre compte en quelques minutes</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-just-tag)] px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[var(--color-just-tag-dark)]">
                  Commencer maintenant
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <button
                onClick={() => setMode("contact")}
                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-gray-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <Phone className="h-7 w-7 text-gray-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">Etre contacte</h3>
                  <p className="mt-1 text-sm text-gray-600">Laissez-nous vos coordonnees et nous vous rappelons rapidement</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors group-hover:bg-gray-50">
                  Demander un rappel
                  <Phone className="h-4 w-4" />
                </span>
              </button>
            </div>
          )}

          {/* Contact form */}
          {mode === "contact" && (
            <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Demande de rappel</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("choice")}
                  className="text-sm text-gray-500"
                >
                  ← Retour
                </Button>
              </div>
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
          )}
        </div>
      </div>
    </section>
  );
}
