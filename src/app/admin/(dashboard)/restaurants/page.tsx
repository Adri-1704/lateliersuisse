import Link from "next/link";
import { listRestaurants } from "@/actions/admin/restaurants";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Star } from "lucide-react";

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; published?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listRestaurants({
    page,
    search: params.search,
    published: params.published,
  });

  const restaurants = result.data?.restaurants || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const priceLabels: Record<string, string> = { "1": "CHF", "2": "CHF CHF", "3": "CHF CHF CHF", "4": "CHF CHF CHF CHF" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">{total} restaurant{total > 1 ? "s" : ""}</p>
        </div>
        <Button asChild className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]">
          <Link href="/admin/restaurants/new">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      <SearchInput placeholder="Rechercher par nom, ville, canton..." />

      {restaurants.length === 0 ? (
        <EmptyState title="Aucun restaurant" description="Aucun restaurant ne correspond a votre recherche." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Canton</TableHead>
                  <TableHead>Cuisine</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name_fr}</TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>{r.canton}</TableCell>
                    <TableCell>{r.cuisine_type}</TableCell>
                    <TableCell className="text-xs">{priceLabels[r.price_range] || r.price_range}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {r.avg_rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.is_published ? "default" : "secondary"}>
                        {r.is_published ? "Publie" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/restaurants/${r.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} />
        </>
      )}
    </div>
  );
}
