"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle, Check, ChevronDown, ChevronUp,
  Zap, Shield, BarChart2, Smartphone, Users, Send
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Whats-up brand: WhatsApp green + dark charcoal. Nothing shared with Just-Tag.
const WA_GREEN  = "#25D366";
const WA_DARK   = "#128C7E";
const CHARCOAL  = "#111827";

// ─── Data ────────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { icon: "💇", label: "Salon de coiffure" },
  { icon: "🛍️", label: "Boutique mode" },
  { icon: "🔧", label: "Garage auto" },
  { icon: "🏋️", label: "Salle de sport" },
  { icon: "🍕", label: "Restaurant" },
  { icon: "🏥", label: "Cabinet médical" },
  { icon: "🎓", label: "Cours & formations" },
  { icon: "💅", label: "Institut beauté" },
  { icon: "🏨", label: "Hôtel / B&B" },
  { icon: "🐾", label: "Vétérinaire" },
  { icon: "🌿", label: "Bien-être & spa" },
  { icon: "🍞", label: "Boulangerie" },
];

const FEATURES = [
  {
    icon: Send,
    title: "Broadcasts WhatsApp en 1 clic",
    desc: "Envoyez une offre, un rappel ou une nouveauté à tous vos abonnés en quelques secondes depuis votre téléphone.",
  },
  {
    icon: Users,
    title: "Opt-in légal géré pour vous",
    desc: "Un QR code à afficher en caisse. Le client scanne, s'abonne. Conforme RGPD et LPD suisse.",
  },
  {
    icon: BarChart2,
    title: "Taux d'ouverture de 98 %",
    desc: "Un WhatsApp est lu en moyenne dans les 5 minutes. Email : 20 %. WhatsApp : 98 %. Le calcul est vite fait.",
  },
  {
    icon: Smartphone,
    title: "Zéro application à installer",
    desc: "Whats-up fonctionne avec votre numéro WhatsApp Business existant. Pas de logiciel supplémentaire.",
  },
  {
    icon: Zap,
    title: "Opérationnel en 24 h",
    desc: "Inscription, QR code imprimable et premier envoi dans la journée. Votre équipe n'a rien à apprendre.",
  },
  {
    icon: Shield,
    title: "Sans commission, sans surprise",
    desc: "Prix fixe mensuel tout inclus. Vous ne payez pas à chaque client ramené — c'est votre liste, vos règles.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: 29,
    msgs: 200,
    contacts: 50,
    highlight: false,
    features: ["200 messages / mois", "Jusqu'à 50 contacts", "QR code d'abonnement", "Support email"],
  },
  {
    name: "Business",
    price: 59,
    msgs: 500,
    contacts: 125,
    highlight: true,
    features: ["500 messages / mois", "Jusqu'à 125 contacts", "QR code d'abonnement", "Templates prêts à l'emploi", "Support prioritaire"],
  },
  {
    name: "Pro",
    price: 99,
    msgs: 1000,
    contacts: 250,
    highlight: false,
    features: ["1 000 messages / mois", "Jusqu'à 250 contacts", "QR code d'abonnement", "Templates prêts à l'emploi", "Envois programmés", "Support dédié"],
  },
];

const FAQS = [
  { q: "J'ai déjà un numéro WhatsApp Business — ça fonctionne ?", a: "Oui. Whats-up se connecte à votre numéro existant via l'API officielle Meta. Pas besoin d'en créer un nouveau." },
  { q: "Mes clients doivent-ils installer une application ?", a: "Non. Ils reçoivent vos messages directement dans leur WhatsApp habituel, comme un message d'un ami." },
  { q: "C'est légal d'envoyer des messages en masse ?", a: "Oui, à condition que vos contacts aient opt-in — c'est-à-dire qu'ils se soient inscrits volontairement. Notre système gère ça automatiquement." },
  { q: "Est-ce que ça marche pour tout type de commerce ?", a: "Oui. Salon, garage, boutique, cabinet, restaurant, coach… dès que vous avez des clients réguliers à fidéliser, Whats-up est pertinent." },
  { q: "Je peux annuler quand je veux ?", a: "Oui. L'abonnement mensuel est sans engagement. Résiliation en un clic depuis votre espace client." },
  { q: "Combien de temps pour que ça soit rentable ?", a: "En général, un à deux clients supplémentaires par mois suffisent à couvrir l'abonnement Starter. Le simulateur ci-dessous vous donne votre chiffre exact." },
];

// ─── Pill selector ────────────────────────────────────────────────────────────
function Pill<T extends string | number>({
  options, value, onChange,
}: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          style={value === o.value ? { background: WA_GREEN, borderColor: WA_GREEN, color: "#fff" } : {}}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
            value === o.value ? "font-semibold" : "border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── ROI Simulator ────────────────────────────────────────────────────────────
function Simulator() {
  const [plan, setPlan]         = useState<0 | 1 | 2>(1);
  const [convRate, setConvRate] = useState(12);
  const [basket, setBasket]     = useState(60);

  const r = useMemo(() => {
    const p        = PLANS[plan];
    const visits   = p.contacts * (convRate / 100);
    const revenue  = visits * basket;
    const net      = revenue - p.price;
    const roi      = (net / p.price) * 100;
    const breakeven = p.price / basket;
    return { price: p.price, msgs: p.msgs, contacts: p.contacts, visits, revenue, net, roi, breakeven };
  }, [plan, convRate, basket]);

  const fmt = (n: number) => n.toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n: number) => Math.round(n).toLocaleString("fr-CH");
  const roiColor = r.roi >= 300 ? "#16a34a" : r.roi >= 80 ? WA_DARK : "#d97706";

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Calculez votre ROI en 30 secondes</h2>
          <p className="mt-2 text-gray-500">Entrez vos chiffres — voyez ce que Whats-up vous rapporte concrètement.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Controls */}
          <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Votre plan</p>
              <Pill<0 | 1 | 2>
                options={PLANS.map((p, i) => ({ label: `${p.name} — CHF ${p.price}/mois`, value: i as 0 | 1 | 2 }))}
                value={plan}
                onChange={setPlan}
              />
              <p className="mt-2 text-xs text-gray-400 font-medium" style={{ color: WA_GREEN }}>
                {r.msgs} messages/mois · jusqu'à {r.contacts} contacts
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Taux de conversion</p>
              <p className="mb-2 text-xs text-gray-400">% de contacts qui achètent après un message</p>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={30} step={1} value={convRate}
                  onChange={(e) => setConvRate(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer"
                  style={{ accentColor: WA_GREEN }} />
                <span className="min-w-[48px] text-right text-base font-bold text-gray-900 tabular-nums">{convRate} %</span>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Panier moyen</p>
              <p className="mb-2 text-xs text-gray-400">Montant dépensé par visite (CHF)</p>
              <div className="flex items-center gap-4">
                <input type="range" min={10} max={300} step={5} value={basket}
                  onChange={(e) => setBasket(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer"
                  style={{ accentColor: WA_GREEN }} />
                <span className="min-w-[64px] text-right text-base font-bold text-gray-900 tabular-nums">{basket} CHF</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-6">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">Retour sur investissement</p>
              <p className="font-black leading-none tabular-nums" style={{ fontSize: "4.5rem", color: roiColor, letterSpacing: "-0.04em" }}>
                {r.roi < 0 ? `−${fmt(Math.abs(r.roi))} %` : `+${fmtInt(r.roi)} %`}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Pour <strong className="text-gray-900">CHF {fmt(r.price)}</strong> investis → <strong className="text-gray-900">CHF {fmt(r.revenue)}</strong> de revenus générés.
              </p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
              {[
                { label: "Coût mensuel",       value: `CHF ${fmt(r.price)}`,    sub: "abonnement tout inclus", color: "" },
                { label: "Clients / mois",     value: fmtInt(r.visits),         sub: `${convRate} % de ${r.contacts} contacts`, color: "" },
                { label: "Revenus / mois",     value: `CHF ${fmt(r.revenue)}`,  sub: "via vos messages", color: "#16a34a" },
                { label: "Gain net / mois",    value: `${r.net >= 0 ? "+" : "−"}CHF ${fmt(Math.abs(r.net))}`, sub: "après abonnement", color: r.net >= 0 ? "#16a34a" : "#d97706" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                  <p className="mt-1 text-xl font-bold tabular-nums" style={{ color: color || CHARCOAL }}>{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
              {r.breakeven <= r.visits
                ? <>Rentable dès <strong className="text-gray-700">{Math.ceil(r.breakeven)} client{r.breakeven > 1 ? "s" : ""}</strong> — vous en générez {fmtInt(r.visits)} ce mois.</>
                : "Augmentez votre taux de conversion ou votre panier pour atteindre la rentabilité."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 sm:text-3xl">Questions fréquentes</h2>
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-gray-900">{faq.q}</span>
                {open === i ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
              </button>
              {open === i && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-gray-500">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WhatsUpPage() {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md" style={{ background: "rgba(17,24,39,0.92)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: WA_GREEN }}>
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">Whats-up</span>
          </div>
          <a
            href="#pricing"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: WA_GREEN }}
          >
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: CHARCOAL }} className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full opacity-10 blur-3xl" style={{ background: WA_GREEN }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: WA_GREEN }} />
            98 % de taux d'ouverture · Lu en moins de 5 minutes
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Envoyez des messages WhatsApp<br />
            <span style={{ color: WA_GREEN }}>à tous vos clients</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Whats-up transforme vos contacts WhatsApp en machine à fidélisation.
            Salons, boutiques, garages, cabinets — peu importe votre activité.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 sm:w-auto"
              style={{ background: WA_GREEN }}
            >
              <MessageCircle className="h-5 w-5" />
              14 jours gratuits — sans carte
            </a>
            <a
              href="#how"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 border-t border-white/10 pt-10 sm:gap-8">
            {[
              { value: "98 %", label: "Taux d'ouverture WhatsApp" },
              { value: "5 min", label: "Temps moyen de lecture" },
              { value: "× 6", label: "Plus efficace qu'un email" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-black sm:text-3xl" style={{ color: WA_GREEN }}>{value}</p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 sm:text-3xl">Pour tous les commerces</h2>
          <p className="mb-10 text-center text-gray-500">Si vous avez des clients réguliers, Whats-up est fait pour vous.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {BUSINESS_TYPES.map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-2 py-4 text-center transition-colors hover:border-green-200 hover:bg-green-50">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-16 sm:py-20" style={{ background: "#f0fdf4" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 sm:text-3xl">En 3 étapes, c'est parti</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Vous imprimez votre QR code", desc: "Nous générons un QR code personnalisé à afficher en caisse, sur vos tables ou en vitrine." },
              { step: "02", title: "Vos clients scannent & s'abonnent", desc: "En deux secondes, ils rejoignent votre liste WhatsApp. Opt-in légal, liste 100 % à vous." },
              { step: "03", title: "Vous envoyez, ils reviennent", desc: "Promotions, nouveautés, rappels… Un message, des dizaines de retours en quelques minutes." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative rounded-2xl bg-white p-6 shadow-sm">
                <p className="mb-3 text-4xl font-black" style={{ color: WA_GREEN, opacity: 0.25 }}>{step}</p>
                <h3 className="mb-2 text-base font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">Tout ce dont vous avez besoin</h2>
          <p className="mb-12 text-center text-gray-500">Simple à utiliser, puissant dans les résultats.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-100 p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#f0fdf4" }}>
                  <Icon className="h-5 w-5" style={{ color: WA_DARK }} />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulator ── */}
      <Simulator />

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Des prix clairs, sans surprise</h2>
            <p className="mt-3 text-gray-500">14 jours gratuits sur tous les plans · Aucune commission · Annulable à tout moment</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl ${
                  p.highlight
                    ? "border-2 shadow-xl"
                    : "border border-gray-200"
                }`}
                style={p.highlight ? { borderColor: WA_GREEN } : {}}
              >
                {p.highlight && (
                  <div className="absolute inset-x-0 top-0 flex justify-center">
                    <span className="rounded-b-lg px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: WA_GREEN }}>
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}

                <div className="p-6 pt-8">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">{p.name}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-gray-400">CHF</span>
                    <span className="text-5xl font-black text-gray-900">{p.price}</span>
                    <span className="text-sm text-gray-400">/mois</span>
                  </div>

                  <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5">
                    <p className="text-sm font-semibold text-green-800">
                      <MessageCircle className="mr-1 inline h-3.5 w-3.5" style={{ color: WA_GREEN }} />
                      {p.msgs} messages/mois
                    </p>
                    <p className="text-xs text-green-600">jusqu'à {p.contacts} contacts</p>
                  </div>

                  <ul className="mt-5 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 shrink-0" style={{ color: WA_GREEN }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto px-6 pb-6">
                  <button
                    className="w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
                    style={
                      p.highlight
                        ? { background: WA_GREEN, color: "#fff" }
                        : { background: "#f3f4f6", color: CHARCOAL }
                    }
                  >
                    Essayer 14 jours gratuits
                  </button>
                  <p className="mt-2 text-center text-[10px] text-gray-400">Aucun débit · Annulable à tout moment</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Final CTA ── */}
      <section className="py-20" style={{ background: CHARCOAL }}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Prêt à remplir votre commerce<br />
            <span style={{ color: WA_GREEN }}>avec WhatsApp ?</span>
          </h2>
          <p className="mt-4 text-gray-400">
            14 jours gratuits, sans carte bancaire. Opérationnel en 24 h.
          </p>
          <a
            href="#pricing"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: WA_GREEN }}
          >
            <MessageCircle className="h-5 w-5" />
            Commencer maintenant — c'est gratuit
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500" style={{ background: CHARCOAL }}>
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: WA_GREEN }}>
            <MessageCircle className="h-3 w-3 text-white" />
          </div>
          <span className="font-bold text-white">Whats-up</span>
        </div>
        <p className="mt-2 text-xs text-gray-600">© 2026 Whats-up · Hébergement Suisse · Conforme RGPD & LPD</p>
      </footer>

    </div>
  );
}
