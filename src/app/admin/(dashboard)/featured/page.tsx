import { listFeatured } from "@/actions/admin/featured";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";

const monthNames = ["", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

export default async function FeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month || String(now.getMonth() + 1));
  const year = parseInt(params.year || String(now.getFullYear()));
  const result = await listFeatured({ month, year });

  const featured = result.data?.featured || [];
  const total = result.data?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurants du mois</h1>
        <p className="text-muted-foreground">
          <Star className="mr-1 inline h-4 w-4 fill-yellow-400 text-yellow-400" />
          {monthNames[month]} {year} — {total} restaurant{total > 1 ? "s" : ""} selectionne{total > 1 ? "s" : ""}
        </p>
      </div>

      {featured.length === 0 ? (
        <EmptyState title="Aucun restaurant selectionne" description="Aucun restaurant du mois pour cette periode." />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Ajoute le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featured.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Badge variant="outline">#{f.position}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{f.restaurant_name || f.restaurant_id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(f.created_at).toLocaleDateString("fr-CH")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
