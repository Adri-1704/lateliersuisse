"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, Loader2, MapPin, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchAllRestaurants } from "@/actions/b2b-search";
import Link from "next/link";

interface RestaurantResult {
  slug: string;
  name: string;
  city: string;
}

export function B2BFindRestaurant() {
  const params = useParams();
  const locale = params.locale as string;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RestaurantResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantResult | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchAllRestaurants(query);
        setResults(res);
      } catch {
        setResults([]);
      }
      setSearching(false);
      setHasSearched(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <section id="b2b-find-restaurant" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Votre restaurant est peut-etre deja sur Just-Tag
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Recherchez votre etablissement et prenez le controle de votre fiche.
          </p>
        </div>

        <div className="mt-10">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedRestaurant(null);
              }}
              placeholder="Tapez le nom de votre restaurant..."
              className="block w-full rounded-xl border-2 border-gray-200 bg-white pl-12 pr-12 py-4 text-base outline-none transition-colors focus:border-[var(--color-just-tag)] focus:ring-2 focus:ring-[var(--color-just-tag)]/20"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>

          {/* Results dropdown */}
          {results.length > 0 && !selectedRestaurant && (
            <div className="mt-2 rounded-xl border bg-white shadow-lg max-h-64 overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => {
                    setSelectedRestaurant(r);
                    setQuery(r.name);
                    setResults([]);
                  }}
                  className="w-full px-5 py-3.5 text-left hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0 transition-colors"
                >
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {r.city}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected restaurant card */}
          {selectedRestaurant && (
            <div className="mt-6 rounded-2xl border-2 border-[var(--color-just-tag)] bg-[var(--color-just-tag)]/5 p-6 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Votre restaurant{" "}
                <span className="text-[var(--color-just-tag)]">
                  {selectedRestaurant.name}
                </span>{" "}
                est deja sur Just-Tag.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Revendiquez votre fiche pour la personnaliser et attirer plus de clients.
              </p>
              <Link
                href={`/${locale}/partenaire-inscription?restaurant=${selectedRestaurant.slug}`}
              >
                <Button className="mt-4 bg-[var(--color-just-tag)] px-8 py-3 text-base hover:bg-[var(--color-just-tag-dark)]">
                  Revendiquer ma fiche
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}

          {/* No results */}
          {hasSearched && query.length >= 2 && results.length === 0 && !selectedRestaurant && !searching && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-gray-700">
                Votre restaurant n&apos;est pas encore sur Just-Tag.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Ajoutez-le et profitez de l&apos;offre Early Bird !
              </p>
              <Link href={`/${locale}/partenaire-inscription`}>
                <Button className="mt-4 bg-[var(--color-just-tag)] px-8 py-3 text-base hover:bg-[var(--color-just-tag-dark)]">
                  <Plus className="mr-2 h-5 w-5" />
                  Ajouter mon restaurant
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
