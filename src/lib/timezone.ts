/**
 * Helpers de fuseau horaire — Europe/Zurich.
 *
 * Le serveur (Vercel) tourne en UTC. Toute notion d'« aujourd'hui » calculée
 * avec `Date.setHours()`/`getFullYear()` bruts s'appuie donc sur le fuseau
 * du process (UTC), décalée de 1h (hiver) à 2h (été) par rapport à l'heure
 * suisse — la fenêtre 00h-02h heure suisse est particulièrement affectée
 * (le jour "local" change avant/après minuit UTC).
 *
 * Ces helpers calculent les bornes de journée dans le fuseau Europe/Zurich,
 * quel que soit le fuseau du process qui les exécute.
 */

const ZURICH_TZ = "Europe/Zurich";

interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

function getZurichDateParts(date: Date): DateParts {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZURICH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
}

/**
 * Décalage Europe/Zurich par rapport à UTC (en minutes) POUR UN INSTANT UTC
 * DONNÉ (ex. +60 en hiver, +120 en été). Interroge directement la base de
 * fuseaux horaires (`Intl`/ICU) pour l'instant fourni — indispensable pour
 * rester correct sur les ~2 jours par an où l'heure d'été/hiver bascule
 * (l'offset au début et à la fin de cette journée-là peut différer d'1h).
 */
function getZurichOffsetMinutesAt(instant: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: ZURICH_TZ,
    timeZoneName: "shortOffset",
  });
  const offsetPart = fmt.formatToParts(instant).find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = offsetPart.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = match[3] ? Number(match[3]) : 0;
  return sign * (hours * 60 + minutes);
}

/**
 * Convertit une date/heure "murale" (wall-clock) Europe/Zurich en instant
 * UTC. L'offset est déterminé au voisinage immédiat de l'instant ciblé
 * (raffinement en 2 passes), et non à partir de l'offset de `now` — ce qui
 * garantit un résultat correct même quand la date ciblée (00:00 ou 23:59:59
 * Zurich) tombe le jour même du changement d'heure d'été/hiver (l'ancienne
 * implémentation utilisait l'offset de `now`, pouvant se tromper d'1h ces
 * deux jours-là).
 */
function zurichWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number
): Date {
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, second, ms);

  // 1ère estimation de l'offset à partir de l'instant "naïf" (heure murale
  // traitée comme si elle était déjà UTC).
  const firstOffset = getZurichOffsetMinutesAt(new Date(naiveUtcMs));
  const candidateMs = naiveUtcMs - firstOffset * 60000;

  // Raffinement : l'offset au voisinage du candidat peut différer de la 1ère
  // estimation sur un jour de bascule DST — on recalcule avec l'instant
  // corrigé pour lever cette ambiguïté.
  const refinedOffset = getZurichOffsetMinutesAt(new Date(candidateMs));
  const finalMs = refinedOffset === firstOffset ? candidateMs : naiveUtcMs - refinedOffset * 60000;

  return new Date(finalMs);
}

/** Début (00:00:00.000) du jour courant en Europe/Zurich, comme instant UTC. */
export function startOfTodayZurich(now: Date = new Date()): Date {
  const { year, month, day } = getZurichDateParts(now);
  return zurichWallTimeToUtc(year, month, day, 0, 0, 0, 0);
}

/** Fin (23:59:59.999) du jour courant en Europe/Zurich, comme instant UTC. */
export function endOfTodayZurich(now: Date = new Date()): Date {
  const { year, month, day } = getZurichDateParts(now);
  return zurichWallTimeToUtc(year, month, day, 23, 59, 59, 999);
}
