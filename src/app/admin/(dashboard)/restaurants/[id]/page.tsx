import Link from "next/link";
import { getRestaurant } from "@/actions/admin/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star } from "lucide-react";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRestaurant(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Restaurant non trouve</h1>
        <Button asChild>
          <Link href="/admin/restaurants">Retour a la liste</Link>
        </Button>
      </div>
    );
  }

  const r = result.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/restaurants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{r.name_fr}</h1>
          <p className="text-muted-foreground">{r.city}, {r.canton}</p>
        </div>
        <Badge variant={r.is_published ? "default" : "secondary"} className="ml-auto">
          {r.is_published ? "Publie" : "Brouillon"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="font-medium">Nom FR:</span> {r.name_fr}</div>
            <div><span className="font-medium">Nom DE:</span> {r.name_de}</div>
            <div><span className="font-medium">Nom EN:</span> {r.name_en}</div>
            <div><span className="font-medium">Slug:</span> {r.slug}</div>
            <div><span className="font-medium">Cuisine:</span> {r.cuisine_type}</div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Note:</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {r.avg_rating.toFixed(1)} ({r.review_count} avis)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Localisation</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="font-medium">Adresse:</span> {r.address}</div>
            <div><span className="font-medium">Code postal:</span> {r.postal_code}</div>
            <div><span className="font-medium">Ville:</span> {r.city}</div>
            <div><span className="font-medium">Canton:</span> {r.canton}</div>
            <div><span className="font-medium">Tel:</span> {r.phone}</div>
            <div><span className="font-medium">Email:</span> {r.email}</div>
            <div><span className="font-medium">Site web:</span> {r.website}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">Francais</p>
              <p className="text-muted-foreground">{r.description_fr || "\u2014"}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Allemand</p>
              <p className="text-muted-foreground">{r.description_de || "\u2014"}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Anglais</p>
              <p className="text-muted-foreground">{r.description_en || "\u2014"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
