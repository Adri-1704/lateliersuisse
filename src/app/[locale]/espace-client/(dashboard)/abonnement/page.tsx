"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CreditCard, Calendar, ExternalLink, Check, Zap, Users } from "lucide-react";
import { getMerchantSubscription, createBillingPortalSession, createPlanChangeSession } from "@/actions/merchant/subscription";
import type { Subscription, Merchant } from "@/lib/supabase/types";

const planLabels: Record<string, string> = {
  monthly: "Mensuel", semiannual: "Semestriel", annual: "Annuel", lifetime: "À vie",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: "Actif",               color: "#16a34a", bg: "#f0fdf4" },
  past_due:   { label: "Paiement en retard",   color: "#dc2626", bg: "#fef2f2" },
  canceled:   { label: "Annulé",               color: "#6b7280", bg: "#f9fafb" },
  incomplete: { label: "Incomplet",            color: "#d97706", bg: "#fffbeb" },
  trialing:   { label: "Période d'essai",      color: "#2563eb", bg: "#eff6ff" },
};

type Period = "monthly" | "semiannual" | "annual";
type Tier = 50 | 100 | 200;

const PERIODS: { key: Period; label: string; badge: string | null }[] = [
  { key: "monthly",    label: "Mensuel",    badge: null },
  { key: "semiannual", label: "Semestriel", badge: "−11%" },
  { key: "annual",     label: "Annuel",     badge: "−17%" },
];

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
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getMerchantSubscription();
      if (result.success && result.data) {
        setSubscription(result.data.subscription);
        setMerchant(result.data.merchant);
        const pt = result.data.subscription.plan_type;
        if (pt === "monthly" || pt === "semiannual" || pt === "annual") setSelectedPeriod(pt);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleManageBilling() {
    setRedirecting(true);
    const result = await createBillingPortalSession(locale);
    if (result.url) window.location.href = result.url;
    else setRedirecting(false);
  }

  async function handleChangePlan(period: Period, tier: Tier) {
    const key = `${period}-${tier}`;
    setChangingPlan(key);
    const result = await createPlanChangeSession(period, tier, locale);
    if (result.url) window.location.href = result.url;
    else setChangingPlan(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6366f1" }} />
      </div>
    );
  }

  const isEarlyBird = subscription?.is_early_bird ?? false;
  const currentTier = (subscription?.whatsapp_tier ?? 100) as Tier;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">{t("subscription.title")}</h1>
          <p className="text-[13px] text-gray-400">{t("subscription.subtitle")}</p>
        </div>
      </div>

      {subscription ? (
        <>
          {/* Current plan info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5" style={{ border: "1.5px solid #eaecf0" }}>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4" style={{ color: "#6366f1" }} />
                <h2 className="font-bold text-gray-900">{t("subscription.currentPlan")}</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t("subscription.plan")}</span>
                  <span className="text-sm font-bold text-gray-900">{planLabels[subscription.plan_type] || subscription.plan_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Abonnés WhatsApp</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Users className="h-3.5 w-3.5" /> {currentTier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{t("subscription.status")}</span>
                  {(() => {
                    const cfg = STATUS_CONFIG[subscription.status] || { label: subscription.status, color: "#6b7280", bg: "#f9fafb" };
                    return (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
                {subscription.cancel_at_period_end && (
                  <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "#fffbeb", color: "#92400e" }}>
                    {t("subscription.cancelAtEnd")}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5" style={{ border: "1.5px solid #eaecf0" }}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4" style={{ color: "#6366f1" }} />
                <h2 className="font-bold text-gray-900">{t("subscription.period")}</h2>
              </div>
              <div className="space-y-3">
                {subscription.current_period_start && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t("subscription.startDate")}</span>
                    <span className="text-sm font-medium text-gray-900">{new Date(subscription.current_period_start).toLocaleDateString(locale)}</span>
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t("subscription.endDate")}</span>
                    <span className="text-sm font-medium text-gray-900">{new Date(subscription.current_period_end).toLocaleDateString(locale)}</span>
                  </div>
                )}
                {merchant?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm text-gray-600">{merchant.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change plan */}
          <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="h-4 w-4" style={{ color: "#e85d26" }} />
                <h2 className="font-bold text-gray-900">Changer de formule</h2>
              </div>
              <p className="text-[13px] text-gray-400 ml-6">Choisissez votre durée et votre nombre d&apos;abonnés WhatsApp.</p>
            </div>
            <div className="p-6 space-y-6">

              {/* Period tabs */}
              <div className="flex gap-2 flex-wrap">
                {PERIODS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPeriod(p.key)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                    style={selectedPeriod === p.key
                      ? { background: "#e85d26", color: "#fff", border: "1.5px solid #e85d26" }
                      : { background: "#fff", color: "#374151", border: "1.5px solid #eaecf0" }}
                  >
                    {p.label}
                    {p.badge && (
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                        style={selectedPeriod === p.key
                          ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                          : { background: "#dcfce7", color: "#16a34a" }}>
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
                  const isSelected = selectedTier === tier.value;
                  const showTotal = selectedPeriod !== "monthly";
                  const totalAmount = selectedPeriod === "semiannual" ? (price * 6).toFixed(2) : (price * 12).toFixed(2);
                  const totalPeriod = selectedPeriod === "semiannual" ? "/ 6 mois" : "/ an";

                  return (
                    <div
                      key={tier.value}
                      onClick={() => setSelectedTier(tier.value)}
                      className="relative flex flex-col gap-3 rounded-2xl p-5 transition-all cursor-pointer"
                      style={{
                        border: isCurrent ? "2px solid #e85d26" : isSelected ? "2px solid #e85d26" : tier.popular ? "2px solid #0f1117" : "1.5px solid #eaecf0",
                        background: isCurrent ? "#fff3ee" : "#fff",
                        boxShadow: (isSelected && !isCurrent) ? "0 8px 24px rgba(232,93,38,0.12)" : "none",
                      }}
                    >
                      {tier.popular && !isCurrent && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold text-white" style={{ background: "#0f1117" }}>
                          ⭐ Populaire
                        </span>
                      )}
                      {isCurrent && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold text-white" style={{ background: "#e85d26" }}>
                          Formule actuelle
                        </span>
                      )}

                      <div>
                        <p className="flex items-center gap-1.5 font-semibold text-gray-900">
                          <Users className="h-4 w-4 text-gray-400" />
                          {tier.label}
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-500">{tier.desc}</p>
                      </div>

                      <div>
                        <span className="text-3xl font-black text-gray-900">{price.toFixed(2)}</span>
                        <span className="ml-1 text-sm text-gray-400">CHF / mois</span>
                        {showTotal && (
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            soit <span className="font-bold text-gray-600">CHF {totalAmount}</span> {totalPeriod}
                          </p>
                        )}
                      </div>

                      {isCurrent ? (
                        <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#e85d26" }}>
                          <Check className="h-4 w-4" />
                          Formule actuelle
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleChangePlan(selectedPeriod, tier.value); }}
                          disabled={!!changingPlan}
                          className="mt-auto flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-60"
                          style={{
                            background: (isSelected || tier.popular) ? "#e85d26" : "#0f1117",
                          }}
                        >
                          {isChanging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Choisir cette formule"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEarlyBird && (
                <p className="text-[12px] font-semibold" style={{ color: "#e85d26" }}>
                  ✦ Tarifs Early Bird — réservés aux 100 premiers restaurants inscrits
                </p>
              )}
              <p className="text-[12px] text-gray-500">
                ✦ Jusqu&apos;à {(selectedTier ?? currentTier) * 4} messages WhatsApp par mois · Renouvellement le 1er de chaque mois
              </p>
              <p className="text-[11px] text-gray-400">
                Prix TTC · Facturation en CHF · Annulable à tout moment
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center bg-white" style={{ border: "1.5px solid #eaecf0" }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #eef2ff, #e0e7ff)" }}>
            <CreditCard className="h-8 w-8" style={{ color: "#6366f1" }} />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-800">{t("subscription.noSubscription")}</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-xs">{t("subscription.noSubscriptionDescription")}</p>
          <a
            href={`/${locale}/partenaire-inscription?step=plan`}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
          >
            Commencer l&apos;essai gratuit 14 jours →
          </a>
          <p className="mt-2 text-[11px] text-gray-400">Aucun débit pendant l&apos;essai · Annulable à tout moment</p>
        </div>
      )}

      {/* Manage billing */}
      {subscription && merchant?.stripe_customer_id && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-5" style={{ border: "1.5px solid #eaecf0" }}>
          <div>
            <h3 className="font-bold text-gray-900">{t("subscription.manageBilling")}</h3>
            <p className="text-[13px] text-gray-400">{t("subscription.manageBillingDescription")}</p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={redirecting}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
            style={{ border: "1.5px solid #eaecf0" }}
          >
            {redirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {t("subscription.manageButton")}
          </button>
        </div>
      )}
    </div>
  );
}
