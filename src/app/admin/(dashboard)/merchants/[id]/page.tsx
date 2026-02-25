import Link from "next/link";
import { notFound } from "next/navigation";
import { getMerchant } from "@/actions/admin/merchants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ArrowLeft, Plus, ExternalLink } from "lucide-react";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "A vie",
};

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getMerchant(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const merchant = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/merchants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{merchant.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations du commerçant */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{merchant.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telephone</p>
              <p className="font-medium">{merchant.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inscription</p>
              <p className="font-medium">
                {new Date(merchant.created_at).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Abonnement */}
        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {merchant.subscription ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {planLabels[merchant.subscription.plan_type] || merchant.subscription.plan_type}
                  </Badge>
                  <StatusBadge status={merchant.subscription.status} />
                </div>
                {merchant.subscription.current_period_start && (
                  <div>
                    <p className="text-sm text-muted-foreground">Debut de periode</p>
                    <p className="font-medium">
                      {new Date(merchant.subscription.current_period_start).toLocaleDateString("fr-CH")}
                    </p>
                  </div>
                )}
                {merchant.subscription.current_period_end && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fin de periode</p>
                    <p className="font-medium">
                      {new Date(merchant.subscription.current_period_end).toLocaleDateString("fr-CH")}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Aucun abonnement</p>
            )}
          </CardContent>
        </Card>

        {/* Restaurant */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            {merchant.restaurant ? (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-lg">{merchant.restaurant.name_fr}</p>
                  <p className="text-sm text-muted-foreground">
                    {merchant.restaurant.city}, {merchant.restaurant.canton}
                  </p>
                  <Badge variant={merchant.restaurant.is_published ? "default" : "secondary"}>
                    {merchant.restaurant.is_published ? "Publie" : "Brouillon"}
                  </Badge>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/restaurants/${merchant.restaurant.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir le restaurant
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <p className="text-muted-foreground">Aucun restaurant lie a ce commercant.</p>
                <Button asChild>
                  <Link href={`/admin/merchants/${id}/create-restaurant`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Creer le restaurant
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
