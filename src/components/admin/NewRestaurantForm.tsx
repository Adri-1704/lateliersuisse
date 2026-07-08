"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRestaurant } from "@/actions/admin/restaurants";
import { toast } from "sonner";

const cantons = [
  "Zurich", "Berne", "Lucerne", "Uri", "Schwyz", "Obwald", "Nidwald",
  "Glaris", "Zoug", "Fribourg", "Soleure", "Bale-Ville", "Bale-Campagne",
  "Schaffhouse", "Appenzell Rh.-Ext.", "Appenzell Rh.-Int.", "Saint-Gall",
  "Grisons", "Argovie", "Thurgovie", "Tessin", "Vaud", "Valais",
  "Neuchâtel", "Genève", "Jura",
];

const inputClass =
  "w-full rounded-xl border border-[#eaecf0] bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5";

export function NewRestaurantForm() {
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
      });

      if (res.success) {
        toast.success("Restaurant créé avec succès");
        router.push("/admin/restaurants");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la création");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name_fr" className={labelClass}>Nom du restaurant *</label>
          <input id="name_fr" name="name_fr" required placeholder="Ex: Le Petit Prince" className={inputClass} />
        </div>

        <div>
          <label htmlFor="cuisine_type" className={labelClass}>Type de cuisine</label>
          <input id="cuisine_type" name="cuisine_type" placeholder="Ex: Française, Italienne..." className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Gamme de prix</label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className={inputClass}
          >
            <option value="1">CHF — Budget</option>
            <option value="2">CHF CHF — Moyen</option>
            <option value="3">CHF CHF CHF — Haut de gamme</option>
            <option value="4">CHF CHF CHF CHF — Luxe</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Canton *</label>
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Sélectionner un canton</option>
            {cantons.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className={labelClass}>Ville *</label>
          <input id="city" name="city" required placeholder="Ex: Genève" className={inputClass} />
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>Adresse</label>
          <input id="address" name="address" placeholder="Ex: Rue du Rhône 15" className={inputClass} />
        </div>

        <div>
          <label htmlFor="postal_code" className={labelClass}>Code postal</label>
          <input id="postal_code" name="postal_code" placeholder="Ex: 1204" className={inputClass} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Téléphone</label>
          <input id="phone" name="phone" type="tel" placeholder="Ex: +41 22 123 45 67" className={inputClass} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" placeholder="Ex: contact@restaurant.ch" className={inputClass} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="website" className={labelClass}>Site web</label>
          <input id="website" name="website" type="url" placeholder="Ex: https://restaurant.ch" className={inputClass} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description_fr" className={labelClass}>Description</label>
          <textarea id="description_fr" name="description_fr" rows={4} placeholder="Description du restaurant..." className={inputClass + " resize-none"} />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending || !canton}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Création..." : "Créer le restaurant"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/restaurants")}
          className="rounded-xl border border-[#eaecf0] bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
