"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Pencil, X, CheckCircle } from "lucide-react";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/actions/merchant/menu";
import type { DbMenuItem } from "@/lib/supabase/types";

interface MenuItemForm {
  name_fr: string;
  name_de: string;
  name_en: string;
  description_fr: string;
  description_de: string;
  description_en: string;
  price: string;
  category: string;
  is_available: boolean;
}

const EMPTY_FORM: MenuItemForm = {
  name_fr: "", name_de: "", name_en: "",
  description_fr: "", description_de: "", description_en: "",
  price: "", category: "", is_available: true,
};

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

  useEffect(() => {
    async function load() {
      const restResult = await getMerchantRestaurant();
      if (restResult.success && restResult.data) {
        setRestaurantId(restResult.data.id);
        const menuResult = await getMenuItems(restResult.data.id);
        if (menuResult.success && menuResult.data) {
          setItems(menuResult.data);
        }
      }
      setLoading(false);
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

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    setError(null);

    const itemData = {
      restaurant_id: restaurantId,
      name_fr: form.name_fr,
      name_de: form.name_de || undefined,
      name_en: form.name_en || undefined,
      description_fr: form.description_fr || undefined,
      description_de: form.description_de || undefined,
      description_en: form.description_en || undefined,
      price: parseFloat(form.price) || 0,
      category: form.category,
      is_available: form.is_available,
    };

    let result;
    if (editingId) {
      result = await updateMenuItem(editingId, itemData);
    } else {
      result = await createMenuItem(itemData);
    }

    if (result.success) {
      // Reload items
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
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }

  // Group items by category
  const categories = [...new Set(items.map((i) => i.category))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("menu.title")}</h1>
          <p className="text-muted-foreground">{t("menu.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{t("menu.saved")}</span>
            </div>
          )}
          {!showForm && (
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("menu.add")}
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <Card className="border-[var(--color-just-tag)]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? t("menu.edit") : t("menu.add")}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Nom (FR) *</Label>
                  <Input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Nom (DE)</Label>
                  <Input value={form.name_de} onChange={(e) => setForm({ ...form, name_de: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nom (EN)</Label>
                  <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Description (FR)</Label>
                  <Input value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description (DE)</Label>
                  <Input value={form.description_de} onChange={(e) => setForm({ ...form, description_de: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description (EN)</Label>
                  <Input value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("menu.price")} (CHF) *</Label>
                  <Input
                    type="number"
                    step="0.50"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("menu.category")} *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Entrees, Plats, Desserts..."
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_available}
                      onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                      className="rounded"
                    />
                    {t("menu.available")}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t("menu.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? t("menu.update") : t("menu.create")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Menu items grouped by category */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl">🍽️</div>
            <h3 className="mt-4 font-semibold">{t("menu.empty")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("menu.emptyDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {items
                .filter((i) => i.category === category)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name_fr}</span>
                        {!item.is_available && (
                          <Badge variant="secondary" className="text-xs">Indisponible</Badge>
                        )}
                      </div>
                      {item.description_fr && (
                        <p className="text-sm text-muted-foreground">{item.description_fr}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        CHF {typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
