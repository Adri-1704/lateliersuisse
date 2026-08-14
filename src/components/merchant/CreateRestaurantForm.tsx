"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { createMerchantRestaurant } from "@/actions/merchant/restaurant";
import type { CuisineType } from "@/lib/supabase/types";

const CANTONS_LIST = ["geneve", "vaud", "valais", "fribourg", "neuchatel", "jura", "berne"];

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent h-10";
const textareaClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none";
const fieldLabelClass = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1";

interface CreateRestaurantFormProps {
  cuisineTypes: CuisineType[];
  onCreated: () => void;
  /** Affiche l'en-tête "hero" (icône + titre). À désactiver quand le formulaire est déjà intégré dans un composant parent qui gère son propre titre. */
  showHeader?: boolean;
  /** Si fourni, affiche un lien de retour (ex. vers la recherche de restaurant). */
  onBack?: () => void;
}

export function CreateRestaurantForm({ cuisineTypes, onCreated, showHeader = true, onBack }: CreateRestaurantFormProps) {
  const t = useTranslations("merchantPortal.claim");
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

  return (
    <div className="space-y-6 max-w-2xl">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToSearch")}
        </button>
      )}

      {showHeader && (
        <div className="text-center py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #fff3ee, #ffe4d6)" }}>
            <Plus className="h-8 w-8" style={{ color: "#e85d26" }} />
          </div>
          <h1 className="mt-4 text-2xl font-black text-gray-900">Ajouter votre restaurant</h1>
          <p className="mt-2 text-[13px] text-gray-400">
            Renseignez les informations de votre restaurant pour le rendre visible sur la plateforme.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>{error}</div>
        )}

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Informations principales</h2>
          <div className="space-y-4">
            <div>
              <label className={fieldLabelClass}>Nom du restaurant *</label>
              <input value={form.name_fr} onChange={(e) => updateField("name_fr", e.target.value)} required placeholder="Le Petit Prince" className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabelClass}>Nom (DE)</label>
                <input value={form.name_de} onChange={(e) => updateField("name_de", e.target.value)} placeholder="Optionnel" className={inputClass} />
              </div>
              <div>
                <label className={fieldLabelClass}>Nom (EN)</label>
                <input value={form.name_en} onChange={(e) => updateField("name_en", e.target.value)} placeholder="Optionnel" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={fieldLabelClass}>Description</label>
              <textarea value={form.description_fr} onChange={(e) => updateField("description_fr", e.target.value)} rows={3} placeholder="Décrivez votre restaurant..." className={textareaClass} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Localisation</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={fieldLabelClass}>Adresse</label><input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Rue de la Gare 12" className={inputClass} /></div>
            <div><label className={fieldLabelClass}>Code postal</label><input value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} placeholder="1200" className={inputClass} /></div>
            <div><label className={fieldLabelClass}>Ville *</label><input value={form.city} onChange={(e) => updateField("city", e.target.value)} required placeholder="Genève" className={inputClass} /></div>
            <div>
              <label className={fieldLabelClass}>Canton *</label>
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
              <label className={fieldLabelClass}>Numéro de réservation</label>
              <input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} type="tel" placeholder="+41 22 123 45 67" className={inputClass} />
              <p className="mt-1 text-[11px] text-gray-400">Ce numéro apparaîtra comme bouton « Réserver » sur votre fiche publique</p>
            </div>
            <div><label className={fieldLabelClass}>Email</label><input value={form.email} onChange={(e) => updateField("email", e.target.value)} type="email" placeholder="contact@restaurant.ch" className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={fieldLabelClass}>Site web</label><input value={form.website} onChange={(e) => updateField("website", e.target.value)} type="url" placeholder="https://www.monrestaurant.ch" className={inputClass} /></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
          <h2 className="mb-4 font-bold text-gray-900">Type de cuisine &amp; Prix</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={fieldLabelClass}>Type de cuisine</label>
              <select value={form.cuisine_type} onChange={(e) => updateField("cuisine_type", e.target.value)} className={inputClass}>
                <option value="">Choisir</option>
                {cuisineTypes.map((ct) => <option key={ct.id} value={ct.slug}>{ct.name_fr}</option>)}
              </select>
            </div>
            <div>
              <label className={fieldLabelClass}>Gamme de prix</label>
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
