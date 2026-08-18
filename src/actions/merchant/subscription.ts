"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe, getPriceId, EARLY_BIRD_LIMIT } from "@/lib/stripe";
import type { Subscription, Merchant } from "@/lib/supabase/types";

/**
 * Find merchant by auth_user_id first, then fallback to email.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findMerchant(supabase: any, userId: string, email: string): Promise<Merchant | null> {
  // Try auth_user_id first
  try {
    const { data } = await supabase
      .from("merchants")
      .select("*")
      .eq("auth_user_id", userId)
      .single();
    if (data) return data as Merchant;
  } catch {
    // Column may not exist yet — fallback to email
  }

  // Fallback: match by email (use admin client to bypass RLS)
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin.from("merchants") as any)
      .select("*")
      .eq("email", email)
      .single();
    return (data as Merchant) || null;
  } catch {
    return null;
  }
}

export async function getMerchantSubscription(): Promise<{
  success: boolean;
  error: string | null;
  data?: { subscription: Subscription; merchant: Merchant };
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant) return { success: false, error: "Marchand non trouvé" };

    // Use admin client to bypass RLS
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (admin.from("subscriptions") as any)
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!subscription) return { success: false, error: "Aucun abonnement trouvé" };

    return {
      success: true,
      error: null,
      data: { subscription: subscription as Subscription, merchant },
    };
  } catch {
    return { success: false, error: "Erreur inattendue" };
  }
}

type CurrentSubRow = {
  stripe_subscription_id: string | null;
  plan_type: string;
  status: string;
  is_early_bird: boolean;
  affiliate_ref: string | null;
};

/**
 * Redirige vers l'ancien flux de checkout Stripe (nouvelle session, avec
 * essai gratuit). N'est APPELÉE QUE lorsqu'on a déterminé qu'aucune mutation
 * n'a encore été tentée sur un abonnement Stripe existant — voir
 * createPlanChangeSession pour le détail du séquencement.
 */
async function fallbackToCheckout(
  planType: "monthly" | "semiannual" | "annual",
  whatsappTier: 50 | 100 | 200,
  locale: string,
  merchantId: string,
  affiliateRef: string | null | undefined
): Promise<{ url: string | null; error: string | null; updated?: boolean }> {
  try {
    const { createCheckoutSession } = await import("@/actions/subscriptions");
    return await createCheckoutSession({
      planType,
      merchantId,
      locale,
      whatsappTier,
      affiliateRef: affiliateRef || undefined,
    });
  } catch {
    return { url: null, error: "Erreur lors de la création de la session" };
  }
}

export async function createPlanChangeSession(
  planType: "monthly" | "semiannual" | "annual",
  whatsappTier: 50 | 100 | 200,
  locale: string = "fr"
): Promise<{ url: string | null; error: string | null; updated?: boolean }> {
  // ── Phase 0 : lecture seule (aucune mutation) ────────────────────────────
  let merchant: Merchant | null = null;
  let currentSub: CurrentSubRow | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: "Non authentifié" };

    merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant) return { url: null, error: "Marchand non trouvé" };

    const admin = createAdminClient();
    const { data } = await (admin.from("subscriptions") as ReturnType<typeof admin.from>)
      .select("stripe_subscription_id, plan_type, status, is_early_bird, affiliate_ref")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as { data: CurrentSubRow | null };
    currentSub = data;
  } catch {
    return { url: null, error: "Erreur lors de la création de la session" };
  }

  if (!merchant) return { url: null, error: "Marchand non trouvé" };

  // Décision produit (validée) : un changement de formule ne doit PAS créer
  // un second abonnement Stripe en parallèle — on met à jour l'abonnement
  // Stripe existant vers le nouveau prix, avec proratisation, sans nouvel
  // essai gratuit. On ne peut le faire que si l'abonnement local pointe vers
  // un vrai abonnement Stripe "vivant" :
  //  - stripe_subscription_id ressemble à un id de Subscription ("sub_…") —
  //    les abonnements "lifetime" stockent ici un payment_intent/checkout
  //    session id, pas un vrai abonnement à mettre à jour ;
  //  - plan_type n'est pas "lifetime" ;
  //  - le statut n'est pas déjà "canceled"/"incomplete" (rien à prolonger).
  // Cette décision est prise AVANT toute mutation : le fallback checkout
  // ci-dessous n'est atteignable QUE si on décide ici qu'il n'y a rien à
  // mettre à jour, jamais après une tentative de mutation Stripe (voir
  // phases 1/2/3 plus bas — bug de double facturation corrigé).
  const hasLiveStripeSubscription =
    !!currentSub?.stripe_subscription_id &&
    currentSub.stripe_subscription_id.startsWith("sub_") &&
    currentSub.plan_type !== "lifetime" &&
    ["active", "trialing", "past_due"].includes(currentSub.status) &&
    !!process.env.STRIPE_SECRET_KEY;

  if (!hasLiveStripeSubscription) {
    return fallbackToCheckout(planType, whatsappTier, locale, merchant.id, currentSub?.affiliate_ref);
  }

  // ── Phase 1 : préparation — AUCUNE mutation. Un échec ici ne signifie
  // jamais qu'une mutation a été tentée : le fallback checkout reste sûr. ──
  const subscriptionId = currentSub!.stripe_subscription_id as string;
  let stripe: ReturnType<typeof getStripe>;
  let itemId: string;
  let newPriceId: string;

  try {
    stripe = getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItem = stripeSub.items?.data?.[0];

    if (stripeSub.status === "canceled" || !currentItem) {
      throw new Error(`Abonnement Stripe ${subscriptionId} introuvable, annulé ou sans item.`);
    }

    // On préserve la "phase" tarifaire (early bird verrouillé vs. catalogue)
    // déjà appliquée à ce marchand plutôt que de la recalculer sur le
    // compteur global d'early birds au moment du changement — pour ne pas
    // faire perdre son tarif early bird à un client qui change juste de
    // durée/quota. HYPOTHÈSE PRODUIT NON CONFIRMÉE — à valider.
    const earlyBirdCountForPricing = currentSub!.is_early_bird ? 0 : EARLY_BIRD_LIMIT;
    const priceId = getPriceId(planType, earlyBirdCountForPricing, whatsappTier);
    if (!priceId) {
      return { url: null, error: "Plan invalide ou prix Stripe non configuré" };
    }

    itemId = currentItem.id;
    newPriceId = priceId;
  } catch (err) {
    console.error(
      "[createPlanChangeSession] Impossible de préparer la mise à jour de l'abonnement Stripe existant (aucune mutation tentée) — fallback vers un nouveau checkout:",
      err
    );
    return fallbackToCheckout(planType, whatsappTier, locale, merchant.id, currentSub?.affiliate_ref);
  }

  // ── Phase 2 : mutation Stripe. À PARTIR D'ICI, PLUS JAMAIS DE FALLBACK
  // VERS UN NOUVEAU CHECKOUT — un doute sur le succès de cet appel (ex.
  // timeout réseau après traitement côté Stripe) doit renvoyer une erreur
  // explicite à l'utilisateur, jamais créer un second abonnement. ──
  try {
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: "create_prorations",
    });
  } catch (err) {
    console.error("[createPlanChangeSession] Échec de la mise à jour de l'abonnement Stripe:", err);
    return {
      url: null,
      updated: false,
      error: "Impossible de mettre à jour votre abonnement pour le moment. Réessayez dans quelques instants ou contactez le support avant de retenter — aucun nouvel abonnement n'a été créé.",
    };
  }

  // ── Phase 3 : synchro locale. L'abonnement Stripe est déjà migré : même en
  // cas d'échec ici, on ne doit JAMAIS retomber sur un checkout. ──
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: syncError } = await (admin.from("subscriptions") as any)
    .update({
      plan_type: planType,
      whatsapp_tier: whatsappTier,
      stripe_price_id: newPriceId,
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (syncError) {
    console.error(
      "[createPlanChangeSession] Abonnement Stripe migré avec succès mais synchro Supabase locale échouée:",
      syncError
    );
    return {
      url: null,
      updated: false,
      error: "Votre formule a bien été mise à jour côté paiement, mais son affichage n'a pas pu être synchronisé immédiatement. Rechargez la page dans quelques instants ; contactez le support si le problème persiste.",
    };
  }

  return { url: null, error: null, updated: true };
}

const ALIGRO_CUSTOMER_NUMBER_MAX_LENGTH = 100;

/**
 * Met à jour le numéro de client Aligro du marchand CONNECTÉ (session-safe :
 * le merchantId est toujours dérivé de la session, jamais d'un paramètre
 * client). Une chaîne vide efface la valeur (NULL) — le numéro est optionnel
 * et sert uniquement à l'admin pour une vérification manuelle auprès
 * d'Aligro.
 */
export async function updateAligroCustomerNumber(value: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant) return { success: false, error: "Marchand non trouvé" };

    const trimmed = (value ?? "").trim();
    if (trimmed.length > ALIGRO_CUSTOMER_NUMBER_MAX_LENGTH) {
      return { success: false, error: `Le numéro client ALIGRO ne doit pas dépasser ${ALIGRO_CUSTOMER_NUMBER_MAX_LENGTH} caractères.` };
    }

    // Client admin (service role) : on bypasse le RLS legacy de la table
    // merchants (qui compare auth.uid() à merchants.id, incompatible avec le
    // modèle auth_user_id/email utilisé ici), mais la mise à jour reste
    // strictement scoped à `merchant.id`, dérivé de la session ci-dessus —
    // jamais d'un id fourni par le client.
    const admin = createAdminClient();
    const { error } = await (admin.from("merchants") as ReturnType<typeof admin.from>)
      .update({ aligro_customer_number: trimmed.length > 0 ? trimmed : null } as Record<string, unknown>)
      .eq("id", merchant.id);

    if (error) {
      console.error("[updateAligroCustomerNumber] Échec de la mise à jour:", error);
      return { success: false, error: "Impossible d'enregistrer le numéro client ALIGRO." };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("[updateAligroCustomerNumber] Erreur inattendue:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

export async function createBillingPortalSession(locale: string = "fr"): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { url: null, error: "Stripe non configuré" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: "Non authentifié" };

    const merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant?.stripe_customer_id) {
      return { url: null, error: "Client Stripe non trouvé" };
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app"}/${locale}/espace-client/abonnement`,
      locale: (locale === "fr" || locale === "de" || locale === "en" || locale === "pt" || locale === "es" ? locale : "fr") as "fr" | "de" | "en" | "pt" | "es",
    });

    return { url: session.url, error: null };
  } catch {
    return { url: null, error: "Erreur lors de la création de la session" };
  }
}
