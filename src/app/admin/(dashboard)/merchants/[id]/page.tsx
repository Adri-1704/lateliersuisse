import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/merchants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detail commercant</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Commercant #{id}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Les details du commercant seront affiches une fois Supabase connecte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
