"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MerchantSuccessPage() {
  const t = useTranslations("merchant.success");
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-gray-600">{t("subtitle")}</p>

      <div className="mt-8 rounded-xl border bg-white p-6 text-left shadow-sm">
        <h3 className="font-semibold text-gray-900">{t("nextSteps")}</h3>
        <ol className="mt-4 space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-xs font-bold text-white">
              1
            </span>
            <span className="text-sm text-gray-700">{t("step1")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-xs font-bold text-white">
              2
            </span>
            <span className="text-sm text-gray-700">{t("step2")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-just-tag)] text-xs font-bold text-white">
              3
            </span>
            <span className="text-sm text-gray-700">{t("step3")}</span>
          </li>
        </ol>
      </div>

      <Button asChild className="mt-8 bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]">
        <Link href={`/${locale}`}>Retour a l&apos;accueil</Link>
      </Button>
    </div>
  );
}
