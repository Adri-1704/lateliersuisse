"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2, Pencil, X, CheckCircle, ImagePlus, BookOpen, FileText, Upload } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuItemImage, deleteMenuItemImage } from "@/actions/merchant/menu";
import { uploadMenuPdf, deleteMenuPdf } from "@/actions/merchant/menu-pdf";
import type { DbMenuItem } from "@/lib/supabase/types";

interface MenuItemForm {
  name_fr: string; name_de: string; name_en: string;
  description_fr: string; description_de: string; description_en: string;
  price: string; category: string; is_available: boolean;
}

const EMPTY_FORM: MenuItemForm = {
  name_fr: "", name_de: "", name_en: "",
  description_fr: "", description_de: "", description_en: "",
  price: "", category: "", is_available: true,
};

const CATEGORY_STYLES: Record<string, { color: string; bg: string; emoji: string }> = {
  "Entrées":  { color: "#10b981", bg: "#f0fdf4", emoji: "🥗" },
  "Plats":    { color: "#3b82f6", bg: "#eff6ff", emoji: "🍽️" },
  "Desserts": { color: "#ec4899", bg: "#fdf2f8", emoji: "🍰" },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] || { color: "#8b5cf6", bg: "#f5f3ff", emoji: "🍴" };
}

export default function MenuPage() {
  const t = useTranslations("merchantPortal");
  const [items, setItems] = useState<DbMenuItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuItemForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
  const [menuPdfUrl, setMenuPdfUrl] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const restResult = await getMerchantRestaurant();
        if (restResult.success && restResult.data) {
          setRestaurantId(restResult.data.id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setMenuPdfUrl((restResult.data as any).menu_pdf_url || null);
          const menuResult = await getMenuItems(restResult.data.id);
          if (menuResult.success && menuResult.data) setItems(menuResult.data);
        }
      } catch (err) {
        console.error("Erreur chargement menu:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function startEdit(item: DbMenuItem) {
    setEditingId(item.id);
    setForm({
      name_fr: item.name_fr, name_de: item.name_de || "", name_en: item.name_en || "",
      description_fr: item.description_fr || "", description_de: item.description_de || "",
      description_en: item.description_en || "",
      price: String(item.price), category: item.category, is_available: item.is_available,
    });
    setShowForm(true);
  }

  function resetForm() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); setError(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    setError(null);
    const itemData = {
      restaurant_id: restaurantId, name_fr: form.name_fr,
      name_de: form.name_de || undefined, name_en: form.name_en || undefined,
      description_fr: form.description_fr || undefined, description_de: form.description_de || undefined,
      description_en: form.description_en || undefined,
      price: parseFloat(form.price) || 0, category: form.category, is_available: form.is_available,
    };
    const result = editingId ? await updateMenuItem(editingId, itemData) : await createMenuItem(itemData);
    if (result.success) {
      const menuResult = await getMenuItems(restaurantId);
      if (menuResult.data) setItems(menuResult.data);
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
    const result = await deleteMenuItem(id);
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleImageUpload(itemId: string, file: File) {
    if (!restaurantId) return;
    setUploadingImageFor(itemId);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMenuItemImage(itemId, formData);
      if (result.success && result.url) {
        setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, image_url: result.url! } : i));
      } else {
        setError(result.error || "Erreur lors de l'upload");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploadingImageFor(null);
    }
  }

  async function handleImageDelete(itemId: string) {
    const result = await deleteMenuItemImage(itemId);
    if (result.success) setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, image_url: null } : i));
  }

  async function handlePdfUpload(file: File) {
    setUploadingPdf(true);
    setPdfError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadMenuPdf(formData);
    if (result.success && result.url) {
      setMenuPdfUrl(result.url);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } else {
      setPdfError(result.error || "Erreur lors de l'upload");
    }
    setUploadingPdf(false);
  }

  async function handlePdfDelete() {
    setUploadingPdf(true);
    setPdfError(null);
    const result = await deleteMenuPdf();
    if (result.success) {
      setMenuPdfUrl(null);
    } else {
      setPdfError(result.error || "Erreur lors de la suppression");
    }
    setUploadingPdf(false);
  }

  const categories = [...new Set(items.map((i) => i.category))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#8b5cf6" }} />
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent";

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}>
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">{t("menu.title")}</h1>
            <p className="text-[13px] text-gray-400">{t("menu.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <CheckCircle className="h-4 w-4" />
              {t("menu.saved")}
            </div>
          )}
          {!showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}
            >
              <Plus className="h-4 w-4" />
              {t("menu.add")}
            </button>
          )}
        </div>
      </div>

      {/* PDF Menu section */}
      <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#fdf4ff" }}>
              <FileText className="h-4 w-4" style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Menu PDF</p>
              <p className="text-[12px] text-gray-400">
                {menuPdfUrl ? "Un PDF est en ligne — les visiteurs peuvent le télécharger" : "Importez votre carte en PDF pour que les visiteurs puissent la télécharger"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pdfSuccess && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                <CheckCircle className="h-3.5 w-3.5" />
                Enregistré
              </div>
            )}
            {menuPdfUrl && (
              <>
                <a
                  href={menuPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-gray-100"
                  style={{ color: "#8b5cf6" }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Voir le PDF
                </a>
                <button
                  onClick={handlePdfDelete}
                  disabled={uploadingPdf}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {uploadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  Supprimer
                </button>
              </>
            )}
            <label className="flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}>
              {uploadingPdf
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</>
                : <><Upload className="h-4 w-4" /> {menuPdfUrl ? "Remplacer" : "Importer"}</>
              }
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploadingPdf}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePdfUpload(file); e.target.value = ""; }}
              />
            </label>
          </div>
        </div>
        {pdfError && (
          <div className="mx-5 mb-4 rounded-xl px-3 py-2 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>
            {pdfError}
          </div>
        )}
      </div>

      {error && !showForm && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #8b5cf640" }}>
          <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
            <h2 className="font-bold text-gray-900">{editingId ? t("menu.edit") : t("menu.add")}</h2>
            <button onClick={resetForm} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</div>
              )}

              {/* Names */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Nom</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">FR *</label>
                    <input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} required className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">DE</label>
                    <input value={form.name_de} onChange={(e) => setForm({ ...form, name_de: e.target.value })} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">EN</label>
                    <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">FR</label>
                    <input value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">DE</label>
                    <input value={form.description_de} onChange={(e) => setForm({ ...form, description_de: e.target.value })} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">EN</label>
                    <input value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid gap-3 sm:grid-cols-3 items-end">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{t("menu.price")} (CHF) *</label>
                  <input
                    type="number" step="0.50" min="0"
                    value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{t("menu.category")} *</label>
                  <select
                    value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required className={inputClass}
                  >
                    <option value="">-- Choisir --</option>
                    <option value="Entrées">Entrées</option>
                    <option value="Plats">Plats</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                    className="rounded"
                    id="is_available"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-gray-700">{t("menu.available")}</label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  {t("menu.cancel")}
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? t("menu.update") : t("menu.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items grouped by category */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center bg-white" style={{ border: "1.5px solid #eaecf0" }}>
          <span className="text-5xl">🍽️</span>
          <h3 className="mt-4 text-lg font-bold text-gray-800">{t("menu.empty")}</h3>
          <p className="mt-1 text-sm text-gray-400">{t("menu.emptyDescription")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const catStyle = getCategoryStyle(category);
            const categoryItems = items.filter((i) => i.category === category);
            return (
              <div key={category} className="rounded-2xl overflow-hidden bg-white" style={{ border: "1.5px solid #eaecf0" }}>
                {/* Category header */}
                <div className="flex items-center gap-2 px-5 py-3" style={{ background: catStyle.bg }}>
                  <span className="text-lg">{catStyle.emoji}</span>
                  <h2 className="font-bold" style={{ color: catStyle.color }}>{category}</h2>
                  <span className="ml-auto text-[11px] font-semibold" style={{ color: catStyle.color + "99" }}>
                    {categoryItems.length} article{categoryItems.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                      {/* Image thumbnail */}
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: "#f5f6fa" }}>
                        {item.image_url ? (
                          <>
                            <Image src={item.image_url} alt={item.name_fr} fill className="object-cover" sizes="56px" />
                            <button
                              type="button"
                              onClick={() => handleImageDelete(item.id)}
                              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </>
                        ) : (
                          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                            {uploadingImageFor === item.id
                              ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              : <ImagePlus className="h-4 w-4 text-gray-300" />}
                            <input
                              type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(item.id, file); e.target.value = ""; }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{item.name_fr}</span>
                          {!item.is_available && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#f5f6fa", color: "#9ca3af" }}>
                              Indisponible
                            </span>
                          )}
                        </div>
                        {item.description_fr && (
                          <p className="text-[12px] text-gray-400 truncate">{item.description_fr}</p>
                        )}
                      </div>

                      {/* Price + actions */}
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded-xl px-3 py-1 text-sm font-black"
                          style={{ background: catStyle.bg, color: catStyle.color }}
                        >
                          {typeof item.price === "number" ? item.price.toFixed(2) : item.price} CHF
                        </span>
                        <button onClick={() => startEdit(item)} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                          <Pencil className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
