import { getMerchantSession } from "@/actions/merchant/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Eye, UtensilsCrossed, ArrowRight } from "lucide-react";
import Link from "next/link";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "A vie",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Actif", variant: "default" },
  past_due: { label: "Paiement en retard", variant: "destructive" },
  canceled: { label: "Annule", variant: "secondary" },
  incomplete: { label: "Incomplet", variant: "secondary" },
  trialing: { label: "Essai", variant: "default" },
};

export default async function MerchantDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getMerchantSession();

  const merchant = session?.merchant;
  const subscription = session?.subscription;
  const restaurant = session?.restaurant;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue{merchant ? `, ${merchant.name}` : ""} !
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurant?.avg_rating ? restaurant.avg_rating.toFixed(1) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">sur 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avis</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurant?.review_count || 0}</div>
            <p className="text-xs text-muted-foreground">avis clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant={restaurant?.is_published ? "default" : "secondary"}>
              {restaurant?.is_published ? "Publie" : "Brouillon"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abonnement</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-[var(--color-just-tag)]" />
          </CardHeader>
          <CardContent>
            {subscription ? (
              <>
                <div className="text-lg font-bold">
                  {planLabels[subscription.plan_type] || subscription.plan_type}
                </div>
                <Badge variant={statusLabels[subscription.status]?.variant || "secondary"}>
                  {statusLabels[subscription.status]?.label || subscription.status}
                </Badge>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun abonnement</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-[var(--color-just-tag)]/30 transition-colors">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-just-tag)]/10">
              <UtensilsCrossed className="h-5 w-5 text-[var(--color-just-tag)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Mon restaurant</h3>
              <p className="text-xs text-muted-foreground">Modifier ma fiche</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${locale}/espace-client/mon-restaurant`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-[var(--color-just-tag)]/30 transition-colors">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Ma carte</h3>
              <p className="text-xs text-muted-foreground">Gerer le menu</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${locale}/espace-client/carte`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-[var(--color-just-tag)]/30 transition-colors">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Eye className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Photos</h3>
              <p className="text-xs text-muted-foreground">Gerer les images</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${locale}/espace-client/photos`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant preview link */}
      {restaurant?.slug && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <h3 className="font-semibold">Voir ma fiche publique</h3>
              <p className="text-sm text-muted-foreground">
                {restaurant.name_fr} — {restaurant.city}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/restaurants/${restaurant.slug}`} target="_blank">
                Voir <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
