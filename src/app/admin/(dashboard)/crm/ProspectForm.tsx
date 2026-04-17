"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProspect, updateProspect, deleteProspect, type Prospect } from "@/actions/prospects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProspectForm({ prospect }: { prospect?: Prospect }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = prospect
      ? await updateProspect(prospect.id, formData)
      : await createProspect(formData);
    if (result.success) { router.push("/admin/crm"); router.refresh(); }
    else setError(result.error || "Erreur");
    setSaving(false);
  }

  async function handleDelete() {
    if (!prospect || !confirm("Supprimer ce prospect ?")) return;
    await deleteProspect(prospect.id);
    router.push("/admin/crm");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/crm" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <div className="flex items-center gap-3">
          {prospect && (
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1 h-3 w-3" /> Supprimer
            </Button>
          )}
          <Button type="submit" disabled={saving} className="gap-2 bg-[var(--color-just-tag)]">
            <Save className="h-4 w-4" /> {saving ? "..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Nom *</label>
                <Input name="name" defaultValue={prospect?.name} placeholder="Restaurant La Grotte" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Contact</label>
                <Input name="contact_name" defaultValue={prospect?.contact_name || ""} placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input name="email" type="email" defaultValue={prospect?.email || ""} placeholder="jean@restaurant.ch" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Téléphone</label>
                <Input name="phone" defaultValue={prospect?.phone || ""} placeholder="+41 27 455 46 46" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Instagram</label>
                <Input name="instagram" defaultValue={prospect?.instagram || ""} placeholder="@lagrotte_vs" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Ville</label>
                <Input name="city" defaultValue={prospect?.city || ""} placeholder="Sion" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Canton</label>
                <select name="canton" defaultValue={prospect?.canton || ""} className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  <option value="">—</option>
                  <option value="geneve">Genève</option>
                  <option value="vaud">Vaud</option>
                  <option value="valais">Valais</option>
                  <option value="fribourg">Fribourg</option>
                  <option value="neuchatel">Neuchâtel</option>
                  <option value="jura">Jura</option>
                  <option value="berne">Berne</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <textarea name="notes" defaultValue={prospect?.notes || ""} rows={3} placeholder="Notes libres..." className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Statut</label>
                <select name="status" defaultValue={prospect?.status || "new"} className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  <option value="new">Nouveau</option>
                  <option value="contacted">Contacté</option>
                  <option value="replied">A répondu</option>
                  <option value="meeting">RDV prévu</option>
                  <option value="trial">En essai</option>
                  <option value="paying">Payant</option>
                  <option value="lost">Perdu</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Priorité</label>
                <select name="priority" defaultValue={prospect?.priority || "normal"} className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  <option value="hot">🔥 Chaud</option>
                  <option value="normal">Normal</option>
                  <option value="low">Basse</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Type</label>
                <select name="type" defaultValue={prospect?.type || "restaurant"} className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  <option value="restaurant">Restaurant</option>
                  <option value="partner">Partenaire</option>
                  <option value="influencer">Influenceur</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Source</label>
                <select name="source" defaultValue={prospect?.source || "manual"} className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  <option value="manual">Manuel</option>
                  <option value="call">Appel</option>
                  <option value="brevo">Email Brevo</option>
                  <option value="insta_dm">DM Instagram</option>
                  <option value="partner_email">Email partenariat</option>
                  <option value="terrain">Terrain</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Suivi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Dernier contact</label>
                <Input name="last_contact_at" type="date" defaultValue={prospect?.last_contact_at?.slice(0, 10) || ""} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Prochaine relance</label>
                <Input name="next_follow_up_at" type="date" defaultValue={prospect?.next_follow_up_at?.slice(0, 10) || ""} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Action prévue</label>
                <select name="follow_up_action" defaultValue={prospect?.follow_up_action || ""} className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                  <option value="">—</option>
                  <option value="relance_email">Relance email</option>
                  <option value="appel">Appel téléphonique</option>
                  <option value="rdv">Prendre RDV</option>
                  <option value="envoyer_offre">Envoyer offre</option>
                  <option value="demo">Faire une démo</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
