"use client";

import { useEffect, useRef } from "react";

export function B2BWhatsAppStats() {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll<HTMLElement>("[data-bar-width]");
            bars.forEach((bar) => {
              bar.style.width = bar.dataset.barWidth ?? "0%";
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (barsRef.current) observer.observe(barsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-gray-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-just-tag)]">
          Pourquoi WhatsApp ?
        </p>
        <h2 className="mb-10 text-center font-condensed text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Vos clients <span className="text-[var(--color-just-tag)]">lisent vraiment</span>
          <br />
          vos messages.
        </h2>

        {/* Stats grid */}
        <div className="mb-10 grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-gray-100">
          {[
            {
              number: "98",
              unit: "%",
              label: "Taux d'ouverture",
              desc: "Contre 20% pour un email. 5× plus de clients qui voient votre message.",
            },
            {
              number: "5",
              unit: " min",
              label: "Temps de lecture moyen",
              desc: "80% des messages sont lus dans les 5 minutes. Envoyez à 11h30, remplissez votre salle le midi.",
            },
            {
              number: "4",
              unit: "×",
              label: "Plus efficace que l'email",
              desc: "Un message WhatsApp a 4 à 5× plus de chances d'être lu qu'un email marketing traditionnel.",
            },
          ].map(({ number, unit, label, desc }) => (
            <div key={label} className="bg-white p-8 text-center">
              <div className="mb-1 font-condensed text-6xl font-black leading-none text-gray-900">
                {number}
                <span className="text-[var(--color-just-tag)]">{unit}</span>
              </div>
              <div className="mb-2 text-sm font-semibold text-gray-900">{label}</div>
              <div className="text-xs leading-relaxed text-gray-500">{desc}</div>
            </div>
          ))}
        </div>

        {/* Comparison bars */}
        <div ref={barsRef} className="rounded-2xl bg-gray-50 p-6 sm:p-8">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
            Taux d&apos;ouverture par canal
          </p>
          {[
            {
              label: "WhatsApp",
              pct: "98%",
              width: "98%",
              barClass: "bg-[#25D366]",
              textClass: "text-green-600 font-bold",
            },
            {
              label: "Email",
              pct: "~20%",
              width: "20%",
              barClass: "bg-slate-400",
              textClass: "text-gray-500",
            },
            {
              label: "Réseaux sociaux",
              pct: "~4%",
              width: "4%",
              barClass: "bg-slate-300",
              textClass: "text-gray-400",
            },
          ].map(({ label, pct, width, barClass, textClass }) => (
            <div key={label} className="mb-3 flex items-center gap-4 last:mb-0">
              <span className="w-28 shrink-0 text-xs font-semibold text-gray-700">{label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  data-bar-width={width}
                  style={{ width: "0%", transition: "width 1s ease" }}
                  className={`h-full rounded-full ${barClass}`}
                />
              </div>
              <span className={`w-10 shrink-0 text-right text-xs ${textClass}`}>{pct}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          Sources : Meta Business, France Num 2026 · Taux d&apos;ouverture mesuré sur messages opt-in Business API
        </p>
      </div>
    </section>
  );
}
