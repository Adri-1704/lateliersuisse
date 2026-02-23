import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { SwissCross, SwissCrossIcon } from "@/components/ui/swiss-cross";
import { Button } from "@/components/ui/button";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t bg-gray-900 text-gray-300">
      {/* CTA Banner for restaurateurs */}
      <div className="bg-[var(--color-just-tag)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-white">{t("ctaTitle")}</p>
            <p className="text-sm text-white/80">{t("ctaSubtitle")}</p>
          </div>
          <Link href={`/${locale}/pour-restaurateurs`}>
            <Button className="bg-white text-[var(--color-just-tag)] hover:bg-gray-100 font-semibold">
              {nav("forRestaurants")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <SwissCross size={36} />
              <span className="text-xl font-bold tracking-tight text-white">
                Just<span className="text-[var(--color-just-tag)]">-Tag</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-gray-400">
              {t("description")}
            </p>

            {/* Swiss Made badge */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-4 py-2 text-xs text-gray-300">
              <SwissCrossIcon size={14} className="text-[var(--color-just-tag)]" />
              {t("swissMade")}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("quickLinks")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href={`/${locale}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {nav("home")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/restaurants`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {nav("restaurants")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {nav("contact")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {nav("faq")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pour-restaurateurs`} className="text-sm text-[var(--color-just-tag)] hover:text-white transition-colors">
                  {nav("forRestaurants")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t("legal")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-gray-400">{t("privacy")}</span>
              </li>
              <li>
                <span className="text-sm text-gray-400">{t("terms")}</span>
              </li>
              <li>
                <span className="text-sm text-gray-400">{t("imprint")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Just-Tag.ch. {t("copyright")}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{t("secureData")}</span>
            <span className="text-gray-700">|</span>
            <span>FR &middot; DE &middot; EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
