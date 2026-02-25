"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { loginMerchant } from "@/actions/merchant/auth";
import Link from "next/link";

export function MerchantLoginForm() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("merchantPortal");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await loginMerchant(email, password);

    if (result.success) {
      router.push(`/${locale}/espace-client`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Link
                href={`/${locale}/espace-client/mot-de-passe-oublie`}
                className="text-xs text-[var(--color-just-tag)] hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("login.loading")}
              </>
            ) : (
              t("login.submit")
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link
              href={`/${locale}/partenaire-inscription`}
              className="text-[var(--color-just-tag)] hover:underline font-medium"
            >
              {t("login.register")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
