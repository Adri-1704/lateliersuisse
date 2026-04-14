import Link from "next/link";
import { getRestaurant } from "@/actions/admin/restaurants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCheck, UserX } from "lucide-react";
import { RestaurantEditForm } from "./RestaurantEditForm";
import { UnlinkMerchantButton } from "./UnlinkMerchantButton";
import { createAdminClient } from "@/lib/supabase/server";

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

  // Fetch merchant info if restaurant is claimed
  let merchant: { id: string; name: string; email: string } | null = null;
  if ((r as Record<string, unknown>).merchant_id) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("merchants")
      .select("id, name, email")
      .eq("id", (r as Record<string, unknown>).merchant_id)
      .single();
    merchant = data as { id: string; name: string; email: string } | null;
  }

  const claimStatus = (r as Record<string, unknown>).claim_status as string || "unclaimed";

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
          {r.is_published ? "Publié" : "Brouillon"}
        </Badge>
      </div>

      {/* Section commerçant lié */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {merchant ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 text-gray-400" />
            )}
            Commerçant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {merchant ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{merchant.name}</p>
                <p className="text-sm text-muted-foreground">{merchant.email}</p>
                <Badge variant="default" className="mt-1">
                  {claimStatus === "claimed" ? "Revendiqué" : claimStatus === "pending" ? "En attente" : claimStatus}
                </Badge>
              </div>
              <UnlinkMerchantButton restaurantId={r.id} merchantName={merchant.name} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun commerçant lié à ce restaurant.</p>
          )}
        </CardContent>
      </Card>

      <RestaurantEditForm restaurant={r} />
    </div>
  );
}
