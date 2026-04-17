"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, Navigation, Loader2, AlertCircle } from "lucide-react";

interface NearbyRestaurant {
  id: string;
  slug: string;
  name_fr: string;
  name_de: string;
  name_en: string;
  description_fr: string;
  city: string;
  canton: string;
  cuisine_type: string | null;
  avg_rating: number | null;
  review_count: number | null;
  price_range: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
}

function getLocalizedName(r: NearbyRestaurant, locale: string): string {
  if (locale === "de") return r.name_de || r.name_fr;
  if (locale === "en") return r.name_en || r.name_fr;
  return r.name_fr;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const i18n: Record<string, {
  title: string; subtitle: string; button: string; loading: string;
  error: string; denied: string; noResults: string; retry: string;
  expand: string;
}> = {
  fr: {
    title: "Autour de moi",
    subtitle: "Les restaurants, bars et cafés les plus proches de vous",
    button: "Trouver les restaurants autour de moi",
    loading: "Recherche en cours...",
    error: "Impossible de récupérer votre position. Vérifiez que la géolocalisation est activée.",
    denied: "Vous avez refusé la géolocalisation. Activez-la dans les paramètres de votre navigateur pour utiliser cette fonctionnalité.",
    noResults: "Aucun restaurant trouvé dans un rayon de 20 km.",
    retry: "Réessayer",
    expand: "Chercher dans un rayon plus large",
  },
  de: {
    title: "In meiner Nähe",
    subtitle: "Die nächsten Restaurants, Bars und Cafés",
    button: "Restaurants in meiner Nähe finden",
    loading: "Suche läuft...",
    error: "Position konnte nicht ermittelt werden. Bitte Standortdienste aktivieren.",
    denied: "Standortdienste wurden abgelehnt. Bitte in den Browsereinstellungen aktivieren.",
    noResults: "Keine Restaurants im Umkreis von 20 km gefunden.",
    retry: "Erneut versuchen",
    expand: "In größerem Umkreis suchen",
  },
  en: {
    title: "Near me",
    subtitle: "The closest restaurants, bars and cafés to your location",
    button: "Find restaurants near me",
    loading: "Searching...",
    error: "Unable to get your location. Please make sure location services are enabled.",
    denied: "Location access denied. Please enable it in your browser settings.",
    noResults: "No restaurants found within 20 km.",
    retry: "Try again",
    expand: "Search in a wider radius",
  },
  pt: {
    title: "Perto de mim",
    subtitle: "Os restaurantes, bares e cafés mais próximos de si",
    button: "Encontrar restaurantes perto de mim",
    loading: "A procurar...",
    error: "Não foi possível obter a sua localização.",
    denied: "Acesso à localização negado.",
    noResults: "Nenhum restaurante encontrado num raio de 20 km.",
    retry: "Tentar novamente",
    expand: "Procurar num raio maior",
  },
  es: {
    title: "Cerca de mí",
    subtitle: "Los restaurantes, bares y cafés más cercanos",
    button: "Encontrar restaurantes cerca de mí",
    loading: "Buscando...",
    error: "No se pudo obtener su ubicación.",
    denied: "Acceso a la ubicación denegado.",
    noResults: "No se encontraron restaurantes en un radio de 20 km.",
    retry: "Reintentar",
    expand: "Buscar en un radio más amplio",
  },
};

export function NearbyRestaurants({ locale }: { locale: string }) {
  const t = i18n[locale] || i18n.fr;

  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [located, setLocated] = useState(false);
  const [radius, setRadius] = useState(20);

  const findNearby = useCallback(async (maxDistance = 20) => {
    setLoading(true);
    setError(null);
    setRadius(maxDistance);

    if (!navigator.geolocation) {
      setError(t.error);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(`/api/nearby?lat=${latitude}&lon=${longitude}&radius=${maxDistance}&limit=50`);
          const data = await res.json();

          if (data.error) {
            setError(data.error);
          } else {
            setRestaurants(data.restaurants || []);
            setLocated(true);
          }
        } catch {
          setError(t.error);
        }
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(t.denied);
        } else {
          setError(t.error);
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [t]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-[var(--color-just-tag)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/70">
            <Link href={`/${locale}`} className="hover:text-white">Just-Tag</Link>
            <span className="mx-2">›</span>
            <Link href={`/${locale}/restaurants`} className="hover:text-white">Restaurants</Link>
            <span className="mx-2">›</span>
            <span>{t.title}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Navigation className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {t.title}
              </h1>
              <p className="mt-2 text-sm text-white/80">{t.subtitle}</p>
            </div>
          </div>

          {!located && !loading && (
            <div className="mt-8">
              <button
                onClick={() => findNearby(20)}
                className="inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-bold text-[var(--color-just-tag)] shadow-lg transition hover:scale-105"
              >
                <MapPin className="h-5 w-5" />
                {t.button}
              </button>
              <p className="mt-3 text-xs text-white/60">
                {locale === "fr" ? "Votre position n'est jamais stockée ni partagée." : "Your location is never stored or shared."}
              </p>
            </div>
          )}

          {loading && (
            <div className="mt-8 flex items-center gap-3 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t.loading}</span>
            </div>
          )}

          {error && (
            <div className="mt-8 flex items-center gap-3 rounded-xl bg-red-500/20 px-6 py-4 text-white">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => findNearby(radius)}
                className="ml-auto rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
              >
                {t.retry}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      {located && (
        <section className="bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t.noResults}</p>
                <button
                  onClick={() => findNearby(radius + 20)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-just-tag)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Navigation className="h-4 w-4" />
                  {t.expand}
                </button>
              </div>
            ) : (
              <>
                <p className="mb-6 text-sm text-gray-500">
                  {restaurants.length} {locale === "de" || locale === "en" ? "restaurants" : "restaurants"} {locale === "fr" ? `dans un rayon de ${radius} km` : locale === "de" ? `im Umkreis von ${radius} km` : `within ${radius} km`}
                </p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {restaurants.map((r) => {
                    const name = getLocalizedName(r, locale);
                    return (
                      <Link
                        key={r.id}
                        href={`/${locale}/restaurants/${r.slug}`}
                        className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black px-4">
                          <h3 className="z-10 line-clamp-3 text-center text-lg font-bold text-white">
                            {name}
                          </h3>
                          {r.cuisine_type && (
                            <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                              {r.cuisine_type}
                            </span>
                          )}
                          <span className="absolute right-3 top-3 rounded-full bg-[var(--color-just-tag)] px-2.5 py-0.5 text-xs font-bold text-white">
                            {formatDistance(r.distance_km)}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="line-clamp-1 text-base font-semibold text-gray-900 group-hover:text-[var(--color-just-tag)]">
                              {name}
                            </h4>
                            {r.avg_rating ? (
                              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5">
                                <Star className="h-3.5 w-3.5 fill-[var(--color-just-tag)] text-[var(--color-just-tag)]" />
                                <span className="text-sm font-bold text-[var(--color-just-tag)]">
                                  {r.avg_rating.toFixed(1)}
                                </span>
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="line-clamp-1">{r.city}</span>
                            <span className="text-gray-300">·</span>
                            <span className="font-medium text-[var(--color-just-tag)]">
                              {formatDistance(r.distance_km)}
                            </span>
                            {r.review_count ? (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{r.review_count} avis</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {restaurants.length >= 50 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => findNearby(radius + 10)}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      <Navigation className="h-4 w-4" />
                      {t.expand}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </>
  );
}
