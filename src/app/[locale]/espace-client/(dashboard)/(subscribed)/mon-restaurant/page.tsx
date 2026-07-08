"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Save, CheckCircle, Plus, Copy, CopyCheck, Video, UtensilsCrossed, MapPin, Share2, Clock } from "lucide-react";
import { getMerchantRestaurant, updateMerchantRestaurant, createMerchantRestaurant, getCuisineTypes } from "@/actions/merchant/restaurant";
import type { DbRestaurant, CuisineType } from "@/lib/supabase/types";
import { featuresOptions } from "@/data/mock-restaurants";
import { collections } from "@/data/collections";
import { WhatsAppQrCodeCard } from "@/components/merchant/WhatsAppQrCodeCard";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Lundi", tuesday: "Mardi", wednesday: "Mercredi",
  thursday: "Jeudi", friday: "Vendredi", saturday: "Samedi", sunday: "Dimanche",
};
const CANTONS = ["geneve", "vaud", "valais", "fribourg", "neuchatel", "jura", "berne"];

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent h-10";
const textareaClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none";

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
      <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
        {icon}
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{children}</label>;
}

export default function MyRestaurantPage() {
  const t = useTranslations("merchantPortal");
  const [restaurant, setRestaurant] = useState<DbRestaurant | null>(null);
  const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const [restResult, types] = await Promise.all([getMerchantRestaurant(), getCuisineTypes()]);
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
      opening_hours: { ...prev.opening_hours, [day]: { ...prev.opening_hours[day], [field]: value, closed: false } },
    }));
  }

  function toggleDayClosed(day: string) {
    setForm((prev) => {
      const current = prev.opening_hours[day];
      return {
        ...prev,
        opening_hours: {
          ...prev.opening_hours,
          [day]: current?.closed ? { open: "11:30", close: "22:00" } : { open: "", close: "", closed: true },
        },
      };
    });
  }

  function copyHoursToAll(sourceDay: string) {
    setForm((prev) => {
      const source = prev.opening_hours[sourceDay];
      if (!source) return prev;
      const updated = { ...prev.opening_hours };
      for (const day of DAYS) { if (day !== sourceDay) updated[day] = { ...source }; }
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
      return { ...prev, opening_hours: { ...prev.opening_hours, [nextDay]: { ...source } } };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#e85d26" }} />
      </div>
    );
  }

  if (!restaurant) {
    return <CreateRestaurantForm cuisineTypes={cuisineTypes} onCreated={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}>
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">{t("restaurant.title")}</h1>
            <p className="text-[13px] text-gray-400">{t("restaurant.subtitle")}</p>
          </div>
        </div>
        {success && (
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
            <CheckCircle className="h-4 w-4" />
            {t("restaurant.saved")}
          </div>
        )}
      </div>

      {restaurant?.slug && (
        <WhatsAppQrCodeCard slug={restaurant.slug} restaurantName={restaurant.name_fr || restaurant.slug} />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        {/* Names */}
        <SectionCard icon={<UtensilsCrossed className="h-4 w-4" style={{ color: "#e85d26" }} />} title={t("restaurant.names")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><FieldLabel>Nom (FR) *</FieldLabel><input value={form.name_fr} onChange={(e) => updateField("name_fr", e.target.value)} required className={inputClass} /></div>
            <div><FieldLabel>Nom (DE)</FieldLabel><input value={form.name_de} onChange={(e) => updateField("name_de", e.target.value)} className={inputClass} /></div>
            <div><FieldLabel>Nom (EN)</FieldLabel><input value={form.name_en} onChange={(e) => updateField("name_en", e.target.value)} className={inputClass} /></div>
          </div>
        </SectionCard>

        {/* Descriptions */}
        <SectionCard icon={<UtensilsCrossed className="h-4 w-4" style={{ color: "#e85d26" }} />} title={t("restaurant.descriptions")}>
          <div className="space-y-4">
            <div><FieldLabel>Description (FR)</FieldLabel><textarea value={form.description_fr} onChange={(e) => updateField("description_fr", e.target.value)} rows={3} className={textareaClass} /></div>
            <div><FieldLabel>Description (DE)</FieldLabel><textarea value={form.description_de} onChange={(e) => updateField("description_de", e.target.value)} rows={3} className={textareaClass} /></div>
            <div><FieldLabel>Description (EN)</FieldLabel><textarea value={form.description_en} onChange={(e) => updateField("description_en", e.target.value)} rows={3} className={textareaClass} /></div>
          </div>
        </SectionCard>

        {/* Location & Contact */}
        <SectionCard icon={<MapPin className="h-4 w-4" style={{ color: "#3b82f6" }} />} title={t("restaurant.location")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><FieldLabel>{t("restaurant.address")}</FieldLabel><input value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} /></div>
            <div><FieldLabel>{t("restaurant.postalCode")}</FieldLabel><input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} className={inputClass} /></div>
            <div><FieldLabel>{t("restaurant.city")} *</FieldLabel><input value={form.city} onChange={(e) => updateField("city", e.target.value)} required className={inputClass} /></div>
            <div>
              <FieldLabel>{t("restaurant.canton")} *</FieldLabel>
              <select value={form.canton} onChange={(e) => updateField("canton", e.target.value)} required className={inputClass}>
                <option value="">—</option>
                {CANTONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("restaurant.phone")}</FieldLabel>
              <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" placeholder="+41 22 123 45 67" className={inputClass} />
              <p className="mt-1 text-[11px] text-gray-400">Ce numéro apparaîtra comme bouton « Réserver » sur votre fiche publique</p>
            </div>
            <div><FieldLabel>{t("restaurant.emailField")}</FieldLabel><input value={form.email} onChange={(e) => updateField("email", e.target.value)} type="email" className={inputClass} /></div>
            <div className="sm:col-span-2"><FieldLabel>{t("restaurant.website")}</FieldLabel><input value={form.website} onChange={(e) => updateField("website", e.target.value)} type="url" placeholder="https://" className={inputClass} /></div>
          </div>
        </SectionCard>

        {/* Social Media */}
        <SectionCard icon={<Share2 className="h-4 w-4" style={{ color: "#ec4899" }} />} title={t("restaurant.socialMedia")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><FieldLabel>{t("restaurant.instagram")}</FieldLabel><input value={form.instagram} onChange={(e) => updateField("instagram", e.target.value)} type="url" placeholder="https://instagram.com/..." className={inputClass} /></div>
            <div><FieldLabel>{t("restaurant.facebook")}</FieldLabel><input value={form.facebook} onChange={(e) => updateField("facebook", e.target.value)} type="url" placeholder="https://facebook.com/..." className={inputClass} /></div>
            <div><FieldLabel>{t("restaurant.tiktok")}</FieldLabel><input value={form.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} type="url" placeholder="https://tiktok.com/@..." className={inputClass} /></div>
          </div>
        </SectionCard>

        {/* Video */}
        <SectionCard icon={<Video className="h-4 w-4" style={{ color: "#8b5cf6" }} />} title="Vidéo de présentation">
          <div>
            <FieldLabel>URL de la vidéo</FieldLabel>
            <input
              value={form.video_url}
              onChange={(e) => updateField("video_url", e.target.value)}
              type="url"
              placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-gray-400">Collez un lien YouTube ou Vimeo. La vidéo sera affichée sur votre page restaurant.</p>
          </div>
          {form.video_url && (
            <div className="mt-3 rounded-xl p-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="text-sm font-semibold" style={{ color: "#16a34a" }}>Vidéo configurée</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: "#15803d" }}>{form.video_url}</p>
            </div>
          )}
        </SectionCard>

        {/* Cuisine & Price */}
        <SectionCard icon={<UtensilsCrossed className="h-4 w-4" style={{ color: "#f97316" }} />} title={t("restaurant.cuisineAndPrice")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>{t("restaurant.cuisineType")}</FieldLabel>
              <select value={form.cuisine_type} onChange={(e) => updateField("cuisine_type", e.target.value)} className={inputClass}>
                <option value="">—</option>
                {cuisineTypes.map((ct) => <option key={ct.id} value={ct.slug}>{ct.name_fr}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>{t("restaurant.priceRange")}</FieldLabel>
              <select value={form.price_range} onChange={(e) => updateField("price_range", e.target.value)} className={inputClass}>
                <option value="1">$ — Économique</option>
                <option value="2">$$ — Moyen</option>
                <option value="3">$$$ — Haut de gamme</option>
                <option value="4">$$$$ — Luxe</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Features */}
        <SectionCard icon={<UtensilsCrossed className="h-4 w-4" style={{ color: "#10b981" }} />} title={t("restaurant.features")}>
          <div className="flex flex-wrap gap-2">
            {featuresOptions.map((feat) => {
              const selected = form.features.includes(feat.value);
              return (
                <button
                  key={feat.value}
                  type="button"
                  onClick={() => toggleFeature(feat.value)}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all"
                  style={selected
                    ? { border: "1.5px solid #e85d26", background: "#fff3ee", color: "#e85d26" }
                    : { border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280" }}
                >
                  {feat.labelFr}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Ambiances */}
        <SectionCard icon={<UtensilsCrossed className="h-4 w-4" style={{ color: "#f59e0b" }} />} title="Ambiances">
          <p className="mb-4 text-[13px] text-gray-400">
            Sélectionnez les ambiances qui correspondent à votre restaurant. Cela vous rendra visible dans les pages Ambiances du site.
          </p>
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
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                  style={isSelected
                    ? { border: "1.5px solid #e85d26", background: "#fff3ee" }
                    : { border: "1.5px solid #eaecf0", background: "#fff" }}
                >
                  <span className="text-2xl">{col.icon}</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{col.titleFr}</span>
                    {isSelected && <p className="text-[10px] font-bold" style={{ color: "#e85d26" }}>Activé</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Opening Hours */}
        <SectionCard icon={<Clock className="h-4 w-4" style={{ color: "#6366f1" }} />} title={t("restaurant.openingHours")}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">Cochez « Fermé » pour les jours de fermeture</p>
            {form.opening_hours[DAYS[0]] && !form.opening_hours[DAYS[0]]?.closed && (
              <button
                type="button"
                onClick={() => copyHoursToAll(DAYS[0])}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                style={{ border: "1px solid #eaecf0" }}
              >
                <CopyCheck className="h-3.5 w-3.5" />
                Appliquer lundi à tous
              </button>
            )}
          </div>
          <div className="space-y-2">
            {DAYS.map((day, idx) => {
              const hours = form.opening_hours[day];
              const isClosed = hours?.closed;
              const hasHours = hours && !isClosed && hours.open;
              return (
                <div key={day} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#f8fafc" }}>
                  <span className="w-20 shrink-0 text-sm font-semibold text-gray-700">{DAY_LABELS[day]}</span>
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={!!isClosed} onChange={() => toggleDayClosed(day)} className="rounded" />
                    Fermé
                  </label>
                  {!isClosed && (
                    <>
                      <input
                        type="time"
                        value={hours?.open || ""}
                        onChange={(e) => updateHours(day, "open", e.target.value)}
                        className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="time"
                        value={hours?.close || ""}
                        onChange={(e) => updateHours(day, "close", e.target.value)}
                        className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none"
                      />
                    </>
                  )}
                  {hasHours && idx < DAYS.length - 1 && (
                    <button
                      type="button"
                      onClick={() => copyHoursToNext(day)}
                      className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
                      title={`Copier vers ${DAY_LABELS[DAYS[idx + 1]]}`}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("restaurant.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateRestaurantForm({ cuisineTypes, onCreated }: { cuisineTypes: CuisineType[]; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name_fr: "", name_de: "", name_en: "", description_fr: "",
    cuisine_type: "", canton: "", city: "", address: "", postal_code: "",
    phone: "", email: "", website: "", price_range: "2",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createMerchantRestaurant(form);
    if (result.success) { onCreated(); }
    else { setError(result.error); setSaving(false); }
  }

  const CANTONS_LIST = ["geneve", "vaud", "valais", "fribourg", "neuchatel", "jura", "berne"];

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="text-center py-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #fff3ee, #ffe4d6)" }}>
          <Plus className="h-8 w-8" style={{ color: "#e85d26" }} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-gray-900">Ajouter votre restaurant</h1>
        <p className="mt-2 text-[13px] text-gray-400">
          Renseignez les informations de votre restaurant pour le rendre visible sur la plateforme.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>{error}</div>
        )}

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Informations principales</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nom du restaurant *</label>
              <input value={form.name_fr} onChange={(e) => updateField("name_fr", e.target.value)} required placeholder="Le Petit Prince" className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nom (DE)</label>
                <input value={form.name_de} onChange={(e) => updateField("name_de", e.target.value)} placeholder="Optionnel" className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nom (EN)</label>
                <input value={form.name_en} onChange={(e) => updateField("name_en", e.target.value)} placeholder="Optionnel" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
              <textarea value={form.description_fr} onChange={(e) => updateField("description_fr", e.target.value)} rows={3} placeholder="Décrivez votre restaurant..." className={textareaClass} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Localisation</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Adresse</label><input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Rue de la Gare 12" className={inputClass} /></div>
            <div><label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Code postal</label><input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} placeholder="1200" className={inputClass} /></div>
            <div><label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Ville *</label><input value={form.city} onChange={(e) => updateField("city", e.target.value)} required placeholder="Genève" className={inputClass} /></div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Canton *</label>
              <select value={form.canton} onChange={(e) => updateField("canton", e.target.value)} required className={inputClass}>
                <option value="">Choisir un canton</option>
                {CANTONS_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Numéro de réservation</label>
              <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" placeholder="+41 22 123 45 67" className={inputClass} />
              <p className="mt-1 text-[11px] text-gray-400">Ce numéro apparaîtra comme bouton « Réserver » sur votre fiche publique</p>
            </div>
            <div><label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email</label><input value={form.email} onChange={(e) => updateField("email", e.target.value)} type="email" placeholder="contact@restaurant.ch" className={inputClass} /></div>
            <div className="sm:col-span-2"><label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Site web</label><input value={form.website} onChange={(e) => updateField("website", e.target.value)} type="url" placeholder="https://www.monrestaurant.ch" className={inputClass} /></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Type de cuisine &amp; Prix</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Type de cuisine</label>
              <select value={form.cuisine_type} onChange={(e) => updateField("cuisine_type", e.target.value)} className={inputClass}>
                <option value="">Choisir</option>
                {cuisineTypes.map((ct) => <option key={ct.id} value={ct.slug}>{ct.name_fr}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Gamme de prix</label>
              <select value={form.price_range} onChange={(e) => updateField("price_range", e.target.value)} className={inputClass}>
                <option value="1">$ — Économique</option>
                <option value="2">$$ — Moyen</option>
                <option value="3">$$$ — Haut de gamme</option>
                <option value="4">$$$$ — Luxe</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Créer mon restaurant
          </button>
        </div>
      </form>
    </div>
  );
}
