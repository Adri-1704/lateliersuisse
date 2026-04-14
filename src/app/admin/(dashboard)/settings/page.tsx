"use client";

import { useState } from "react";
import { updateAdminPassword } from "@/actions/admin/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await updateAdminPassword(password);
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Mot de passe mis à jour avec succès." });
      setPassword("");
      setConfirm("");
    } else {
      setMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour." });
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
