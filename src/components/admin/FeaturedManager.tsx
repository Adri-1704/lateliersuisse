"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFeatured, removeFeatured, searchRestaurants } from "@/actions/admin/featured";
import type { FeaturedWithRestaurant } from "@/actions/admin/featured";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

interface FeaturedManagerProps {
  featured: FeaturedWithRestaurant[];
  month: number;
  year: number;
}

export function FeaturedManager({ featured, month, year }: FeaturedManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string } | null>(null);
  const [position, setPosition] = useState(String(featured.length + 1));

  async function handleSearch(query: string) {
    setSearch(query);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const res = await searchRestaurants(query);
    if (res.data) {
      const existingIds = new Set(featured.map((f) => f.restaurant_id));
      setResults(res.data.filter((r) => !existingIds.has(r.id)));
    }
    setSearching(false);
  }

  function handleAdd() {
    if (!selectedRestaurant) return;
    startTransition(async () => {
      const res = await addFeatured({
        restaurant_id: selectedRestaurant.id,
        month,
        year,
        position: parseInt(position) || featured.length + 1,
      });
      if (res.success) {
        toast.success(`${selectedRestaurant.name} ajoute aux restaurants du mois`);
        setDialogOpen(false);
        setSearch("");
        setResults([]);
        setSelectedRestaurant(null);
        setPosition(String(featured.length + 2));
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de l'ajout");
      }
    });
  }

  function handleRemove(id: string, name: string) {
    startTransition(async () => {
      const res = await removeFeatured(id);
      if (res.success) {
        toast.success(`${name} retire des restaurants du mois`);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la suppression");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSearch("");
            setResults([]);
            setSelectedRestaurant(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un restaurant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un restaurant du mois</DialogTitle>
              <DialogDescription>
                Recherchez un restaurant et ajoutez-le a la selection du mois.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un restaurant..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {selectedRestaurant ? (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="font-medium">{selectedRestaurant.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRestaurant(null)}>
                    Changer
                  </Button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-md border">
                  {searching && (
                    <p className="p-3 text-sm text-muted-foreground">Recherche...</p>
                  )}
                  {!searching && results.length === 0 && search.length >= 2 && (
                    <p className="p-3 text-sm text-muted-foreground">Aucun restaurant trouve</p>
                  )}
                  {!searching && search.length < 2 && (
                    <p className="p-3 text-sm text-muted-foreground">Tapez au moins 2 caracteres</p>
                  )}
                  {results.map((r) => (
                    <button
                      key={r.id}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                      onClick={() => setSelectedRestaurant(r)}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Position</label>
                <Input
                  type="number"
                  min="1"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1 w-24"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAdd} disabled={!selectedRestaurant || isPending}>
                {isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {featured.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Aucun restaurant selectionne pour cette periode.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Ajoute le</TableHead>
                <TableHead className="w-16">Actions</TableHead>
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleRemove(f.id, f.restaurant_name || "Restaurant")}
                    >
                      <Trash2 className="h-4 w-4" />
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
