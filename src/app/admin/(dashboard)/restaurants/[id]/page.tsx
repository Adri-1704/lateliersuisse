import Link from "next/link";
import { getRestaurant } from "@/actions/admin/restaurants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { RestaurantEditForm } from "./RestaurantEditForm";

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

      <RestaurantEditForm restaurant={r} />
    </div>
  );
}
