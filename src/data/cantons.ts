export const cantons = [
  { value: "geneve", label: "Geneve", labelDe: "Genf", labelEn: "Geneva", labelPt: "Genebra", labelEs: "Ginebra" },
  { value: "vaud", label: "Vaud", labelDe: "Waadt", labelEn: "Vaud", labelPt: "Vaud", labelEs: "Vaud" },
  { value: "fribourg", label: "Fribourg", labelDe: "Freiburg", labelEn: "Fribourg", labelPt: "Friburgo", labelEs: "Friburgo" },
  { value: "neuchatel", label: "Neuchatel", labelDe: "Neuenburg", labelEn: "Neuchatel", labelPt: "Neuchâtel", labelEs: "Neuchâtel" },
  { value: "valais", label: "Valais", labelDe: "Wallis", labelEn: "Valais", labelPt: "Valais", labelEs: "Valais" },
  { value: "jura", label: "Jura", labelDe: "Jura", labelEn: "Jura", labelPt: "Jura", labelEs: "Jura" },
  { value: "berne", label: "Berne", labelDe: "Bern", labelEn: "Bern", labelPt: "Berna", labelEs: "Berna" },
] as const;

export type Canton = (typeof cantons)[number]["value"];
