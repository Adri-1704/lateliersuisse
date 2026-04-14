"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFeatured, searchRestaurants } from "@/actions/admin/featured";
import type { FeaturedRestaurantRow } from "@/actions/admin/featured";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Search, Star } from "lucide-react";

interface FeaturedManagerProps {
  restaurants: FeaturedRestaurantRow[];
}

export function FeaturedManager({ restaurants }: FeaturedManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; city: string | null; canton: string | null; is_featured: boolean }[]>([]);
  const [searching, setSearching] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  async function handleSearch(query: string) {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await searchRestaurants(query);
    if (res.data) {
      setResults(res.data.filter((r) => !r.is_featured));
    }
    setSearching(false);
  }

  function handleAdd(restaurant: { id: string; name: string }) {
    startTransition(async () => {
      const res = await toggleFeatured(restaurant.id, true);
      if (res.success) {
        toast.success(`${restaurant.name} ajouté aux restaurants du mois`);
        setSearch("");
        setResults([]);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'ajout");
      }
    });
  }

  function handleRemove(id: string, name: string) {
    if (confirmRemoveId !== id) {
      setConfirmRemoveId(id);
      return;
    }
    setConfirmRemoveId(null);
    startTransition(async () => {
      const res = await toggleFeatured(id, false);
      if (res.success) {
        toast.success(`${name} retiré des restaurants du mois`);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors du retrait");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Recherche pour ajouter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Ajouter un restaurant</label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un restaurant par nom..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {(searching || results.length > 0 || (search.length >= 2 && results.length === 0 && !searching)) && (
          <div className="max-w-md rounded-md border bg-background shadow-sm">
            {searching && (
              <p className="p-3 text-sm text-muted-foreground">Recherche...</p>
            )}
            {!searching && results.length === 0 && search.length >= 2 && (
              <p className="p-3 text-sm text-muted-foreground">Aucun restaurant trouvé (ou déjà tous sélectionnés)</p>
            )}
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
              >
                <div className="text-sm">
                  <span className="font-medium">{r.name}</span>
                  {r.city && (
                    <span className="ml-2 text-muted-foreground">
                      {r.city}{r.canton ? ` (${r.canton})` : ""}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleAdd({ id: r.id, name: r.name })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liste des restaurants featured */}
      {restaurants.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Aucun restaurant sélectionné comme restaurant du mois.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Canton</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Avis</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name_fr}</TableCell>
                  <TableCell>{r.city || "—"}</TableCell>
                  <TableCell>
                    {r.canton ? (
                      <Badge variant="outline">{r.canton}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {r.avg_rating ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {r.avg_rating.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{r.review_count ?? 0}</TableCell>
                  <TableCell>
                    <Button
                      variant={confirmRemoveId === r.id ? "destructive" : "ghost"}
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleRemove(r.id, r.name_fr)}
                      onBlur={() => setConfirmRemoveId(null)}
                    >
                      {confirmRemoveId === r.id ? (
                        "Confirmer"
                      ) : (
                        <>
                          <Trash2 className="mr-1 h-3 w-3" />
                          Retirer
                        </>
                      )}
                    </Button>
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
