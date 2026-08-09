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

export async function createPlanChangeSession(
  planType: "monthly" | "semiannual" | "annual",
  whatsappTier: 50 | 100 | 200,
  locale: string = "fr"
): Promise<{ url: string | null; error: string | null; updated?: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { url: null, error: "Non authentifié" };

    const merchant = await findMerchant(supabase, user.id, user.email || "");
    if (!merchant) return { url: null, error: "Marchand non trouvé" };

    const admin = createAdminClient();
    const { data: currentSub } = await (admin.from("subscriptions") as ReturnType<typeof admin.from>)
      .select("stripe_subscription_id, plan_type, status, is_early_bird, affiliate_ref")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as {
        data: {
          stripe_subscription_id: string | null;
          plan_type: string;
          status: string;
          is_early_bird: boolean;
          affiliate_ref: string | null;
        } | null;
      };

    // Décision produit (validée) : un changement de formule ne doit PAS
    // créer un second abonnement Stripe en parallèle — on met à jour
    // l'abonnement Stripe existant vers le nouveau prix, avec proratisation,
    // sans nouvel essai gratuit. On ne peut le faire que si l'abonnement
    // local pointe vers un vrai abonnement Stripe "vivant" :
    //  - stripe_subscription_id ressemble à un id de Subscription ("sub_…") —
    //    les abonnements "lifetime" stockent ici un payment_intent/checkout
    //    session id, pas un vrai abonnement à mettre à jour ;
    //  - plan_type n'est pas "lifetime" ;
    //  - le statut n'est pas déjà "canceled"/"incomplete" (rien à prolonger).
    // Si une de ces conditions manque, on retombe sur l'ancien flux de
    // checkout (fallback documenté plus bas).
    const hasLiveStripeSubscription =
      !!currentSub?.stripe_subscription_id &&
      currentSub.stripe_subscription_id.startsWith("sub_") &&
      currentSub.plan_type !== "lifetime" &&
      ["active", "trialing", "past_due"].includes(currentSub.status);

    if (hasLiveStripeSubscription && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        const stripeSub = await stripe.subscriptions.retrieve(
          currentSub!.stripe_subscription_id as string
        );
        const currentItem = stripeSub.items?.data?.[0];

        if (stripeSub.status !== "canceled" && currentItem) {
          // On préserve la "phase" tarifaire (early bird verrouillé vs.
          // catalogue) déjà appliquée à ce marchand plutôt que de la
          // recalculer sur le compteur global d'early birds au moment du
          // changement — pour ne pas faire perdre son tarif early bird à un
          // client qui change juste de durée/quota.
          // HYPOTHÈSE PRODUIT NON CONFIRMÉE PAR LE PROPRIÉTAIRE — à valider.
          const earlyBirdCountForPricing = currentSub!.is_early_bird ? 0 : EARLY_BIRD_LIMIT;
          const newPriceId = getPriceId(planType, earlyBirdCountForPricing, whatsappTier);

          if (!newPriceId) {
            return { url: null, error: "Plan invalide ou prix Stripe non configuré" };
          }

          await stripe.subscriptions.update(currentSub!.stripe_subscription_id as string, {
            items: [{ id: currentItem.id, price: newPriceId }],
            proration_behavior: "create_prorations",
          });

          // Synchronise immédiatement notre copie locale : le webhook
          // customer.subscription.updated ne renvoie que statut/dates de
          // période, jamais plan_type ni whatsapp_tier.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (admin.from("subscriptions") as any)
            .update({
              plan_type: planType,
              whatsapp_tier: whatsappTier,
              stripe_price_id: newPriceId,
            })
            .eq("stripe_subscription_id", currentSub!.stripe_subscription_id);

          return { url: null, error: null, updated: true };
        }
      } catch (err) {
        console.error(
          "[createPlanChangeSession] Échec de la mise à jour de l'abonnement Stripe, fallback vers un nouveau checkout:",
          err
        );
        // On retombe sur le flux de checkout classique ci-dessous plutôt que
        // de faire échouer toute la demande de changement de formule.
      }
    }

    // Fallback : pas d'abonnement Stripe "vivant" à mettre à jour (aucun
    // abonnement, abonnement lifetime, ou déjà annulé/incomplet) — on garde
    // l'ancien flux de création de session de checkout Stripe (avec essai
    // gratuit, comme pour une toute première souscription).
    const { createCheckoutSession } = await import("@/actions/subscriptions");
    return createCheckoutSession({
      planType,
      merchantId: merchant.id,
      locale,
      whatsappTier,
      affiliateRef: currentSub?.affiliate_ref || undefined,
    });
  } catch {
    return { url: null, error: "Erreur lors de la création de la session" };
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
