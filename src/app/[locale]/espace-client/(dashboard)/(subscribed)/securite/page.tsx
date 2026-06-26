"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { changeMerchantPassword } from "@/actions/merchant/auth";

export default function SecurityPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const result = await changeMerchantPassword(newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sécurité</h1>
        <p className="text-muted-foreground">Gérez le mot de passe de votre compte.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--color-just-tag)]" />
            Changer mon mot de passe
          </CardTitle>
          <CardDescription>
            Choisissez un mot de passe d&apos;au moins 8 caractères.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                Mot de passe mis à jour avec succès.
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour mon mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
