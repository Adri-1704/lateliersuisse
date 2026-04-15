export const cantons = [
  { value: "geneve", label: "Genève", prepositionFr: "de", prepositionEs: "de", labelDe: "Genf", labelEn: "Geneva", labelPt: "Genebra", labelEs: "Ginebra" },
  { value: "vaud", label: "Vaud", prepositionFr: "de", prepositionEs: "de", labelDe: "Waadt", labelEn: "Vaud", labelPt: "Vaud", labelEs: "Vaud" },
  { value: "fribourg", label: "Fribourg", prepositionFr: "de", prepositionEs: "de", labelDe: "Freiburg", labelEn: "Fribourg", labelPt: "Friburgo", labelEs: "Friburgo" },
  { value: "neuchatel", label: "Neuchâtel", prepositionFr: "de", prepositionEs: "de", labelDe: "Neuenburg", labelEn: "Neuchatel", labelPt: "Neuchâtel", labelEs: "Neuchâtel" },
  { value: "valais", label: "Valais", prepositionFr: "du", prepositionEs: "del", labelDe: "Wallis", labelEn: "Valais", labelPt: "Valais", labelEs: "Valais" },
  { value: "jura", label: "Jura", prepositionFr: "du", prepositionEs: "del", labelDe: "Jura", labelEn: "Jura", labelPt: "Jura", labelEs: "Jura" },
  { value: "berne", label: "Berne", prepositionFr: "de", prepositionEs: "de", labelDe: "Bern", labelEn: "Bern", labelPt: "Berna", labelEs: "Berna" },
] as const;

export type Canton = (typeof cantons)[number]["value"];
