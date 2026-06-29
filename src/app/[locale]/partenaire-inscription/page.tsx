"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SwissCross } from "@/components/ui/swiss-cross";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowRight,
  CreditCard,
  Gift,
  Star,
  Crown,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  registerMerchant,
} from "@/actions/merchant/register";
import {
  createCheckoutSession,
  getEarlyBirdSeatsAvailable,
} from "@/actions/subscriptions";
import { getMerchantSession } from "@/actions/merchant/auth";
import { getAffiliateRef } from "@/components/analytics/AffiliateTracker";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

type Step = "plan" | "signup" | "redirecting";

interface SignupData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
  merchantId: string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Plan data — prices per WhatsApp subscriber tier
// ────────────────────────────────────────────────────────────────────────────

const TIER_DISPLAY_PRICES: Record<50 | 100 | 200, {
  launch: { monthly: string; semi: string; semiTotal: string; annual: string; annualTotal: string };
  catalogue: { monthly: string; semi: string; semiTotal: string; annual: string; annualTotal: string };
}> = {
  50: {
    launch:    { monthly: "49.95", semi: "44.90", semiTotal: "269.40", annual: "41.90", annualTotal: "502.80" },
    catalogue: { monthly: "69.95", semi: "62.90", semiTotal: "377.40", annual: "58.90", annualTotal: "706.80" },
  },
  100: {
    launch:    { monthly: "59.95", semi: "53.90", semiTotal: "323.40", annual: "49.90", annualTotal: "598.80" },
    catalogue: { monthly: "79.95", semi: "71.90", semiTotal: "431.40", annual: "66.90", annualTotal: "802.80" },
  },
  200: {
    launch:    { monthly: "99.95", semi: "89.90", semiTotal: "539.40", annual: "83.90", annualTotal: "1006.80" },
    catalogue: { monthly: "119.95", semi: "107.90", semiTotal: "647.40", annual: "99.90", annualTotal: "1198.80" },
  },
};

function getPlans(tier: 50 | 100 | 200, isEarlyBird: boolean) {
  const p = TIER_DISPLAY_PRICES[tier][isEarlyBird ? "launch" : "catalogue"];
  const cat = TIER_DISPLAY_PRICES[tier]["catalogue"];
  return [
    { id: "monthly" as const,    pricePerMonth: p.monthly, totalPrice: null,          cataloguePrice: isEarlyBird ? cat.monthly : null,  periodLabel: "/mois",     icon: Star,  highlighted: false, badgeText: null },
    { id: "semiannual" as const, pricePerMonth: p.semi,    totalPrice: p.semiTotal,   cataloguePrice: isEarlyBird ? cat.semi : null,     periodLabel: "/semestre", icon: Star,  highlighted: false, badgeText: null },
    { id: "annual" as const,     pricePerMonth: p.annual,  totalPrice: p.annualTotal, cataloguePrice: isEarlyBird ? cat.annual : null,   periodLabel: "/an",       icon: Crown, highlighted: true,  badgeText: "Meilleur rapport" },
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────────────

export default function MerchantSignupPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine initial step from query params
  const stepParam = searchParams.get("step") as Step | null;
  const planParam = searchParams.get("plan");
  const subsParam = searchParams.get("subs");
  const canceled = searchParams.get("canceled");

  // If plan pre-selected from URL, go straight to signup; otherwise show plan picker
  const initialStep: Step = stepParam === "plan" ? "plan"
    : planParam ? "signup"
    : "plan";

  const [currentStep, setCurrentStep] = useState<Step>(initialStep);

  // Signup state
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    merchantId: null,
  });

  // Plan state
  const [earlyBirdSeats, setEarlyBirdSeats] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    planParam || null
  );
  const [selectedWhatsAppTier, setSelectedWhatsAppTier] = useState<50 | 100 | 200>(
    subsParam === "200" ? 200 : subsParam === "50" ? 50 : 100
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ── Load Early Bird count on mount + restore merchantId ──
  useEffect(() => {
    getEarlyBirdSeatsAvailable().then(setEarlyBirdSeats);

    // 1. Try sessionStorage first (set during this signup flow)
    const savedMerchantId = sessionStorage.getItem("jt_merchant_id");
    if (savedMerchantId) {
      setSignupData((prev) => ({ ...prev, merchantId: savedMerchantId }));
      return;
    }
    // 2. Fallback: fetch from active Supabase auth session (page reload case)
    getMerchantSession().then((session) => {
      if (session?.merchant?.id) {
        setSignupData((prev) => ({ ...prev, merchantId: session.merchant.id }));
      }
    });
  }, []);

  // ── Navigation helpers ──
  const goToStep = useCallback(
    (step: Step) => {
      setCurrentStep(step);
      setError("");
      const url = new URL(window.location.href);
      url.searchParams.set("step", step);
      window.history.replaceState({}, "", url.toString());
    },
    []
  );

  // ── If returning from canceled checkout ──
  useEffect(() => {
    if (canceled === "1") {
      setError("Paiement annulé. Vous pouvez choisir un autre plan ou réessayer.");
    }
  }, [canceled]);

  // ────────────────────────────────────────────────────────────────────────
  // Step 1: Signup
  // ────────────────────────────────────────────────────────────────────────

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selectedPlanId) {
      setError("Veuillez sélectionner un plan.");
      return;
    }
    if (signupData.password !== signupData.passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);

    const result = await registerMerchant({
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      phone: signupData.phone,
      restaurantSlug: null,
    });

    if (!result.success) {
      setError(result.error || "Erreur inconnue");
      setLoading(false);
      return;
    }

    const merchantId = await fetchMerchantIdByEmail(signupData.email);
    if (!merchantId) {
      setError("Compte créé mais impossible de récupérer l'identifiant. Veuillez contacter le support.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("jt_merchant_id", merchantId);

    // Redirect directly to Stripe — no intermediate steps
    const affiliateRef = getAffiliateRef() || undefined;
    const checkoutResult = await createCheckoutSession({
      planType: selectedPlanId as "monthly" | "semiannual" | "annual",
      merchantId,
      locale,
      whatsappTier: selectedWhatsAppTier,
      affiliateRef,
    });

    if (checkoutResult.url) {
      setCurrentStep("redirecting");
      window.location.href = checkoutResult.url;
    } else {
      setError(checkoutResult.error || "Erreur lors de la création du paiement");
      setLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Stepper UI
  // ────────────────────────────────────────────────────────────────────────

  const steps = [
    { key: "plan", label: "Plan" },
    { key: "signup", label: "Compte & Paiement" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  const isEarlyBird = earlyBirdSeats !== null && earlyBirdSeats > 0;
  const plans = getPlans(selectedWhatsAppTier, isEarlyBird);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <SwissCross size={36} />
          <span className="text-xl font-bold">
            Just<span className="text-[var(--color-just-tag)]">-Tag</span>
          </span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Devenir partenaire
        </h1>
        <p className="mt-2 text-gray-500">
          14 jours d&apos;essai gratuit · Aucun débit pendant l&apos;essai
        </p>
      </div>

      {/* Step indicator */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i < stepIndex
                  ? "bg-green-500 text-white"
                  : i === stepIndex
                    ? "border-2 border-[var(--color-just-tag)] bg-white text-[var(--color-just-tag)]"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < stepIndex ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i === stepIndex
                  ? "font-semibold text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 ${
                  i < stepIndex ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1: Signup */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {currentStep === "signup" && (
        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          {/* Plan summary recap */}
          {planParam && subsParam && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">
                    {planParam === "monthly" ? "Mensuel" : planParam === "semiannual" ? "Semestriel" : "Annuel"}
                    {" · "}{Number(subsParam) * 4} messages/mois WhatsApp
                    {" · "}CHF {
                      TIER_DISPLAY_PRICES[Number(subsParam) as 50 | 100 | 200]?.launch[
                        planParam === "monthly" ? "monthly" : planParam === "semiannual" ? "semi" : "annual"
                      ]
                    }/mois
                  </span>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">14j gratuits</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              type="text"
              required
              value={signupData.name}
              onChange={(e) =>
                setSignupData((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Jean Dupont"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email professionnel *
            </label>
            <input
              type="email"
              required
              value={signupData.email}
              onChange={(e) =>
                setSignupData((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="vous@restaurant.ch"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe *
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={signupData.password}
                onChange={(e) =>
                  setSignupData((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Minimum 6 caractères"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={signupData.passwordConfirm}
              onChange={(e) => setSignupData((p) => ({ ...p, passwordConfirm: e.target.value }))}
              placeholder="Retapez votre mot de passe"
              className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-1 ${
                signupData.passwordConfirm && signupData.passwordConfirm !== signupData.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-[var(--color-just-tag)] focus:ring-[var(--color-just-tag)]"
              }`}
            />
            {signupData.passwordConfirm && signupData.passwordConfirm !== signupData.password && (
              <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numéro WhatsApp du restaurant <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <input
              type="tel"
              value={signupData.phone}
              onChange={(e) =>
                setSignupData((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+41 79 123 45 67"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-just-tag)] text-white hover:opacity-90 py-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Création du compte et redirection...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Créer mon compte et tester gratuitement 14 jours
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link
              href={`/${locale}/espace-client/connexion`}
              className="text-[var(--color-just-tag)] hover:underline font-medium"
            >
              Se connecter
            </Link>
          </p>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1: Plan selection */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {currentStep === "plan" && (
        <div className="mt-8 space-y-6">
          {isEarlyBird && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
              <span className="text-base">🎁</span>
              <span>Tarif de lancement — offre limitée aux 100 premiers restaurants.</span>
            </div>
          )}

          {/* WhatsApp subscriber tier selector */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Messages WhatsApp par mois</p>
            <div className="grid grid-cols-3 gap-2">
              {([50, 100, 200] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedWhatsAppTier(tier)}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
                    selectedWhatsAppTier === tier
                      ? "border-[var(--color-just-tag)] bg-white text-[var(--color-just-tag)] shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {tier * 4} msg/mois
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const PlanIcon = plan.icon;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative cursor-pointer rounded-xl border-2 bg-white p-5 transition-all ${
                    isSelected
                      ? "border-[var(--color-just-tag)] ring-2 ring-[var(--color-just-tag)]/20 shadow-lg"
                      : plan.highlighted
                        ? "border-gray-300 shadow-md hover:shadow-lg"
                        : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  {plan.badgeText && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[var(--color-just-tag)] text-white border-0 text-xs px-2">
                      {plan.badgeText}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <PlanIcon className="h-4 w-4 text-[var(--color-just-tag)]" />
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {plan.id === "monthly" ? "Mensuel" : plan.id === "semiannual" ? "Semestriel" : "Annuel"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[var(--color-just-tag)]">CHF {plan.pricePerMonth}</span>
                    <span className="text-xs text-gray-500">/mois</span>
                  </div>
                  {plan.cataloguePrice && (
                    <p className="mt-0.5 text-xs text-gray-400 line-through">CHF {plan.cataloguePrice}/mois</p>
                  )}
                  {plan.totalPrice && (
                    <p className="mt-0.5 text-xs text-gray-500">Soit CHF {plan.totalPrice} {plan.periodLabel}</p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Gift className="h-3 w-3" />
                    14j gratuits
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            disabled={!selectedPlanId}
            onClick={() => goToStep("signup")}
            className="w-full bg-[var(--color-just-tag)] text-white hover:opacity-90 py-3"
          >
            Continuer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP: Redirecting */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {currentStep === "redirecting" && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-just-tag)]" />
          <p className="text-lg font-medium text-gray-900">
            Redirection vers Stripe...
          </p>
          <p className="text-sm text-gray-500">
            Vous allez être redirigé vers la page de paiement sécurisée.
          </p>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helper server actions (called from client)
// ────────────────────────────────────────────────────────────────────────────

async function fetchMerchantIdByEmail(
  email: string
): Promise<string | null> {
  // We import the server action dynamically to keep this file as a client component
  const { getMerchantIdByEmail } = await import(
    "@/actions/merchant/register"
  );
  return getMerchantIdByEmail(email);
}

