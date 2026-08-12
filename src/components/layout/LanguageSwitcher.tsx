"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

const languages = [
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentLocale = params.locale as string;

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    // Préserve les paramètres de recherche (filtres canton/cuisine/prix...)
    // lors du changement de langue — sans ça l'utilisateur perdait ses
    // filtres actifs en changeant simplement de langue (#40).
    const query = searchParams.toString();
    router.push(segments.join("/") + (query ? `?${query}` : ""));
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium">
      <span className="mr-0.5" aria-hidden="true">🇨🇭</span>
      {languages.map((lang, i) => {
        const isActive = currentLocale === lang.code;
        return (
          <span key={lang.code} className="flex items-center">
            {i > 0 && <span className="mx-0.5 text-gray-300" aria-hidden="true">|</span>}
            <button
              onClick={() => switchLocale(lang.code)}
              aria-current={isActive ? "true" : undefined}
              aria-label={lang.label}
              className={`rounded px-1.5 py-0.5 uppercase transition-colors ${
                isActive
                  ? "bg-[var(--color-just-tag)] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title={lang.label}
            >
              {lang.code}
            </button>
          </span>
        );
      })}
    </div>
  );
}
