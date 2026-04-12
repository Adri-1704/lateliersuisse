"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SwissCross } from "@/components/ui/swiss-cross";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Loader2 } from "lucide-react";
import { registerMerchant, searchAvailableRestaurants } from "@/actions/merchant/register";

export default function MerchantSignupPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [restaurantResults, setRestaurantResults] = useState<{ slug: string; name: string; city: string }[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ slug: string; name: string; city: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Search restaurants as user types
  useEffect(() => {
    if (restaurantQuery.length < 2) {
      setRestaurantResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchAvailableRestaurants(restaurantQuery);
      setRestaurantResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [restaurantQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await registerMerchant({
      name,
      email,
      password,
      phone,
      restaurantSlug: selectedRestaurant?.slug || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Erreur inconnue");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Compte créé avec succès !</h1>
        <p className="mt-3 text-gray-600">
          {selectedRestaurant
            ? `Votre restaurant "${selectedRestaurant.name}" a été lié à votre compte.`
            : "Vous pourrez associer votre restaurant depuis votre tableau de bord."}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Vous pouvez maintenant vous connecter à votre espace partenaire.
        </p>
        <Button
          className="mt-6 bg-[var(--color-just-tag)] text-white hover:opacity-90"
          onClick={() => router.push(`/${locale}/espace-client/connexion`)}
        >
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <SwissCross size={36} />
          <span className="text-xl font-bold">
            Just<span className="text-[var(--color-just-tag)]">-Tag</span>
          </span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Devenir partenaire</h1>
        <p className="mt-2 text-gray-500">
          Créez votre compte et gérez votre restaurant sur Just-Tag
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom complet *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean Dupont"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email professionnel *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@restaurant.ch"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe *</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 caractères"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+41 XX XXX XX XX"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
          />
        </div>

        {/* Restaurant Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Votre restaurant</label>
          <p className="text-xs text-gray-400 mt-0.5">Recherchez votre restaurant pour le lier à votre compte</p>

          {selectedRestaurant ? (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">{selectedRestaurant.name}</span>
                <span className="text-xs text-green-600">({selectedRestaurant.city})</span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedRestaurant(null); setRestaurantQuery(""); }}
                className="text-xs text-green-600 hover:underline"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={restaurantQuery}
                onChange={(e) => setRestaurantQuery(e.target.value)}
                placeholder="Tapez le nom de votre restaurant..."
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
              )}

              {/* Search Results Dropdown */}
              {restaurantResults.length > 0 && !selectedRestaurant && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-48 overflow-y-auto">
                  {restaurantResults.map((r) => (
                    <button
                      key={r.slug}
                      type="button"
                      onClick={() => {
                        setSelectedRestaurant(r);
                        setRestaurantQuery("");
                        setRestaurantResults([]);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-400">{r.city}</span>
                    </button>
                  ))}
                </div>
              )}

              {restaurantQuery.length >= 2 && restaurantResults.length === 0 && !searching && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Aucun restaurant trouvé</p>
                  <p className="text-xs text-gray-400 mt-1">Vous pourrez créer votre fiche après l'inscription</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-just-tag)] text-white hover:opacity-90 py-3"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours...
            </span>
          ) : (
            "Créer mon compte"
          )}
        </Button>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href={`/${locale}/espace-client/connexion`} className="text-[var(--color-just-tag)] hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
