"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { UtensilsCrossed, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { resetMerchantPassword } from "@/actions/merchant/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const result = await resetMerchantPassword(email, locale);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error);
    }
    setLoading(false);
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
          <p className="text-sm text-muted-foreground">{t("forgotPassword.title")}</p>
        </div>

        {sent ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.success")}
              </p>
              <Link
                href={`/${locale}/espace-client/connexion`}
                className="mt-2 text-sm font-medium text-[var(--color-just-tag)] hover:underline"
              >
                <ArrowLeft className="mr-1 inline h-3 w-3" />
                {t("forgotPassword.backToLogin")}
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                <p className="text-sm text-muted-foreground">
                  {t("forgotPassword.description")}
                </p>
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("login.email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="restaurant@example.ch"
                    required
                    autoComplete="email"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("forgotPassword.submit")}
                </Button>
                <Link
                  href={`/${locale}/espace-client/connexion`}
                  className="text-center text-xs text-muted-foreground hover:underline"
                >
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
                  {t("forgotPassword.backToLogin")}
                </Link>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
