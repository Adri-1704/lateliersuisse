"use client";

import { useState, useMemo } from "react";
import { MessageCircle } from "lucide-react";

const PRICES = {
  early: {
    monthly:    { 50: 59.95,  100: 89.95,  200: 149.95 },
    semiannual: { 50: 52.95,  100: 79.95,  200: 132.95 },
    annual:     { 50: 49.95,  100: 74.95,  200: 124.95 },
  },
  standard: {
    monthly:    { 50: 89.95,  100: 149.95, 200: 249.95 },
    semiannual: { 50: 79.95,  100: 132.95, 200: 219.95 },
    annual:     { 50: 74.95,  100: 124.95, 200: 204.95 },
  },
} as const;

type Phase  = keyof typeof PRICES;
type Period = keyof (typeof PRICES)["early"];
type Tier   = 50 | 100 | 200;

function fmt(n: number) {
  return n.toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtInt(n: number) {
  return Math.round(n).toLocaleString("fr-CH");
}

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
            value === o.value
              ? "border-[var(--color-just-tag)] bg-[var(--color-just-tag)] text-white font-semibold"
              : "border-gray-200 text-gray-700 hover:border-[var(--color-just-tag)] hover:text-[var(--color-just-tag)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ControlLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function B2BSimulator() {
  const [phase, setPhase]       = useState<Phase>("early");
  const [period, setPeriod]     = useState<Period>("monthly");
  const [tier, setTier]         = useState<Tier>(100);
  const [convRate, setConvRate] = useState(15);
  const [basket, setBasket]     = useState(80);

  const r = useMemo(() => {
    const monthlyPrice  = PRICES[phase][period][tier];
    const monthlyVisits = tier * (convRate / 100);
    const monthlyRevenue = monthlyVisits * basket;
    const netGain       = monthlyRevenue - monthlyPrice;
    const roi           = (netGain / monthlyPrice) * 100;
    const annualCost    = monthlyPrice * 12;
    const annualRevenue = monthlyRevenue * 12;
    const annualNet     = netGain * 12;
    const breakevenVisits = monthlyPrice / basket;
    const totalMsgs     = tier * 4;

    let billingNote = "facturation mensuelle";
    if (period === "semiannual") billingNote = `soit CHF ${fmt(monthlyPrice * 6)} / 6 mois`;
    if (period === "annual")     billingNote = `soit CHF ${fmt(monthlyPrice * 12)} / an`;

    return { monthlyPrice, monthlyVisits, monthlyRevenue, netGain, roi, annualCost, annualRevenue, annualNet, breakevenVisits, totalMsgs, billingNote };
  }, [phase, period, tier, convRate, basket]);

  const roiColor =
    r.roi >= 500 ? "text-green-600" :
    r.roi >= 100 ? "text-[var(--color-just-tag)]" :
    "text-amber-600";

  const barPct = Math.min(96, Math.max(2, (r.annualRevenue / (r.annualRevenue + r.annualCost)) * 100));

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Calculez votre retour sur investissement
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Ajustez les paramètres selon votre restaurant et voyez ce que Just-Tag vous rapporte concrètement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">

          {/* ── Controls ─────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-6">

            <div>
              <ControlLabel label="Tarif" />
              <PillGroup<Phase>
                options={[
                  { label: "🚀 Early Bird (offre limitée)", value: "early" },
                  { label: "Standard", value: "standard" },
                ]}
                value={phase}
                onChange={setPhase}
              />
            </div>

            <div>
              <ControlLabel label="Durée de l'abonnement" />
              <PillGroup<Period>
                options={[
                  { label: "Mensuel", value: "monthly" },
                  { label: "Semestriel (−11%)", value: "semiannual" },
                  { label: "Annuel (−17%)", value: "annual" },
                ]}
                value={period}
                onChange={setPeriod}
              />
            </div>

            <div>
              <ControlLabel label="Abonnés WhatsApp" />
              <PillGroup<Tier>
                options={[
                  { label: "50 abonnés", value: 50 },
                  { label: "100 abonnés", value: 100 },
                  { label: "200 abonnés", value: 200 },
                ]}
                value={tier}
                onChange={setTier}
              />
              <p className="mt-2 text-xs font-semibold text-green-700">
                {r.totalMsgs} messages/mois{" "}
                <span className="font-normal text-gray-400">· 4 envois × {tier} abonnés</span>
              </p>
            </div>

            <div>
              <ControlLabel
                label="Taux de conversion"
                hint="% d'abonnés qui réservent suite à un message"
              />
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1} max={25} step={1}
                  value={convRate}
                  onChange={(e) => setConvRate(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer accent-[var(--color-just-tag)]"
                />
                <span className="min-w-[48px] text-right text-base font-bold text-gray-900 tabular-nums">
                  {convRate} %
                </span>
              </div>
            </div>

            <div>
              <ControlLabel
                label="Panier moyen"
                hint="Dépense par réservation (CHF)"
              />
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={15} max={200} step={5}
                  value={basket}
                  onChange={(e) => setBasket(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer accent-[var(--color-just-tag)]"
                />
                <span className="min-w-[64px] text-right text-base font-bold text-gray-900 tabular-nums">
                  {basket} CHF
                </span>
              </div>
            </div>
          </div>

          {/* ── Results ──────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* ROI hero */}
            <div className="border-b border-gray-100 px-6 py-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                Retour sur investissement
              </p>
              <p className={`font-condensed text-7xl font-black leading-none tabular-nums ${roiColor}`}>
                {r.roi < 0 ? `−${fmt(Math.abs(r.roi))} %` : `+${fmtInt(r.roi)} %`}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Pour{" "}
                <span className="font-semibold text-gray-900">CHF {fmt(r.monthlyPrice)}</span>{" "}
                investis, vous générez{" "}
                <span className="font-semibold text-gray-900">CHF {fmt(r.monthlyRevenue)}</span>{" "}
                de revenus.
              </p>
            </div>

            {/* WhatsApp bar */}
            <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm text-green-800">
                <span className="text-base font-extrabold text-green-700">{r.totalMsgs}</span>{" "}
                messages WhatsApp envoyés ce mois ·{" "}
                <span className="text-xs text-green-600">4 envois × {tier} abonnés</span>
              </p>
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Coût mensuel</p>
                <p className="mt-1 text-xl font-bold text-gray-900 tabular-nums">CHF {fmt(r.monthlyPrice)}</p>
                <p className="text-xs text-gray-400">{r.billingNote}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Réservations / mois</p>
                <p className="mt-1 text-xl font-bold text-gray-900 tabular-nums">{fmtInt(r.monthlyVisits)}</p>
                <p className="text-xs text-gray-400">{convRate} % de {tier} abonnés</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Revenus / mois</p>
                <p className="mt-1 text-xl font-bold text-green-600 tabular-nums">CHF {fmt(r.monthlyRevenue)}</p>
                <p className="text-xs text-gray-400">via WhatsApp</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Gain net / mois</p>
                <p className={`mt-1 text-xl font-bold tabular-nums ${r.netGain >= 0 ? "text-green-600" : "text-amber-600"}`}>
                  {r.netGain >= 0 ? "+" : "−"}CHF {fmt(Math.abs(r.netGain))}
                </p>
                <p className="text-xs text-gray-400">après abonnement</p>
              </div>
            </div>

            {/* Annual projection */}
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Projection annuelle</p>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: r.annualNet >= 0 ? "#16a34a" : "#d97706",
                  }}
                />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Coût annuel</span>
                  <span className="font-semibold text-gray-900 tabular-nums">CHF {fmt(r.annualCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenus annuels</span>
                  <span className="font-semibold text-green-600 tabular-nums">CHF {fmt(r.annualRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gain net annuel</span>
                  <span className={`font-bold tabular-nums ${r.annualNet >= 0 ? "text-green-600" : "text-amber-600"}`}>
                    {r.annualNet >= 0 ? "+" : ""}CHF {fmt(r.annualNet)}
                  </span>
                </div>
              </div>
            </div>

            {/* Breakeven */}
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
              {r.breakevenVisits <= r.monthlyVisits ? (
                <>
                  Seuil de rentabilité atteint avec{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.ceil(r.breakevenVisits)} réservation{r.breakevenVisits > 1 ? "s" : ""}
                  </span>{" "}
                  sur {fmtInt(r.monthlyVisits)} générées — abonnement rentabilisé ce mois.
                </>
              ) : (
                "Seuil de rentabilité non atteint à ce taux. Augmentez votre panier moyen ou votre taux de conversion."
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Simulation basée sur 4 envois WhatsApp/mois · Hypothèses conservatrices · Les résultats réels varient selon votre restaurant.
        </p>
      </div>
    </section>
  );
}
