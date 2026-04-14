import Link from "next/link";
import { getClaimRequest } from "@/actions/admin/claims";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Store, MapPin, Calendar } from "lucide-react";
import { ClaimActions } from "./ClaimActions";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "default" },
  approved: { label: "Approuvé", variant: "outline" },
  rejected: { label: "Rejeté", variant: "destructive" },
};

export default async function ClaimRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getClaimRequest(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Demande non trouvée</h1>
        <Button asChild>
          <Link href="/admin/claim-requests">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const c = result.data;
  const status = statusConfig[c.status] || { label: c.status, variant: "outline" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/claim-requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{c.restaurant_name}</h1>
          <p className="text-muted-foreground">
            Demande de claim par {c.merchant_name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Restaurant info */}
        <Card>
          <CardHeader><CardTitle>Restaurant</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{c.restaurant_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{c.restaurant_city}</span>
            </div>
            {c.restaurant_slug && (
              <div className="text-sm">
                <Link
                  href={`/fr/restaurants/${c.restaurant_slug}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  Voir la fiche restaurant
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Merchant info */}
        <Card>
          <CardHeader><CardTitle>Commerçant</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{c.merchant_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${c.merchant_email}`} className="text-blue-600 hover:underline">
                {c.merchant_email}
              </a>
            </div>
            {c.merchant_phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${c.merchant_phone}`} className="text-blue-600 hover:underline">
                  {c.merchant_phone}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & metadata */}
        <Card>
          <CardHeader><CardTitle>Statut</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Statut actuel :</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Soumis le{" "}
                {new Date(c.created_at).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {c.resolved_at && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Traité le{" "}
                  {new Date(c.resolved_at).toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">Méthode :</span>{" "}
              <span className="font-medium">{c.method}</span>
            </div>
            {c.admin_notes && (
              <div className="text-sm">
                <span className="text-muted-foreground">Notes admin :</span>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{c.admin_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions (only for pending) */}
        {c.status === "pending" && (
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent>
              <ClaimActions claimId={c.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
