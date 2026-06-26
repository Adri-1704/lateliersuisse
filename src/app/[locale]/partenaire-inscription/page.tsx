"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SwissCross } from "@/components/ui/swiss-cross";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Gift,
  Star,
  Crown,
  Check,
  Plus,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  registerMerchant,
  searchAvailableRestaurants,
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

type Step = "signup" | "restaurant" | "plan" | "redirecting";

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  merchantId: string | null;
}

interface RestaurantChoice {
  type: "existing" | "new" | "skip";
  slug?: string;
  name?: string;
  city?: string;
  restaurantId?: string;
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
  const restaurantParam = searchParams.get("restaurant");

  const [currentStep, setCurrentStep] = useState<Step>(stepParam || "signup");

  // Pre-selected restaurant from URL (?restaurant=slug)
  const [preselectedRestaurant, setPreselectedRestaurant] = useState<{
    slug: string;
    name: string;
    city: string;
  } | null>(null);

  useEffect(() => {
    if (!restaurantParam) return;
    searchAvailableRestaurants(restaurantParam).then((results) => {
      const match = results.find((r) => r.slug === restaurantParam);
      if (match) setPreselectedRestaurant(match);
    });
  }, [restaurantParam]);

  // Signup state
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    merchantId: null,
  });

  // Restaurant state
  const [restaurantChoice, setRestaurantChoice] =
    useState<RestaurantChoice | null>(null);
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [restaurantResults, setRestaurantResults] = useState<
    { slug: string; name: string; city: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantCity, setNewRestaurantCity] = useState("");
  const [newRestaurantCuisine, setNewRestaurantCuisine] = useState("");

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

  // ── Restaurant search debounce ──
  useEffect(() => {
    if (restaurantQuery.length < 2) {
      setRestaurantResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchAvailableRestaurants(restaurantQuery);
      setRestaurantResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [restaurantQuery]);

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
    if (canceled === "1" && stepParam === "plan") {
      setError("Paiement annulé. Vous pouvez choisir un autre plan ou réessayer.");
    }
  }, [canceled, stepParam]);

  // ────────────────────────────────────────────────────────────────────────
  // Step 1: Signup
  // ────────────────────────────────────────────────────────────────────────

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await registerMerchant({
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      phone: signupData.phone,
      restaurantSlug: null, // Restaurant selection is now a separate step
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Erreur inconnue");
      return;
    }

    // registerMerchant returns success but doesn't expose merchantId directly.
    // We need the merchantId for checkout. Let's fetch it by email.
    const merchantId = await fetchMerchantIdByEmail(signupData.email);
    if (!merchantId) {
      setError(
        "Compte créé mais impossible de récupérer l'identifiant. Veuillez contacter le support."
      );
      return;
    }

    setSignupData((prev) => ({ ...prev, merchantId }));
    sessionStorage.setItem("jt_merchant_id", merchantId);

    // Si un restaurant est pré-sélectionné depuis l'URL, auto-sélectionner
    if (preselectedRestaurant) {
      setRestaurantChoice({
        type: "existing",
        slug: preselectedRestaurant.slug,
        name: preselectedRestaurant.name,
        city: preselectedRestaurant.city,
      });
    }

    goToStep("restaurant");
  }

  // ────────────────────────────────────────────────────────────────────────
  // Step 2: Restaurant selection
  // ────────────────────────────────────────────────────────────────────────

  async function handleRestaurantClaim() {
    if (!restaurantChoice || !signupData.merchantId) return;
    setError("");
    setLoading(true);

    if (restaurantChoice.type === "existing" && restaurantChoice.slug) {
      // Re-run registerMerchant to create the claim request
      // Actually, we already created the merchant. We need a separate claim action.
      // Let's call a dedicated claim action.
      const claimResult = await createClaimForExistingMerchant(
        signupData.merchantId,
        signupData.name,
        signupData.email,
        signupData.phone,
        restaurantChoice.slug
      );
      if (!claimResult.success) {
        setError(claimResult.error || "Erreur lors de la revendication");
        setLoading(false);
        return;
      }
    } else if (restaurantChoice.type === "new") {
      // Create a new restaurant linked to merchant (unpublished)
      const createResult = await createNewRestaurantForMerchant(
        signupData.merchantId,
        newRestaurantName,
        newRestaurantCity,
        newRestaurantCuisine
      );
      if (!createResult.success) {
        setError(createResult.error || "Erreur lors de la création");
        setLoading(false);
        return;
      }
    }
    // type === "skip" → just move on

    setLoading(false);
    goToStep("plan");
  }

  // ────────────────────────────────────────────────────────────────────────
  // Step 3: Plan selection + checkout
  // ────────────────────────────────────────────────────────────────────────

  async function handleCheckout() {
    if (!selectedPlanId) {
      setError("Veuillez sélectionner un plan.");
      return;
    }
    if (!signupData.merchantId) {
      setError("Session expirée. Veuillez recommencer depuis le début.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const planType = selectedPlanId as
        | "monthly"
        | "semiannual"
        | "annual";

      const affiliateRef = getAffiliateRef() || undefined;

      const result = await createCheckoutSession({
        planType,
        merchantId: signupData.merchantId,
        locale,
        restaurantId: restaurantChoice?.restaurantId,
        whatsappTier: selectedWhatsAppTier,
        affiliateRef,
      });

      if (result.url) {
        setCurrentStep("redirecting");
        window.location.href = result.url;
      } else {
        setError(result.error || "Erreur lors de la création du paiement");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Stepper UI
  // ────────────────────────────────────────────────────────────────────────

  const steps = [
    { key: "signup", label: "Compte" },
    { key: "restaurant", label: "Restaurant" },
    { key: "plan", label: "Plan & Paiement" },
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
          Créez votre compte, associez votre restaurant et choisissez votre plan
        </p>
        {preselectedRestaurant && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <span className="text-green-600 text-lg">🍽️</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-green-800">
                Vous revendiquez : {preselectedRestaurant.name}
              </p>
              <p className="text-xs text-green-600">{preselectedRestaurant.city}</p>
            </div>
          </div>
        )}
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
                    ? "bg-[var(--color-just-tag)] text-white"
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
                    {" · "}{subsParam} abonnés WhatsApp
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
            <p className="mt-1 text-xs text-gray-500">
              Activez le plat du jour WhatsApp plus tard depuis votre tableau de bord. Vous pourrez l&apos;ajouter quand vous voudrez.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-just-tag)] text-white hover:opacity-90 py-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Création en cours...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Créer mon compte
                <ArrowRight className="h-4 w-4" />
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
      {/* STEP 2: Restaurant */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {currentStep === "restaurant" && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>
                Compte créé avec succès ! Associez maintenant votre restaurant.
              </span>
            </div>
          </div>

          {/* Option 1: Search existing restaurant */}
          {!showNewForm && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rechercher votre restaurant
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Trouvez votre restaurant dans notre base de données
              </p>

              {restaurantChoice?.type === "existing" ? (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      {restaurantChoice.name}
                    </span>
                    <span className="text-xs text-green-600">
                      ({restaurantChoice.city})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRestaurantChoice(null);
                      setRestaurantQuery("");
                    }}
                    className="text-xs text-green-600 hover:underline"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={restaurantQuery}
                    onChange={(e) => setRestaurantQuery(e.target.value)}
                    placeholder="Tapez le nom de votre restaurant..."
                    className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                  )}

                  {restaurantResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-48 overflow-y-auto">
                      {restaurantResults.map((r) => (
                        <button
                          key={r.slug}
                          type="button"
                          onClick={() => {
                            setRestaurantChoice({
                              type: "existing",
                              slug: r.slug,
                              name: r.name,
                              city: r.city,
                            });
                            setRestaurantQuery("");
                            setRestaurantResults([]);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900">
                            {r.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {r.city}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {restaurantQuery.length >= 2 &&
                    restaurantResults.length === 0 &&
                    !searching && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg p-4 text-center">
                        <p className="text-sm text-gray-500">
                          Aucun restaurant trouvé
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Vous pouvez créer votre fiche ci-dessous
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Separator */}
          {!showNewForm && !restaurantChoice && (
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-400">ou</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          )}

          {/* Option 2: Create new restaurant */}
          {!restaurantChoice && (
            <>
              {!showNewForm ? (
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => {
                    setShowNewForm(true);
                    setRestaurantChoice({ type: "new" });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Mon restaurant n&apos;est pas dans la liste
                </Button>
              ) : (
                <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Créer une nouvelle fiche restaurant
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom du restaurant *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRestaurantName}
                      onChange={(e) => setNewRestaurantName(e.target.value)}
                      placeholder="Le Petit Prince"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ville *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRestaurantCity}
                      onChange={(e) => setNewRestaurantCity(e.target.value)}
                      placeholder="Genève"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type de cuisine
                    </label>
                    <input
                      type="text"
                      value={newRestaurantCuisine}
                      onChange={(e) => setNewRestaurantCuisine(e.target.value)}
                      placeholder="Française, Italienne, Suisse..."
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewForm(false);
                      setRestaurantChoice(null);
                    }}
                  >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Annuler
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              disabled={
                loading ||
                (!restaurantChoice ||
                  (restaurantChoice.type === "existing" && !restaurantChoice.slug) ||
                  (restaurantChoice.type === "new" &&
                    (!newRestaurantName || !newRestaurantCity)))
              }
              onClick={handleRestaurantClaim}
              className="w-full bg-[var(--color-just-tag)] text-white hover:opacity-90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  En cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRestaurantChoice({ type: "skip" });
                goToStep("plan");
              }}
              className="w-full text-gray-600"
            >
              Passer cette étape — associer mon restaurant plus tard
            </Button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 3: Plan selection */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {currentStep === "plan" && (
        <div className="mt-8 space-y-6">
          {/* Trial info */}
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <ShieldCheck className="h-4 w-4" />
            <span>
              14 jours d&apos;essai gratuit sur les abonnements. Sans engagement.
            </span>
          </div>

          {/* Launch offer notice */}
          {isEarlyBird && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
              <span className="text-base">🎁</span>
              <span>Tarif de lancement — le prix barré est le tarif normal appliqué après les 100 premiers restaurants.</span>
            </div>
          )}

          {/* WhatsApp subscriber tier selector */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Nombre d&apos;abonnés WhatsApp</p>
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
                  {tier} abonnés
                </button>
              ))}
            </div>
          </div>

          {/* Subscription plans */}
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
                      {plan.id === "monthly"
                        ? "Mensuel"
                        : plan.id === "semiannual"
                          ? "Semestriel"
                          : "Annuel"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[var(--color-just-tag)]">
                      CHF {plan.pricePerMonth}
                    </span>
                    <span className="text-xs text-gray-500">/mois</span>
                  </div>
                  {plan.cataloguePrice && (
                    <p className="mt-0.5 text-xs text-gray-400 line-through">
                      CHF {plan.cataloguePrice}/mois
                    </p>
                  )}
                  {plan.totalPrice && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Soit CHF {plan.totalPrice} {plan.periodLabel}
                    </p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Gift className="h-3 w-3" />
                    14j gratuits
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => goToStep("restaurant")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button
              disabled={loading || !selectedPlanId}
              onClick={handleCheckout}
              className="flex-1 bg-[var(--color-just-tag)] text-white hover:opacity-90 py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirection vers le paiement...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {"Commencer l'essai gratuit (14j)"}
                </span>
              )}
            </Button>
          </div>
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

async function createClaimForExistingMerchant(
  merchantId: string,
  merchantName: string,
  merchantEmail: string,
  merchantPhone: string,
  restaurantSlug: string
): Promise<{ success: boolean; error: string | null }> {
  const { createClaimRequest } = await import(
    "@/actions/merchant/register"
  );
  return createClaimRequest({
    merchantId,
    merchantName,
    merchantEmail,
    merchantPhone,
    restaurantSlug,
  });
}

async function createNewRestaurantForMerchant(
  merchantId: string,
  name: string,
  city: string,
  cuisine: string
): Promise<{ success: boolean; error: string | null }> {
  const { createRestaurantForMerchant } = await import(
    "@/actions/merchant/register"
  );
  return createRestaurantForMerchant({
    merchantId,
    name,
    city,
    cuisine,
  });
}
