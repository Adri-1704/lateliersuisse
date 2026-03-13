import Link from "next/link";
import { getMerchant } from "@/actions/admin/merchants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, CreditCard } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-gray-100 text-gray-700",
  incomplete: "bg-yellow-100 text-yellow-700",
  trialing: "bg-blue-100 text-blue-700",
};

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
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Commercant non trouve</h1>
        <Button asChild>
          <Link href="/admin/merchants">Retour a la liste</Link>
        </Button>
      </div>
    );
  }

  const m = result.data;
  const sub = m.subscription;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/merchants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{m.name}</h1>
          <p className="text-muted-foreground">{m.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${m.email}`} className="text-blue-600 hover:underline">{m.email}</a>
            </div>
            {m.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{m.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Inscrit le {new Date(m.created_at).toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sub ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Plan:</span>
                  <Badge variant="outline">{planLabels[sub.plan_type] || sub.plan_type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Statut:</span>
                  <Badge className={statusColors[sub.status] || ""}>{sub.status}</Badge>
                </div>
                {sub.current_period_start && (
                  <p className="text-sm text-muted-foreground">
                    Debut: {new Date(sub.current_period_start).toLocaleDateString("fr-CH")}
                  </p>
                )}
                {sub.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    Fin: {new Date(sub.current_period_end).toLocaleDateString("fr-CH")}
                  </p>
                )}
                {sub.cancel_at_period_end && (
                  <Badge variant="destructive">Annulation prevue</Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun abonnement actif</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
