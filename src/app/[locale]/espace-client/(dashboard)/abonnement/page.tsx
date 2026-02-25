"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, ExternalLink } from "lucide-react";
import { getMerchantSubscription, createBillingPortalSession } from "@/actions/merchant/subscription";
import type { Subscription, Merchant } from "@/lib/supabase/types";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "A vie",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  past_due: { label: "Paiement en retard", variant: "destructive" },
  canceled: { label: "Annule", variant: "secondary" },
  incomplete: { label: "Incomplet", variant: "secondary" },
  trialing: { label: "Periode d'essai", variant: "default" },
};

export default function SubscriptionPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getMerchantSubscription();
      if (result.success && result.data) {
        setSubscription(result.data.subscription);
        setMerchant(result.data.merchant);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("subscription.title")}</h1>
        <p className="text-muted-foreground">{t("subscription.subtitle")}</p>
      </div>

      {subscription ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Plan info */}
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

          {/* Period info */}
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-semibold">{t("subscription.noSubscription")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("subscription.noSubscriptionDescription")}</p>
          </CardContent>
        </Card>
      )}

      {/* Manage billing */}
      {subscription && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
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
