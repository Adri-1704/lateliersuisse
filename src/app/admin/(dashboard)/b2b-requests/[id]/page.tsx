import Link from "next/link";
import { getB2BRequest } from "@/actions/admin/b2b-requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, Store, MapPin, Calendar, MessageSquare } from "lucide-react";
import { B2BStatusChanger } from "./B2BStatusChanger";

export default async function B2BRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getB2BRequest(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Demande non trouvee</h1>
        <Button asChild>
          <Link href="/admin/b2b-requests">Retour a la liste</Link>
        </Button>
      </div>
    );
  }

  const r = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/b2b-requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{r.first_name} {r.last_name}</h1>
          <p className="text-muted-foreground">{r.restaurant_name} — {r.city}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${r.email}`} className="text-blue-600 hover:underline">{r.email}</a>
            </div>
            {r.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${r.phone}`} className="text-blue-600 hover:underline">{r.phone}</a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span>{r.restaurant_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{r.city}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Recu le {new Date(r.created_at).toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Statut</CardTitle></CardHeader>
          <CardContent>
            <B2BStatusChanger id={r.id} currentStatus={r.status} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {r.message ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun message</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
