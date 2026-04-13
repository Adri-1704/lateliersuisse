"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, CheckCircle, Plus, Copy, CopyCheck, Video } from "lucide-react";
import { getMerchantRestaurant, updateMerchantRestaurant, createMerchantRestaurant, getCuisineTypes } from "@/actions/merchant/restaurant";
import type { DbRestaurant, CuisineType } from "@/lib/supabase/types";
import { featuresOptions } from "@/data/mock-restaurants";
import { collections } from "@/data/collections";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi",
  thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
};

const CANTONS = [
  "geneve", "vaud", "valais", "fribourg", "neuchatel", "jura", "berne",
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
    video_url: "",
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
          video_url: r.video_url || "",
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

  function copyHoursToAll(sourceDay: string) {
    setForm((prev) => {
      const source = prev.opening_hours[sourceDay];
      if (!source) return prev;
      const updated = { ...prev.opening_hours };
      for (const day of DAYS) {
        if (day !== sourceDay) {
          updated[day] = { ...source };
        }
      }
      return { ...prev, opening_hours: updated };
    });
  }

  function copyHoursToNext(sourceDay: string) {
    const idx = DAYS.indexOf(sourceDay);
    if (idx < 0 || idx >= DAYS.length - 1) return;
    const nextDay = DAYS[idx + 1];
    setForm((prev) => {
      const source = prev.opening_hours[sourceDay];
      if (!source) return prev;
      return {
        ...prev,
        opening_hours: {
          ...prev.opening_hours,
          [nextDay]: { ...source },
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
    return (
      <CreateRestaurantForm
        cuisineTypes={cuisineTypes}
        onCreated={() => window.location.reload()}
      />
    );
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

        {/* Video */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video de presentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL de la video</Label>
              <Input
                value={form.video_url}
                onChange={(e) => updateField("video_url", e.target.value)}
                type="url"
                placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Collez un lien YouTube ou Vimeo. La video sera affichee sur votre page restaurant.
              </p>
            </div>
            {form.video_url && (
              <div className="rounded-lg border bg-green-50 p-3">
                <p className="text-sm text-green-700 font-medium">Video configuree</p>
                <p className="text-xs text-green-600 truncate mt-1">{form.video_url}</p>
              </div>
            )}
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

        {/* Ambiances */}
        <Card>
          <CardHeader>
            <CardTitle>Ambiances</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selectionnez les ambiances qui correspondent a votre restaurant. Cela vous rendra visible dans les pages Ambiances du site.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((col) => {
                const featureKey = col.filterFeature;
                if (!featureKey) return null;
                const isSelected = form.features.includes(featureKey);
                return (
                  <button
                    key={col.slug}
                    type="button"
                    onClick={() => toggleFeature(featureKey)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--color-just-tag)] bg-orange-50 text-gray-900"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{col.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{col.titleFr}</span>
                      {isSelected && (
                        <p className="text-xs text-[var(--color-just-tag)]">Active</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("restaurant.openingHours")}</CardTitle>
              {form.opening_hours[DAYS[0]] && !form.opening_hours[DAYS[0]]?.closed && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyHoursToAll(DAYS[0])}
                  className="text-xs gap-1.5"
                >
                  <CopyCheck className="h-3.5 w-3.5" />
                  Appliquer lundi a tous
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day, idx) => {
              const hours = form.opening_hours[day];
              const isClosed = hours?.closed;
              const hasHours = hours && !isClosed && hours.open;
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
                  {hasHours && idx < DAYS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => copyHoursToNext(day)}
                      className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                      title={`Copier vers ${DAY_LABELS[DAYS[idx + 1]]}`}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
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

function CreateRestaurantForm({
  cuisineTypes,
  onCreated,
}: {
  cuisineTypes: CuisineType[];
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name_fr: "",
    name_de: "",
    name_en: "",
    description_fr: "",
    cuisine_type: "",
    canton: "",
    city: "",
    address: "",
    postal_code: "",
    phone: "",
    email: "",
    website: "",
    price_range: "2",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createMerchantRestaurant(form);

    if (result.success) {
      onCreated();
    } else {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-just-tag)]/10">
          <Plus className="h-8 w-8 text-[var(--color-just-tag)]" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Ajouter votre restaurant</h1>
        <p className="mt-2 text-muted-foreground">
          Renseignez les informations de votre restaurant pour le rendre visible sur la plateforme.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Informations principales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du restaurant *</Label>
              <Input value={form.name_fr} onChange={(e) => updateField("name_fr", e.target.value)} required placeholder="Le Petit Prince" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom (DE)</Label>
                <Input value={form.name_de} onChange={(e) => updateField("name_de", e.target.value)} placeholder="Optionnel" />
              </div>
              <div className="space-y-2">
                <Label>Nom (EN)</Label>
                <Input value={form.name_en} onChange={(e) => updateField("name_en", e.target.value)} placeholder="Optionnel" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description_fr} onChange={(e) => updateField("description_fr", e.target.value)} rows={3} placeholder="Decrivez votre restaurant..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Localisation</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Rue de la Gare 12" />
            </div>
            <div className="space-y-2">
              <Label>Code postal</Label>
              <Input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} placeholder="1200" />
            </div>
            <div className="space-y-2">
              <Label>Ville *</Label>
              <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} required placeholder="Geneve" />
            </div>
            <div className="space-y-2">
              <Label>Canton *</Label>
              <select
                value={form.canton}
                onChange={(e) => updateField("canton", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Choisir un canton</option>
                {CANTONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Telephone</Label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" placeholder="+41 22 123 45 67" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => updateField("email", e.target.value)} type="email" placeholder="contact@restaurant.ch" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Site web</Label>
              <Input value={form.website} onChange={(e) => updateField("website", e.target.value)} type="url" placeholder="https://www.monrestaurant.ch" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Type de cuisine & Prix</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type de cuisine</Label>
              <select
                value={form.cuisine_type}
                onChange={(e) => updateField("cuisine_type", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Choisir</option>
                {cuisineTypes.map((ct) => (
                  <option key={ct.id} value={ct.slug}>{ct.name_fr}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Gamme de prix</Label>
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

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Creer mon restaurant
          </Button>
        </div>
      </form>
    </div>
  );
}
