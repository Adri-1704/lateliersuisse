"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

const PROMO_TYPES: Record<string, { label: string; color: string }> = {
  percentage: { label: "Réduction en %", color: "bg-orange-100 text-orange-800" },
  fixed_discount: { label: "Réduction fixe (CHF)", color: "bg-blue-100 text-blue-800" },
  happy_hour: { label: "Happy Hour", color: "bg-purple-100 text-purple-800" },
  daily_menu: { label: "Menu du jour", color: "bg-green-100 text-green-800" },
  free_item: { label: "Article offert", color: "bg-pink-100 text-pink-800" },
  special_event: { label: "Événement spécial", color: "bg-yellow-100 text-yellow-800" },
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
          if (promoResult.success && promoResult.data) {
            setPromotions(promoResult.data);
          }
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
      title: promo.title,
      description: promo.description || "",
      promotion_type: promo.promotion_type,
      value: promo.value || "",
      is_active: promo.is_active,
      start_date: promo.start_date || "",
      end_date: promo.end_date || "",
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

    const data = {
      restaurant_id: restaurantId,
      title: form.title,
      description: form.description || undefined,
      promotion_type: form.promotion_type,
      value: form.value || undefined,
      is_active: form.is_active,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    };

    let result;
    if (editingId) {
      result = await updatePromotion(editingId, data);
    } else {
      result = await createPromotion(data);
    }

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
    if (result.success) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    const result = await togglePromotion(id, isActive);
    if (result.success) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p))
      );
    }
  }

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
          <h1 className="text-2xl font-bold">Offres du moment</h1>
          <p className="text-muted-foreground">Gérez vos promotions et offres spéciales</p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Enregistré</span>
            </div>
          )}
          {!showForm && (
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une offre
            </Button>
          )}
        </div>
      </div>

      {error && !showForm && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <Card className="border-[var(--color-just-tag)]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {editingId ? "Modifier l'offre" : "Nouvelle offre"}
            </CardTitle>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Titre de l&apos;offre *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: -10% sur tous les desserts"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de promotion *</Label>
                  <select
                    value={form.promotion_type}
                    onChange={(e) => setForm({ ...form, promotion_type: e.target.value })}
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {Object.entries(PROMO_TYPES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Valeur</Label>
                  <Input
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="Ex: 10, 15.00..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de début</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description / Conditions</Label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez les conditions de l'offre..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <Label>Offre active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Mettre à jour" : "Créer l'offre"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promotions list */}
      {promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 font-semibold">Aucune offre</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajoutez des promotions pour attirer de nouveaux clients
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {promotions.map((promo) => {
            const typeInfo = PROMO_TYPES[promo.promotion_type] || { label: promo.promotion_type, color: "bg-gray-100 text-gray-800" };
            return (
              <Card
                key={promo.id}
                className={`transition-colors ${promo.is_active ? "border-green-200" : "border-gray-200 opacity-60"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{promo.title}</h3>
                        <Badge className={`text-xs ${typeInfo.color}`}>{typeInfo.label}</Badge>
                      </div>
                      {promo.value && (
                        <p className="mt-1 text-lg font-bold text-[var(--color-just-tag)]">
                          {promo.promotion_type === "percentage" ? `${promo.value}%` : promo.promotion_type === "fixed_discount" ? `${promo.value} CHF` : promo.value}
                        </p>
                      )}
                      {promo.description && (
                        <p className="mt-1 text-sm text-gray-500">{promo.description}</p>
                      )}
                      {(promo.start_date || promo.end_date) && (
                        <p className="mt-2 text-xs text-gray-400">
                          {promo.start_date && `Du ${new Date(promo.start_date).toLocaleDateString("fr-CH")}`}
                          {promo.end_date && ` au ${new Date(promo.end_date).toLocaleDateString("fr-CH")}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={(v) => handleToggle(promo.id, v)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => startEdit(promo)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
