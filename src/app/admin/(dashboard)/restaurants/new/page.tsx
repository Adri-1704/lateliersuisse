import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NewRestaurantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/restaurants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nouveau restaurant</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulaire de creation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le formulaire de creation de restaurant sera disponible une fois Supabase connecte.
            En attendant, les restaurants sont geres via les donnees mock.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
