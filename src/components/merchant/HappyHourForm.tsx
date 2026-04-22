"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Trash2 } from "lucide-react";
import {
  createHappyHour,
  updateHappyHour,
  deleteHappyHour,
} from "@/actions/happy-hours";
import type { HappyHour, HappyHourPromoType } from "@/lib/supabase/types";

const PROMO_TYPES: {
  value: HappyHourPromoType;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    value: "percentage",
    label: "Pourcentage",
    hint: "-30% sur la carte",
    placeholder: "Ex: -30%",
  },
  {
    value: "fixed_amount",
    label: "Montant fixe",
    hint: "5 CHF offerts",
    placeholder: "Ex: 5 CHF",
  },
  {
    value: "free_item",
    label: "Article offert",
    hint: "Dessert offert",
    placeholder: "Ex: Dessert offert",
  },
  {
    value: "special_menu",
    label: "Menu special",
    hint: "Menu Tapas 19 CHF",
    placeholder: "Ex: Menu 19 CHF",
  },
];

interface Props {
  restaurantId: string;
  existing?: HappyHour;
  basePath: string;
}

// Convertit ISO UTC -> "YYYY-MM-DDTHH:mm" pour <input type="datetime-local">
function toDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return toDatetimeLocal(d.toISOString());
}

function defaultEnd(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 4);
  return toDatetimeLocal(d.toISOString());
}

export function HappyHourForm({ restaurantId, existing, basePath }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [promoType, setPromoType] = useState<HappyHourPromoType>(
    existing?.promo_type || "percentage",
  );
  const [promoValue, setPromoValue] = useState(existing?.promo_value || "");
  const [startsAt, setStartsAt] = useState(
    existing ? toDatetimeLocal(existing.starts_at) : defaultStart(),
  );
  const [endsAt, setEndsAt] = useState(
    existing ? toDatetimeLocal(existing.ends_at) : defaultEnd(),
  );
  const [placesEnabled, setPlacesEnabled] = useState(!!existing?.places_total);
  const [placesTotal, setPlacesTotal] = useState(
    existing?.places_total ? String(existing.places_total) : "",
  );
  const [isActive, setIsActive] = useState(existing ? existing.is_active : true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // datetime-local renvoie une heure LOCALE navigateur ; on doit convertir en ISO UTC
    const startsIso = new Date(startsAt).toISOString();
    const endsIso = new Date(endsAt).toISOString();

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      promo_type: promoType,
      promo_value: promoValue.trim() || null,
      starts_at: startsIso,
      ends_at: endsIso,
      places_total: placesEnabled && placesTotal ? parseInt(placesTotal, 10) : null,
      is_active: isActive,
    };

    startTransition(async () => {
      if (existing) {
        const res = await updateHappyHour(existing.id, payload);
        if (!res.success) {
          setError(res.error);
          return;
        }
        router.push(basePath);
        router.refresh();
      } else {
        const res = await createHappyHour(restaurantId, payload);
        if (!res.success) {
          setError(res.error);
          return;
        }
        router.push(`${basePath}/${res.id}`);
        router.refresh();
      }
    });
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("Supprimer cette Happy Hour ?")) return;
    startTransition(async () => {
      const res = await deleteHappyHour(existing.id);
      if (!res.success) {
        setError(res.error);
        return;
      }
      router.push(basePath);
      router.refresh();
    });
  }

  const currentPromo = PROMO_TYPES.find((p) => p.value === promoType)!;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-xl border bg-white p-5">
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Tapas Night -40%"
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Decrivez l'offre : produits concernes, conditions, ambiance..."
            maxLength={500}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-5">
        <div>
          <Label className="mb-2 block">Type de promotion *</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PROMO_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setPromoType(t.value)}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  promoType === t.value
                    ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{t.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valeur affichee</Label>
          <Input
            id="value"
            value={promoValue}
            onChange={(e) => setPromoValue(e.target.value)}
            placeholder={currentPromo.placeholder}
            maxLength={80}
          />
          <p className="text-xs text-gray-500">
            Ce texte court sera affiche en gros sur la fiche et dans le listing.
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h3 className="font-semibold text-gray-900">Creneau</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="starts_at">Debut *</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends_at">Fin *</Label>
            <Input
              id="ends_at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Heure Europe/Zurich. Vos visiteurs verront un badge &quot;En cours&quot; pendant le creneau.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="block">Places limitees</Label>
            <p className="text-xs text-gray-500">
              Nombre total de couverts / places pour cette offre.
            </p>
          </div>
          <Switch checked={placesEnabled} onCheckedChange={setPlacesEnabled} />
        </div>
        {placesEnabled && (
          <Input
            type="number"
            min="1"
            max="10000"
            value={placesTotal}
            onChange={(e) => setPlacesTotal(e.target.value)}
            placeholder="Ex: 20"
          />
        )}
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="block">Publier</Label>
            <p className="text-xs text-gray-500">
              Visible publiquement sur votre fiche et dans /happy-hours.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </section>

      <div className="flex items-center justify-between gap-2">
        <div>
          {existing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push(basePath)}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-rose-500 hover:bg-rose-600"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {existing ? "Mettre a jour" : "Publier la Happy Hour"}
          </Button>
        </div>
      </div>
    </form>
  );
}
