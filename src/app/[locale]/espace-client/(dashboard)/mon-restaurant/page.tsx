"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CheckCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getMerchantRestaurant, updateMerchantRestaurant, createMerchantRestaurant, getCuisineTypes } from "@/actions/merchant/restaurant";
import type { DbRestaurant, CuisineType } from "@/lib/supabase/types";
import { featuresOptions } from "@/data/mock-restaurants";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi",
  thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
};

const CANTONS = [
  "geneve", "vaud", "valais", "fribourg", "neuchatel", "jura",
  "berne", "zurich", "bale-ville", "bale-campagne", "lucerne", "argovie",
  "soleure", "schwyz", "zoug", "uri", "obwald", "nidwald",
  "glaris", "schaffhouse", "thurgovie", "appenzell-rh-ext", "appenzell-rh-int",
  "saint-gall", "grisons", "tessin",
];

export default function MyRestaurantPage() {
  const t = useTranslations("merchantPortal");
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name_fr: "", name_de: "", name_en: "",
    description_fr: "", description_de: "", description_en: "",
    cuisine_type: "", address: "", city: "", canton: "", postal_code: "",
    phone: "", email: "", website: "",
    instagram: "", facebook: "", tiktok: "",
    price_range: "2",
    features: [] as string[],
    opening_hours: {} as Record<string, { open: string; close: string; closed?: boolean }>,
  });

  useEffect(() => {
    async function load() {
      const [restResult, types] = await Promise.all([
        getMerchantRestaurant(),
        getCuisineTypes(),
      ]);

      setCuisineTypes(types);

      if (restResult.success && restResult.data) {
        const r = restResult.data;
        setRestaurant(r);
        setForm({
          name_fr: r.name_fr || "", name_de: r.name_de || "", name_en: r.name_en || "",
          description_fr: r.description_fr || "", description_de: r.description_de || "", description_en: r.description_en || "",
          cuisine_type: r.cuisine_type || "", address: r.address || "",
          city: r.city || "", canton: r.canton || "", postal_code: r.postal_code || "",
          phone: r.phone || "", email: r.email || "", website: r.website || "",
          instagram: r.instagram || "", facebook: r.facebook || "", tiktok: r.tiktok || "",
          price_range: String(r.price_range) || "2",
          features: r.features || [],
          opening_hours: r.opening_hours || {},
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateMerchantRestaurant({
      ...form,
      cuisine_type_id: cuisineTypes.find((c) => c.slug === form.cuisine_type)?.id,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
    setSaving(false);
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFeature(feature: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  }

  function updateHours(day: string, field: "open" | "close", value: string) {
    setForm((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: { ...prev.opening_hours[day], [field]: value, closed: false },
      },
    }));
  }

  function toggleDayClosed(day: string) {
    setForm((prev) => {
      const current = prev.opening_hours[day];
      return {
        ...prev,
        opening_hours: {
          ...prev.opening_hours,
          [day]: current?.closed
            ? { open: "11:30", close: "22:00" }
            : { open: "", close: "", closed: true },
        },
      };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!restaurant) {
    return <CreateRestaurantView />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("restaurant.title")}</h1>
          <p className="text-muted-foreground">{t("restaurant.subtitle")}</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{t("restaurant.saved")}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Names */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.names")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Nom (FR)</Label>
              <Input value={form.name_fr} onChange={(e) => updateField("name_fr", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Nom (DE)</Label>
              <Input value={form.name_de} onChange={(e) => updateField("name_de", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Nom (EN)</Label>
              <Input value={form.name_en} onChange={(e) => updateField("name_en", e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        {/* Descriptions */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.descriptions")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description (FR)</Label>
              <Textarea value={form.description_fr} onChange={(e) => updateField("description_fr", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Description (DE)</Label>
              <Textarea value={form.description_de} onChange={(e) => updateField("description_de", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea value={form.description_en} onChange={(e) => updateField("description_en", e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Location & Contact */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.location")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("restaurant.address")}</Label>
              <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.postalCode")}</Label>
              <Input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.city")}</Label>
              <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.canton")}</Label>
              <select
                value={form.canton}
                onChange={(e) => updateField("canton", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">—</option>
                {CANTONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.phone")}</Label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" />
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.emailField")}</Label>
              <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} type="email" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("restaurant.website")}</Label>
              <Input value={form.website} onChange={(e) => updateField("website", e.target.value)} type="url" placeholder="https://" />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.socialMedia")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("restaurant.instagram")}</Label>
              <Input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} type="url" placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.facebook")}</Label>
              <Input value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} type="url" placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.tiktok")}</Label>
              <Input value={form.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} type="url" placeholder="https://tiktok.com/@..." />
            </div>
          </CardContent>
        </Card>

        {/* Cuisine & Price */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.cuisineAndPrice")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("restaurant.cuisineType")}</Label>
              <select
                value={form.cuisine_type}
                onChange={(e) => updateField("cuisine_type", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {cuisineTypes.map((ct) => (
                  <option key={ct.id} value={ct.slug}>{ct.name_fr}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t("restaurant.priceRange")}</Label>
              <select
                value={form.price_range}
                onChange={(e) => updateField("price_range", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="1">$ — Economique</option>
                <option value="2">$$ — Moyen</option>
                <option value="3">$$$ — Haut de gamme</option>
                <option value="4">$$$$ — Luxe</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.features")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {featuresOptions.map((feat) => (
                <button
                  key={feat.value}
                  type="button"
                  onClick={() => toggleFeature(feat.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.features.includes(feat.value)
                      ? "border-[var(--color-just-tag)] bg-[var(--color-just-tag)]/10 text-[var(--color-just-tag)]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {feat.labelFr}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader><CardTitle>{t("restaurant.openingHours")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day) => {
              const hours = form.opening_hours[day];
              const isClosed = hours?.closed;
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-24 text-sm font-medium">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={!!isClosed}
                      onChange={() => toggleDayClosed(day)}
                      className="rounded"
                    />
                    Ferme
                  </label>
                  {!isClosed && (
                    <>
                      <Input
                        type="time"
                        value={hours?.open || ""}
                        onChange={(e) => updateHours(day, "open", e.target.value)}
                        className="w-28"
                      />
                      <span className="text-sm text-muted-foreground">—</span>
                      <Input
                        type="time"
                        value={hours?.close || ""}
                        onChange={(e) => updateHours(day, "close", e.target.value)}
                        className="w-28"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("restaurant.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}

const CREATE_CANTONS = [
  "Zurich", "Berne", "Lucerne", "Uri", "Schwyz", "Obwald", "Nidwald",
  "Glaris", "Zoug", "Fribourg", "Soleure", "Bale-Ville", "Bale-Campagne",
  "Schaffhouse", "Appenzell Rh.-Ext.", "Appenzell Rh.-Int.", "Saint-Gall",
  "Grisons", "Argovie", "Thurgovie", "Tessin", "Vaud", "Valais",
  "Neuchatel", "Geneve", "Jura",
];

function CreateRestaurantView() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [canton, setCanton] = useState("");
  const [priceRange, setPriceRange] = useState("2");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createMerchantRestaurant({
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

    if (result.success) {
      toast.success("Restaurant cree avec succes !");
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsPending(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Creer mon restaurant</h1>
        <p className="text-muted-foreground">
          Remplissez les informations de base pour creer votre fiche restaurant.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Informations du restaurant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

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
                    {CREATE_CANTONS.map((c) => (
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
                <Textarea id="description_fr" name="description_fr" rows={4} placeholder="Decrivez votre restaurant..." />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || !canton}
              className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Creer mon restaurant
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
