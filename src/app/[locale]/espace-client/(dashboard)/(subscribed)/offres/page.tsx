"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2, X, CheckCircle } from "lucide-react";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { getPromotions, createPromotion, updatePromotion, deletePromotion, togglePromotion } from "@/actions/merchant/promotions";
import type { DbPromotion } from "@/lib/supabase/types";

interface PromoForm {
  title: string;
  description: string;
  promotion_type: string;
  value: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const EMPTY_FORM: PromoForm = {
  title: "", description: "", promotion_type: "percentage",
  value: "", is_active: true, start_date: "", end_date: "",
};

const PROMO_TYPES: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  percentage:    { label: "Réduction en %",        color: "#ea580c", bg: "#fff7ed", emoji: "%" },
  fixed_discount:{ label: "Réduction fixe (CHF)",  color: "#2563eb", bg: "#eff6ff", emoji: "CHF" },
  happy_hour:    { label: "Happy Hour",             color: "#7c3aed", bg: "#f5f3ff", emoji: "🍹" },
  daily_menu:    { label: "Menu du jour",           color: "#16a34a", bg: "#f0fdf4", emoji: "🍽️" },
  free_item:     { label: "Article offert",         color: "#db2777", bg: "#fdf2f8", emoji: "🎁" },
  special_event: { label: "Événement spécial",      color: "#d97706", bg: "#fffbeb", emoji: "🎉" },
};

export default function OffresPage() {
  const [promotions, setPromotions] = useState<DbPromotion[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const restResult = await getMerchantRestaurant();
        if (restResult.success && restResult.data) {
          setRestaurantId(restResult.data.id);
          const promoResult = await getPromotions(restResult.data.id);
          if (promoResult.success && promoResult.data) setPromotions(promoResult.data);
        }
      } catch (err) {
        console.error("Erreur chargement offres:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function startEdit(promo: DbPromotion) {
    setEditingId(promo.id);
    setForm({
      title: promo.title, description: promo.description || "",
      promotion_type: promo.promotion_type, value: promo.value || "",
      is_active: promo.is_active, start_date: promo.start_date || "", end_date: promo.end_date || "",
    });
    setShowForm(true);
  }

  function resetForm() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); setError(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    setError(null);
    const data = {
      restaurant_id: restaurantId, title: form.title,
      description: form.description || undefined, promotion_type: form.promotion_type,
      value: form.value || undefined, is_active: form.is_active,
      start_date: form.start_date || undefined, end_date: form.end_date || undefined,
    };
    const result = editingId ? await updatePromotion(editingId, data) : await createPromotion(data);
    if (result.success) {
      const promoResult = await getPromotions(restaurantId);
      if (promoResult.data) setPromotions(promoResult.data);
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!restaurantId) return;
    const result = await deletePromotion(id);
    if (result.success) setPromotions((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleToggle(id: string, isActive: boolean) {
    const result = await togglePromotion(id, isActive);
    if (result.success) setPromotions((prev) => prev.map((p) => p.id === id ? { ...p, is_active: isActive } : p));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#ef4444" }} />
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent";

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ef4444, #f87171)" }}>
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Offres du moment</h1>
            <p className="text-[13px] text-gray-400">Gérez vos promotions et offres spéciales</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <CheckCircle className="h-4 w-4" />
              Enregistré
            </div>
          )}
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #ef4444, #f87171)" }}
            >
              <Plus className="h-4 w-4" />
              Ajouter une offre
            </button>
          )}
        </div>
      </div>

      {error && !showForm && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #ef444440" }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" style={{ color: "#ef4444" }} />
              <h2 className="font-bold text-gray-900">{editingId ? "Modifier l'offre" : "Nouvelle offre"}</h2>
            </div>
            <button onClick={resetForm} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Titre de l&apos;offre *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: -10% sur tous les desserts"
                    required
                    className={inputClass}
                    style={{ focusRingColor: "#ef4444" } as React.CSSProperties}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Type de promotion *</label>
                  <select
                    value={form.promotion_type}
                    onChange={(e) => setForm({ ...form, promotion_type: e.target.value })}
                    required
                    className={inputClass}
                  >
                    {Object.entries(PROMO_TYPES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Valeur</label>
                  <input
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="Ex: 10, 15.00..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Date de début</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Date de fin</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Description / Conditions</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez les conditions de l'offre..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_active}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
                  style={{ background: form.is_active ? "#ef4444" : "#d1d5db" }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: form.is_active ? "translateX(18px)" : "translateX(2px)" }}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">Offre active</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #ef4444, #f87171)" }}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Mettre à jour" : "Créer l'offre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promotions list */}
      {promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center bg-white" style={{ border: "1.5px solid #eaecf0" }}>
          <span className="text-5xl">🏷️</span>
          <h3 className="mt-4 text-lg font-bold text-gray-800">Aucune offre</h3>
          <p className="mt-1 text-sm text-gray-400">Ajoutez des promotions pour attirer de nouveaux clients</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {promotions.map((promo) => {
            const typeInfo = PROMO_TYPES[promo.promotion_type] || { label: promo.promotion_type, color: "#6b7280", bg: "#f9fafb", emoji: "🏷️" };
            const valueDisplay = promo.value
              ? promo.promotion_type === "percentage" ? `${promo.value}%`
              : promo.promotion_type === "fixed_discount" ? `${promo.value} CHF`
              : promo.value
              : null;

            return (
              <div
                key={promo.id}
                className="rounded-2xl bg-white transition-all"
                style={{
                  border: `1.5px solid ${promo.is_active ? typeInfo.color + "40" : "#eaecf0"}`,
                  opacity: promo.is_active ? 1 : 0.6,
                }}
              >
                {/* Type header strip */}
                <div className="flex items-center gap-2 rounded-t-2xl px-4 py-2.5" style={{ background: typeInfo.bg }}>
                  <span className="text-base">{typeInfo.emoji}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {/* Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={promo.is_active}
                      onClick={() => handleToggle(promo.id, !promo.is_active)}
                      className="relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors"
                      style={{ background: promo.is_active ? typeInfo.color : "#d1d5db" }}
                    >
                      <span
                        className="inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform"
                        style={{ transform: promo.is_active ? "translateX(17px)" : "translateX(2px)" }}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{promo.title}</p>
                      {valueDisplay && (
                        <p className="mt-1 text-2xl font-black" style={{ color: typeInfo.color }}>
                          {valueDisplay}
                        </p>
                      )}
                      {promo.description && (
                        <p className="mt-1 text-[13px] text-gray-500">{promo.description}</p>
                      )}
                      {(promo.start_date || promo.end_date) && (
                        <p className="mt-2 text-[11px] text-gray-400">
                          {promo.start_date && `Du ${new Date(promo.start_date).toLocaleDateString("fr-CH")}`}
                          {promo.end_date && ` au ${new Date(promo.end_date).toLocaleDateString("fr-CH")}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 ml-2 shrink-0">
                      <button
                        onClick={() => startEdit(promo)}
                        className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="rounded-lg p-2 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
