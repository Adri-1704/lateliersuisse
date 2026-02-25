import Link from "next/link";
import { notFound } from "next/navigation";
import { getMerchant } from "@/actions/admin/merchants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { NewRestaurantForm } from "@/components/admin/NewRestaurantForm";

export default async function CreateMerchantRestaurantPage({
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

  // Redirect if merchant already has a restaurant
  if (merchant.restaurant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/merchants/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nouveau restaurant</h1>
          <p className="text-muted-foreground">Pour {merchant.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du restaurant</CardTitle>
          <CardDescription>
            Ce restaurant sera lie au commercant {merchant.name} ({merchant.email})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewRestaurantForm
            merchantId={id}
            redirectTo={`/admin/merchants/${id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
