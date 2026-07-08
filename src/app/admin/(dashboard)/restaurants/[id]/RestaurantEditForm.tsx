"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRestaurant } from "@/actions/admin/restaurants";
import { CheckCircle, Loader2, Video, Tag } from "lucide-react";
import type { DbRestaurant } from "@/lib/supabase/types";

const inputClass =
  "w-full rounded-xl border border-[#eaecf0] bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5";

function FormCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function RestaurantEditForm({ restaurant }: { restaurant: DbRestaurant }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    name_fr: restaurant.name_fr,
    name_de: restaurant.name_de,
    name_en: restaurant.name_en,
    description_fr: restaurant.description_fr || "",
    description_de: restaurant.description_de || "",
    description_en: restaurant.description_en || "",
    cuisine_type: restaurant.cuisine_type || "",
    canton: restaurant.canton,
    city: restaurant.city,
    address: restaurant.address || "",
    postal_code: restaurant.postal_code || "",
    phone: restaurant.phone || "",
    email: restaurant.email || "",
    website: restaurant.website || "",
    instagram: restaurant.instagram || "",
    facebook: restaurant.facebook || "",
    tiktok: restaurant.tiktok || "",
    price_range: restaurant.price_range,
    is_published: restaurant.is_published,
    is_featured: restaurant.is_featured,
    video_url: restaurant.video_url || "",
    promotion_title: restaurant.promotion_title || "",
    promotion_description: restaurant.promotion_description || "",
    promotion_type: restaurant.promotion_type || "percentage",
    promotion_value: restaurant.promotion_value || "",
    promotion_active: restaurant.promotion_active || false,
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateRestaurant(restaurant.id, form);
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Restaurant mis à jour." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Erreur" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <FormCard title="Noms">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nom (FR)</label>
              <input value={form.name_fr} onChange={(e) => update("name_fr", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nom (DE)</label>
              <input value={form.name_de} onChange={(e) => update("name_de", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nom (EN)</label>
              <input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} className={inputClass} />
            </div>
          </div>
        </FormCard>

        <FormCard title="Localisation">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Canton</label>
              <input value={form.canton} onChange={(e) => update("canton", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ville</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Adresse</label>
              <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Code postal</label>
              <input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} className={inputClass} />
            </div>
          </div>
        </FormCard>

        <FormCard title="Contact">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Téléphone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Site web</label>
              <input value={form.website} onChange={(e) => update("website", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Facebook</label>
              <input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>TikTok</label>
              <input value={form.tiktok} onChange={(e) => update("tiktok", e.target.value)} className={inputClass} />
            </div>
          </div>
        </FormCard>

        <FormCard title="Détails">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Type de cuisine</label>
              <input value={form.cuisine_type} onChange={(e) => update("cuisine_type", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gamme de prix (1–4)</label>
              <input value={form.price_range} onChange={(e) => update("price_range", e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">Publié</span>
              <Toggle checked={form.is_published} onChange={(v) => update("is_published", v)} />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">Mis en avant</span>
              <Toggle checked={form.is_featured} onChange={(v) => update("is_featured", v)} />
            </div>
          </div>
        </FormCard>

        <div className="md:col-span-2">
          <FormCard title="Descriptions">
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Description (FR)</label>
                <textarea rows={3} value={form.description_fr} onChange={(e) => update("description_fr", e.target.value)} className={inputClass + " resize-y"} />
              </div>
              <div>
                <label className={labelClass}>Description (DE)</label>
                <textarea rows={3} value={form.description_de} onChange={(e) => update("description_de", e.target.value)} className={inputClass + " resize-y"} />
              </div>
              <div>
                <label className={labelClass}>Description (EN)</label>
                <textarea rows={3} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} className={inputClass + " resize-y"} />
              </div>
            </div>
          </FormCard>
        </div>

        <FormCard title="Vidéo de présentation" icon={<Video className="h-4 w-4 text-gray-400" />}>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>URL de la vidéo</label>
              <input
                value={form.video_url}
                onChange={(e) => update("video_url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Collez un lien YouTube ou Vimeo. La vidéo sera affichée sur la page du restaurant.
              </p>
            </div>
            {form.video_url && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-sm font-medium text-emerald-700">Vidéo configurée</p>
                <p className="mt-1 truncate text-xs text-emerald-600">{form.video_url}</p>
              </div>
            )}
          </div>
        </FormCard>

        <FormCard title="Promotion / Offre spéciale" icon={<Tag className="h-4 w-4 text-gray-400" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-gray-700">Promotion active</span>
              <Toggle checked={form.promotion_active} onChange={(v) => update("promotion_active", v)} />
            </div>
            <div>
              <label className={labelClass}>Type de promotion</label>
              <select
                value={form.promotion_type}
                onChange={(e) => update("promotion_type", e.target.value)}
                className={inputClass}
              >
                <option value="percentage">Réduction en %</option>
                <option value="daily_menu">Menu du jour</option>
                <option value="happy_hour">Happy Hour</option>
                <option value="special_event">Événement spécial</option>
                <option value="free_item">Article offert</option>
                <option value="fixed_discount">Réduction fixe (CHF)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Titre de l&apos;offre</label>
              <input
                value={form.promotion_title}
                onChange={(e) => update("promotion_title", e.target.value)}
                placeholder="Ex: -20% sur le menu du soir"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Valeur (optionnel)</label>
              <input
                value={form.promotion_value}
                onChange={(e) => update("promotion_value", e.target.value)}
                placeholder="Ex: 20, 15.00, etc."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description de l&apos;offre</label>
              <textarea
                rows={2}
                value={form.promotion_description}
                onChange={(e) => update("promotion_description", e.target.value)}
                placeholder="Décrivez les conditions de l'offre..."
                className={inputClass + " resize-none"}
              />
            </div>
            {form.promotion_active && form.promotion_title && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-semibold text-orange-700">{form.promotion_title}</p>
                {form.promotion_description && (
                  <p className="mt-1 text-xs text-orange-600">{form.promotion_description}</p>
                )}
              </div>
            )}
          </div>
        </FormCard>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </button>
        {message && (
          <div className={`flex items-center gap-2 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {message.type === "success" && <CheckCircle className="h-3.5 w-3.5" />}
            {message.text}
          </div>
        )}
      </div>
    </form>
  );
}
