"use client";

import { useEffect, useState } from "react";

export type OpeningHours =
  | Record<string, { open: string; close: string } | null>
  | null
  | undefined;

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * Calcule si un établissement est actuellement ouvert d'après ses horaires.
 * Pure fonction de `new Date()` — ne doit JAMAIS être appelée directement
 * pendant un rendu (voir `useIsOpenNow` ci-dessous).
 */
export function isOpenNow(openingHours: OpeningHours): boolean | null {
  if (!openingHours) return null;
  const now = new Date();
  const today = DAYS[now.getDay()];
  const hours = openingHours[today];
  if (
    !hours ||
    typeof hours.open !== "string" ||
    typeof hours.close !== "string" ||
    hours.open === "undefined" ||
    hours.close === "undefined"
  ) {
    return null;
  }
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) return null;
  return currentTime >= openH * 100 + openM && currentTime <= closeH * 100 + closeM;
}

/**
 * Calcule l'état ouvert/fermé uniquement après le montage côté client.
 *
 * `new Date()` renvoie l'heure/jour dans le fuseau du runtime qui l'exécute :
 * sur Vercel le serveur tourne en UTC, alors que le navigateur utilise le
 * fuseau local de l'internaute (Europe/Zurich, etc.). Calculer `isOpenNow`
 * pendant le rendu serveur puis le recalculer immédiatement à l'hydratation
 * peut donc produire un texte différent ("Ouvert" / "Fermé") entre les deux
 * passes — c'est l'erreur React #418 constatée sur /fr/restaurants (#43).
 * En ne calculant l'état qu'après le montage (défaut `null`, identique sur
 * le HTML serveur et la première passe client), on garantit que le rendu
 * hydraté correspond toujours au HTML serveur. Le badge "Ouvert"/"Fermé"
 * doit donc être masqué tant que la valeur renvoyée est `null` — il
 * apparaît juste après le montage, sans provoquer de mismatch.
 *
 * Partagé entre RestaurantCard.tsx, RestaurantOfMonth.tsx et
 * RestaurantDetailClient.tsx pour ne pas dupliquer (et risquer de
 * ré-introduire) le même bug à chaque nouvel usage.
 */
export function useIsOpenNow(openingHours: OpeningHours): boolean | null {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    setOpen(isOpenNow(openingHours));
  }, [openingHours]);
  return open;
}

/**
 * Renvoie la clé du jour courant ("monday", "tuesday", ...) uniquement après
 * le montage côté client, pour la même raison que `useIsOpenNow` : dériver
 * "aujourd'hui" de `new Date()` pendant le rendu serveur produit une valeur
 * qui peut différer de celle recalculée à l'hydratation (fuseau différent,
 * ou changement de jour pile au moment du rendu) — d'où le même risque
 * d'erreur React #418. `null` tant que le composant n'est pas monté : aucune
 * ligne n'est mise en avant avant l'hydratation, ce qui garantit un rendu
 * identique serveur/client.
 */
export function useCurrentDayKey(): string | null {
  const [day, setDay] = useState<string | null>(null);
  useEffect(() => {
    setDay(DAYS[new Date().getDay()]);
  }, []);
  return day;
}
