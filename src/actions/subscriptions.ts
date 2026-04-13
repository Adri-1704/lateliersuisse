"use server";

import { getStripe, PLAN_PRICES, getPriceId, TRIAL_DAYS } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { paymentConfirmation, merchantWelcome, freeTrialWelcome, freeTrialAdminNotification } from "@/lib/email-templates";
import { createServerClient } from "@supabase/ssr";

interface CreateCheckoutParams {
  planType: "monthly" | "semiannual" | "annual";
  merchantName: string;
  merchantEmail: string;
  merchantPhone: string;
  restaurantName: string;
  restaurantCity: string;
  locale: string;
}

interface CheckoutResult {
  url: string | null;
  error: string | null;
}

/**
 * Create a Stripe Checkout session for merchant subscription.
 * Falls back to a placeholder URL when Stripe is not configured.
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutResult> {
  const { planType, merchantEmail, locale } = params;

  try {
    // If Stripe is not configured, return placeholder
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        `[Stripe] Not configured. Placeholder checkout for ${merchantEmail} — Plan: ${planType}`
      );
      return {
        url: `/${locale}/partenaire-inscription/succes`,
        error: null,
      };
    }

    const stripe = getStripe();

    // Count active subscribers to determine Early Bird eligibility
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"]);

    const subscriberCount = count || 0;
    const priceId = getPriceId(planType, subscriberCount);

    if (!priceId) {
      return { url: null, error: "Invalid plan type or missing price configuration" };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: merchantEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
      },
      metadata: {
        merchant_name: params.merchantName,
        merchant_phone: params.merchantPhone,
        restaurant_name: params.restaurantName,
        restaurant_city: params.restaurantCity,
        plan_type: planType,
        locale: locale,
        early_bird: subscriberCount < 100 ? "true" : "false",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/partenaire-inscription/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/partenaire-inscription`,
      locale:
        locale === "fr"
          ? "fr"
          : locale === "de"
            ? "de"
            : locale === "pt"
              ? "pt"
              : locale === "es"
                ? "es"
                : "en",
    });

    return { url: session.url, error: null };
  } catch (error) {
    console.error("Checkout error:", error);
    return { url: null, error: "Failed to create checkout session" };
  }
}

/**
 * Handle Stripe webhook events for subscription lifecycle.
 * Called from /api/webhooks/stripe/route.ts
 */
export async function handleSubscriptionWebhook(
  eventType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<void> {
  switch (eventType) {
    case "checkout.session.completed": {
      console.log("Checkout completed:", data.id);

      // Create merchant + subscription in Supabase
      try {
        const supabase = createAdminClient();
        const metadata = data.metadata;

        // Create merchant
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: merchant } = await (supabase.from("merchants") as any)
          .upsert(
            {
              email: data.customer_email,
              name: metadata.merchant_name,
              phone: metadata.merchant_phone,
              stripe_customer_id: data.customer,
            },
            { onConflict: "email" }
          )
          .select()
          .single();

        if (merchant) {
          // Create subscription
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("subscriptions") as any).insert({
            merchant_id: merchant.id,
            stripe_subscription_id:
              data.subscription || data.payment_intent,
            plan_type: metadata.plan_type,
            status: "active",
            current_period_start: new Date().toISOString(),
          });

          // Create Supabase Auth user for merchant portal access
          try {
            const adminAuth = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              { cookies: { getAll() { return []; }, setAll() {} } }
            );

            // Create auth user with confirmed email
            const { data: authUser, error: authError } = await adminAuth.auth.admin.createUser({
              email: data.customer_email,
              email_confirm: true,
            });

            if (authError && authError.message?.includes("already been registered")) {
              // User already exists — link to merchant
              const { data: existingUsers } = await adminAuth.auth.admin.listUsers();
              const existingUser = existingUsers?.users?.find((u: { email?: string }) => u.email === data.customer_email);
              if (existingUser) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from("merchants") as any)
                  .update({ auth_user_id: existingUser.id })
                  .eq("id", merchant.id);
              }
            } else if (authUser?.user) {
              // Link auth user to merchant
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase.from("merchants") as any)
                .update({ auth_user_id: authUser.user.id })
                .eq("id", merchant.id);

              // Generate password reset link
              const { data: linkData } = await adminAuth.auth.admin.generateLink({
                type: "recovery",
                email: data.customer_email,
              });

              const recoveryUrl = linkData?.properties?.action_link || "";

              // Send welcome email with password setup link
              if (recoveryUrl && data.customer_email) {
                const locale = metadata.locale || "fr";
                const template = merchantWelcome(
                  {
                    merchantName: metadata.merchant_name || "",
                    merchantEmail: data.customer_email,
                    restaurantName: metadata.restaurant_name || "",
                    passwordResetUrl: recoveryUrl,
                  },
                  locale
                );
                await sendEmail({
                  to: data.customer_email,
                  subject: template.subject,
                  html: template.html,
                });
              }
            }
          } catch (authErr) {
            console.error("Auth user creation error:", authErr);
          }
        }
      } catch (err) {
        console.error(
          "Supabase error in checkout.session.completed:",
          err
        );
      }

      // Send payment confirmation email
      try {
        const metadata = data.metadata || {};
        const locale = metadata.locale || "fr";
        const template = paymentConfirmation(
          {
            merchantName: metadata.merchant_name || "",
            merchantEmail: data.customer_email || "",
            restaurantName: metadata.restaurant_name || "",
            planType: metadata.plan_type || "",
          },
          locale
        );

        if (data.customer_email) {
          await sendEmail({
            to: data.customer_email,
            subject: template.subject,
            html: template.html,
          });
        }
      } catch (err) {
        console.error("Email error in checkout.session.completed:", err);
      }

      break;
    }

    case "customer.subscription.updated": {
      console.log("Subscription updated:", data.id);

      try {
        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("subscriptions") as any)
          .update({
            status: data.status === "active" ? "active" : "past_due",
            current_period_start: new Date(
              data.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              data.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: data.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", data.id);
      } catch (err) {
        console.error(
          "Supabase error in customer.subscription.updated:",
          err
        );
      }

      break;
    }

    case "customer.subscription.deleted": {
      console.log("Subscription canceled:", data.id);

      try {
        const supabase = createAdminClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("subscriptions") as any)
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", data.id);
      } catch (err) {
        console.error(
          "Supabase error in customer.subscription.deleted:",
          err
        );
      }

      break;
    }

    default:
      console.log("Unhandled webhook event:", eventType);
  }
}

/**
 * Create a free trial merchant account (no Stripe payment).
 */
export async function createFreeTrial(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurantName: string;
  city: string;
  locale?: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createAdminClient();
    const { data: merchant, error: merchantError } = await (supabase
      .from("merchants") as any)
      .upsert({ email: params.email, name: params.name, phone: params.phone }, { onConflict: "email" })
      .select()
      .single();
    if (merchantError) throw merchantError;
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 30);
    const { error: subError } = await (supabase.from("subscriptions") as any).insert({
      merchant_id: merchant.id,
      plan_type: "monthly",
      status: "trialing",
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
    });
    if (subError) throw subError;

    // Send emails (non-blocking — don't fail the signup if emails fail)
    const locale = params.locale || "fr";
    const emailData = {
      merchantName: params.name,
      merchantEmail: params.email,
      restaurantName: params.restaurantName,
      city: params.city,
      trialEndDate: trialEnd.toLocaleDateString(locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH"),
    };

    // Welcome email to merchant
    const welcomeEmail = freeTrialWelcome(emailData, locale);
    await sendEmail({
      to: params.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    });

    // Admin notification
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminNotif = freeTrialAdminNotification(emailData);
      await sendEmail({
        to: adminEmail,
        subject: adminNotif.subject,
        html: adminNotif.html,
      });
    }

    return { success: true, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Impossible de créer le compte";
    return { success: false, error: msg };
  }
}
