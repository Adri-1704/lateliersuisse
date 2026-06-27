"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, ExternalLink, Check, Zap, Users } from "lucide-react";
import { getMerchantSubscription, createBillingPortalSession, createPlanChangeSession } from "@/actions/merchant/subscription";
import type { Subscription, Merchant } from "@/lib/supabase/types";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "À vie",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  past_due: { label: "Paiement en retard", variant: "destructive" },
  canceled: { label: "Annulé", variant: "secondary" },
  incomplete: { label: "Incomplet", variant: "secondary" },
  trialing: { label: "Période d'essai", variant: "default" },
};

type Period = "monthly" | "semiannual" | "annual";
type Tier = 50 | 100 | 200;

const PERIODS: { key: Period; label: string; badge: string | null }[] = [
  { key: "monthly",    label: "Mensuel",    badge: null },
  { key: "semiannual", label: "Semestriel", badge: "−11%" },
  { key: "annual",     label: "Annuel",     badge: "−17%" },
];

// [earlyBird, standard] CHF/mois — 4 messages/mois inclus
const PRICES: Record<Period, Record<Tier, [number, number]>> = {
  monthly:    { 50: [59.95,  89.95],  100: [89.95,  149.95],  200: [149.95, 249.95] },
  semiannual: { 50: [52.95,  79.95],  100: [79.95,  132.95],  200: [132.95, 219.95] },
  annual:     { 50: [49.95,  74.95],  100: [74.95,  124.95],  200: [124.95, 204.95] },
};

const TIERS: { value: Tier; label: string; desc: string; popular: boolean }[] = [
  { value: 50,  label: "50 abonnés",  desc: "Idéal pour démarrer",    popular: false },
  { value: 100, label: "100 abonnés", desc: "Le plus populaire",      popular: true  },
  { value: 200, label: "200 abonnés", desc: "Pour les grands volumes", popular: false },
];

export default function SubscriptionPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("monthly");

  useEffect(() => {
    async function load() {
      const result = await getMerchantSubscription();
      if (result.success && result.data) {
        setSubscription(result.data.subscription);
        setMerchant(result.data.merchant);
        const pt = result.data.subscription.plan_type;
        if (pt === "monthly" || pt === "semiannual" || pt === "annual") {
          setSelectedPeriod(pt);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleManageBilling() {
    setRedirecting(true);
    const result = await createBillingPortalSession(locale);
    if (result.url) {
      window.location.href = result.url;
    } else {
      setRedirecting(false);
    }
  }

  async function handleChangePlan(period: Period, tier: Tier) {
    const key = `${period}-${tier}`;
    setChangingPlan(key);
    const result = await createPlanChangeSession(period, tier, locale);
    if (result.url) {
      window.location.href = result.url;
    } else {
      setChangingPlan(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isEarlyBird = subscription?.is_early_bird ?? false;
  const currentTier = (subscription?.whatsapp_tier ?? 100) as Tier;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("subscription.title")}</h1>
        <p className="text-muted-foreground">{t("subscription.subtitle")}</p>
      </div>

      {subscription ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("subscription.currentPlan")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("subscription.plan")}</span>
                  <span className="text-lg font-bold">
                    {planLabels[subscription.plan_type] || subscription.plan_type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Abonnés WhatsApp</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {currentTier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("subscription.status")}</span>
                  <Badge variant={statusConfig[subscription.status]?.variant || "secondary"}>
                    {statusConfig[subscription.status]?.label || subscription.status}
                  </Badge>
                </div>
                {subscription.cancel_at_period_end && (
                  <div className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
                    {t("subscription.cancelAtEnd")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t("subscription.period")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.current_period_start && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("subscription.startDate")}</span>
                    <span className="text-sm font-medium">
                      {new Date(subscription.current_period_start).toLocaleDateString(locale)}
                    </span>
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("subscription.endDate")}</span>
                    <span className="text-sm font-medium">
                      {new Date(subscription.current_period_end).toLocaleDateString(locale)}
                    </span>
                  </div>
                )}
                {merchant?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm">{merchant.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Change plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-[#e85d26]" />
                Changer de formule
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choisissez votre durée et votre nombre d&apos;abonnés WhatsApp.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Period selector */}
              <div className="flex gap-2 flex-wrap">
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPeriod(p.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      selectedPeriod === p.key
                        ? "bg-[#e85d26] text-white border-[#e85d26]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {p.label}
                    {p.badge && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        selectedPeriod === p.key ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                      }`}>
                        {p.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tier cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {TIERS.map((tier) => {
                  const [earlyPrice, standardPrice] = PRICES[selectedPeriod][tier.value];
                  const price = isEarlyBird ? earlyPrice : standardPrice;
                  const isCurrent = subscription.plan_type === selectedPeriod && currentTier === tier.value;
                  const key = `${selectedPeriod}-${tier.value}`;
                  const isChanging = changingPlan === key;

                  return (
                    <div
                      key={tier.value}
                      className={`relative rounded-xl border-2 p-5 flex flex-col gap-3 transition-all ${
                        isCurrent
                          ? "border-[#e85d26] bg-orange-50"
                          : tier.popular
                          ? "border-gray-900 bg-white"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {tier.popular && !isCurrent && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-gray-900 text-white whitespace-nowrap">
                          ⭐ Populaire
                        </span>
                      )}
                      {isCurrent && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#e85d26] text-white whitespace-nowrap">
                          Formule actuelle
                        </span>
                      )}

                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-500" />
                          {tier.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{tier.desc}</p>
                      </div>

                      <div>
                        <span className="text-3xl font-bold text-gray-900">{price.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 ml-1">CHF / mois</span>
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center gap-1.5 text-[#e85d26] text-sm font-medium mt-auto">
                          <Check className="w-4 h-4" />
                          Formule actuelle
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleChangePlan(selectedPeriod, tier.value)}
                          disabled={!!changingPlan}
                          className={`mt-auto ${
                            tier.popular
                              ? "bg-gray-900 hover:bg-gray-700 text-white"
                              : "bg-[#e85d26] hover:bg-[#d04e1e] text-white"
                          }`}
                        >
                          {isChanging ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Choisir cette formule"
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEarlyBird && (
                <p className="text-xs text-[#e85d26] font-medium">
                  ✦ Tarifs Early Bird — réservés aux 100 premiers restaurants inscrits
                </p>
              )}
              <p className="text-xs text-gray-500">
                ✦ 4 messages WhatsApp inclus par mois · Renouvellement le 1er de chaque mois
              </p>
              <p className="text-xs text-gray-400">
                Prix HT · TVA 8.1% en sus · Facturation en CHF · Annulable à tout moment
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-semibold">{t("subscription.noSubscription")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("subscription.noSubscriptionDescription")}</p>
            <a
              href={`/${locale}/partenaire-inscription?step=plan`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--color-just-tag)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Commencer l&apos;essai gratuit 14 jours →
            </a>
            <p className="mt-2 text-xs text-muted-foreground">Aucun débit pendant l&apos;essai · Annulable à tout moment</p>
          </CardContent>
        </Card>
      )}

      {/* Manage billing */}
      {subscription && merchant?.stripe_customer_id && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <h3 className="font-semibold">{t("subscription.manageBilling")}</h3>
              <p className="text-sm text-muted-foreground">{t("subscription.manageBillingDescription")}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={redirecting}
            >
              {redirecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              {t("subscription.manageButton")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
