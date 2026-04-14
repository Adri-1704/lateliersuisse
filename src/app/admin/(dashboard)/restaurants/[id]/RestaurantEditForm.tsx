"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRestaurant } from "@/actions/admin/restaurants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Loader2, Video, Tag } from "lucide-react";
import type { DbRestaurant } from "@/lib/supabase/types";

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
        <Card>
          <CardHeader><CardTitle>Noms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom (FR)</Label>
              <Input value={form.name_fr} onChange={(e) => update("name_fr", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nom (DE)</Label>
              <Input value={form.name_de} onChange={(e) => update("name_de", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nom (EN)</Label>
              <Input value={form.name_en} onChange={(e) => update("name_en", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Localisation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Canton</Label>
              <Input value={form.canton} onChange={(e) => update("canton", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Code postal</Label>
              <Input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Site web</Label>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input value={form.tiktok} onChange={(e) => update("tiktok", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Détails</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type de cuisine</Label>
              <Input value={form.cuisine_type} onChange={(e) => update("cuisine_type", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gamme de prix (1-4)</Label>
              <Input value={form.price_range} onChange={(e) => update("price_range", e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Publié</Label>
              <Switch checked={form.is_published} onCheckedChange={(v) => update("is_published", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mis en avant</Label>
              <Switch checked={form.is_featured} onCheckedChange={(v) => update("is_featured", v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Descriptions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description (FR)</Label>
              <Textarea rows={3} value={form.description_fr} onChange={(e) => update("description_fr", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description (DE)</Label>
              <Textarea rows={3} value={form.description_de} onChange={(e) => update("description_de", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description (EN)</Label>
              <Textarea rows={3} value={form.description_en} onChange={(e) => update("description_en", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Vidéo de présentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL de la vidéo</Label>
              <Input
                value={form.video_url}
                onChange={(e) => update("video_url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500">
                Collez un lien YouTube ou Vimeo. La vidéo sera affichée sur la page du restaurant.
              </p>
            </div>
            {form.video_url && (
              <div className="rounded-lg border bg-gray-50 p-3">
                <p className="text-sm text-green-600 font-medium">Vidéo configurée</p>
                <p className="text-xs text-gray-500 truncate mt-1">{form.video_url}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Promotion / Offre spéciale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Promotion active</Label>
              <Switch checked={form.promotion_active} onCheckedChange={(v) => update("promotion_active", v)} />
            </div>
            <div className="space-y-2">
              <Label>Type de promotion</Label>
              <select
                value={form.promotion_type}
                onChange={(e) => update("promotion_type", e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="percentage">Réduction en %</option>
                <option value="daily_menu">Menu du jour</option>
                <option value="happy_hour">Happy Hour</option>
                <option value="special_event">Événement spécial</option>
                <option value="free_item">Article offert</option>
                <option value="fixed_discount">Réduction fixe (CHF)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Titre de l&apos;offre</Label>
              <Input
                value={form.promotion_title}
                onChange={(e) => update("promotion_title", e.target.value)}
                placeholder="Ex: -20% sur le menu du soir"
              />
            </div>
            <div className="space-y-2">
              <Label>Valeur (optionnel)</Label>
              <Input
                value={form.promotion_value}
                onChange={(e) => update("promotion_value", e.target.value)}
                placeholder="Ex: 20, 15.00, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Description de l&apos;offre</Label>
              <Textarea
                rows={2}
                value={form.promotion_description}
                onChange={(e) => update("promotion_description", e.target.value)}
                placeholder="Décrivez les conditions de l'offre..."
              />
            </div>
            {form.promotion_active && form.promotion_title && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-semibold text-orange-700">{form.promotion_title}</p>
                {form.promotion_description && (
                  <p className="text-xs text-orange-600 mt-1">{form.promotion_description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Enregistrer
        </Button>
        {message && (
          <div className={`flex items-center gap-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.type === "success" && <CheckCircle className="h-3 w-3" />}
            {message.text}
          </div>
        )}
      </div>
    </form>
  );
}
