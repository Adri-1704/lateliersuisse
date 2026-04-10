"use client";

/* eslint-disable @next/next/no-img-element */

export function FounderSection() {
  return (
    <section className="bg-zinc-50 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex justify-center">
            <img
              src="/adrien.webp"
              alt="Adrien Haubrich"
              className="h-64 w-64 rounded-2xl object-cover shadow-lg"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-red-500">
              Le fondateur
            </p>
            <h2 className="mb-4 text-3xl font-bold text-zinc-900">
              Adrien Haubrich
            </h2>
            <p className="mb-4 text-zinc-600 leading-relaxed">
              Passionné de gastronomie et entrepreneur digital basé au Bouveret
              en Valais, j&apos;ai créé Just-Tag pour mettre en lumière les
              restaurants suisses qui méritent d&apos;être découverts.
            </p>
            <p className="mb-6 text-zinc-600 leading-relaxed">
              Parce que les meilleures adresses ne sont pas toujours les plus
              visibles, Just-Tag donne aux restaurateurs indépendants la
              visibilité qu&apos;ils méritent — et aux gourmands, un guide de
              confiance.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700">
                100% Suisse
              </span>
              <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700">
                Le Bouveret, Valais
              </span>
              <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700">
                Entrepreneur depuis 2017
              </span>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mb-3 text-3xl">🇨🇭</div>
            <h3 className="mb-1 text-sm font-bold text-zinc-900">100% Suisse</h3>
            <p className="text-xs text-zinc-600">
              Plateforme créée en Suisse, pour les restaurants suisses et les
              gourmands locaux.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mb-3 text-3xl">💬</div>
            <h3 className="mb-1 text-sm font-bold text-zinc-900">Support direct</h3>
            <p className="text-xs text-zinc-600">
              Une question ? Contactez-moi directement par WhatsApp ou email.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="mb-3 text-3xl">🍽️</div>
            <h3 className="mb-1 text-sm font-bold text-zinc-900">Restaurants vérifiés</h3>
            <p className="text-xs text-zinc-600">
              Chaque restaurant est vérifié manuellement pour garantir la
              qualité des recommandations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
