"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRestaurant } from "@/actions/admin/restaurants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const cantons = [
  "Zurich", "Berne", "Lucerne", "Uri", "Schwyz", "Obwald", "Nidwald",
  "Glaris", "Zoug", "Fribourg", "Soleure", "Bale-Ville", "Bale-Campagne",
  "Schaffhouse", "Appenzell Rh.-Ext.", "Appenzell Rh.-Int.", "Saint-Gall",
  "Grisons", "Argovie", "Thurgovie", "Tessin", "Vaud", "Valais",
  "Neuchatel", "Geneve", "Jura",
];

interface NewRestaurantFormProps {
  merchantId?: string;
  redirectTo?: string;
}

export function NewRestaurantForm({ merchantId, redirectTo }: NewRestaurantFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [canton, setCanton] = useState("");
  const [priceRange, setPriceRange] = useState("2");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createRestaurant({
        name_fr: formData.get("name_fr") as string,
        cuisine_type: formData.get("cuisine_type") as string,
        canton,
        city: formData.get("city") as string,
        address: formData.get("address") as string,
        postal_code: formData.get("postal_code") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string,
        price_range: priceRange,
        description_fr: formData.get("description_fr") as string,
        merchant_id: merchantId,
      });

      if (res.success) {
        toast.success("Restaurant cree avec succes");
        router.push(redirectTo || "/admin/restaurants");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la creation");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name_fr">Nom du restaurant *</Label>
          <Input id="name_fr" name="name_fr" required placeholder="Ex: Le Petit Prince" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine_type">Type de cuisine</Label>
          <Input id="cuisine_type" name="cuisine_type" placeholder="Ex: Francaise, Italienne..." />
        </div>

        <div className="space-y-2">
          <Label>Gamme de prix</Label>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">CHF - Budget</SelectItem>
              <SelectItem value="2">CHF CHF - Moyen</SelectItem>
              <SelectItem value="3">CHF CHF CHF - Haut de gamme</SelectItem>
              <SelectItem value="4">CHF CHF CHF CHF - Luxe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Canton *</Label>
          <Select value={canton} onValueChange={setCanton} required>
            <SelectTrigger>
              <SelectValue placeholder="Selectionner un canton" />
            </SelectTrigger>
            <SelectContent>
              {cantons.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville *</Label>
          <Input id="city" name="city" required placeholder="Ex: Geneve" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" placeholder="Ex: Rue du Rhone 15" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Code postal</Label>
          <Input id="postal_code" name="postal_code" placeholder="Ex: 1204" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telephone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="Ex: +41 22 123 45 67" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Ex: contact@restaurant.ch" />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Site web</Label>
          <Input id="website" name="website" type="url" placeholder="Ex: https://restaurant.ch" />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description_fr">Description</Label>
          <Textarea id="description_fr" name="description_fr" rows={4} placeholder="Description du restaurant..." />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || !canton}>
          {isPending ? "Creation..." : "Creer le restaurant"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/restaurants")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
