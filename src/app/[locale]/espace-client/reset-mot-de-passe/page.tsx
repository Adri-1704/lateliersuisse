"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UtensilsCrossed, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { changeMerchantPassword } from "@/actions/merchant/auth";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      setTimeout(() => router.push(`/${locale}/espace-client/connexion`), 1500);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-warm-cream)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-just-tag)] text-white">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">
            Just<span className="text-[var(--color-just-tag)]">-Tag</span>
          </h1>
          <p className="text-sm text-muted-foreground">Définir un nouveau mot de passe</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  Mot de passe mis à jour. Redirection vers la page de connexion...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
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
                  className="w-full bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mettre à jour mon mot de passe
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Link
                href={`/${locale}/espace-client/connexion`}
                className="text-xs text-muted-foreground hover:underline"
              >
                <ArrowLeft className="mr-1 inline h-3 w-3" />
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
