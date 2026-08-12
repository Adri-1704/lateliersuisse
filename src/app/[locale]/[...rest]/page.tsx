import { notFound } from "next/navigation";

// Route catch-all : sans elle, une URL qui ne correspond à AUCUNE page
// (ex. /de/n-importe-quoi) ne matche aucun segment de route. Next.js ne
// peut alors pas résoudre le segment dynamique [locale] et rend le
// not-found.tsx RACINE (src/app/not-found.tsx) au lieu de
// src/app/[locale]/not-found.tsx — d'où une 404 systématiquement en
// français, sans Header/Footer, quelle que soit la locale demandée (#40).
//
// En déclarant cette page catch-all sous [locale], Next.js matche bien
// /de/n-importe-quoi jusqu'à ce segment : le layout [locale]/layout.tsx
// (Header/Footer + NextIntlClientProvider) est rendu, et notFound() ci-
// dessous fait remonter vers [locale]/not-found.tsx, qui reçoit alors une
// locale résolue correctement.
export const dynamic = "force-dynamic";

export default function CatchAllNotFoundPage() {
  notFound();
}
