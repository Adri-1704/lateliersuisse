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
 * Décalage Europe/Zurich par rapport à UTC (en minutes) pour un instant
 * donné — gère automatiquement l'heure d'été (+120) et d'hiver (+60).
 */
function getZurichOffsetMinutes(date: Date): number {
  const zurichWall = new Date(date.toLocaleString("en-US", { timeZone: ZURICH_TZ }));
  const utcWall = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((zurichWall.getTime() - utcWall.getTime()) / 60000);
}

/** Début (00:00:00.000) du jour courant en Europe/Zurich, comme instant UTC. */
export function startOfTodayZurich(now: Date = new Date()): Date {
  const { year, month, day } = getZurichDateParts(now);
  const offsetMin = getZurichOffsetMinutes(now);
  const wallMidnightAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return new Date(wallMidnightAsUtc - offsetMin * 60000);
}

/** Fin (23:59:59.999) du jour courant en Europe/Zurich, comme instant UTC. */
export function endOfTodayZurich(now: Date = new Date()): Date {
  const { year, month, day } = getZurichDateParts(now);
  const offsetMin = getZurichOffsetMinutes(now);
  const wallEndOfDayAsUtc = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  return new Date(wallEndOfDayAsUtc - offsetMin * 60000);
}
