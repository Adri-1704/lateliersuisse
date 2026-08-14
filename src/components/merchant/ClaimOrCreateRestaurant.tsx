"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { searchAvailableRestaurants, claimExistingRestaurant } from "@/actions/merchant/restaurant";
import type { CuisineType } from "@/lib/supabase/types";
import { CreateRestaurantForm } from "@/components/merchant/CreateRestaurantForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SearchResult = { slug: string; name: string; city: string };

const DEBOUNCE_MS = 350;

interface ClaimOrCreateRestaurantProps {
  cuisineTypes: CuisineType[];
  /** Appelé une fois la demande de revendication envoyée avec succès. */
  onClaimed: () => void;
  /** Appelé une fois le restaurant créé avec succès (repli création). */
  onCreated: () => void;
}

export function ClaimOrCreateRestaurant({ cuisineTypes, onClaimed, onCreated }: ClaimOrCreateRestaurantProps) {
  const t = useTranslations("merchantPortal.claim");
  const [mode, setMode] = useState<"search" | "create">("search");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Identifiant de la dernière requête lancée : permet d'ignorer les réponses
  // obsolètes qui reviendraient après une requête plus récente (résultats en désordre).
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // Invalide toute requête en vol pour ne jamais l'appliquer après coup.
      requestIdRef.current += 1;
      setResults([]);
      setSearching(false);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const found = await searchAvailableRestaurants(trimmed);
      // Une requête plus récente a été lancée entre-temps : on ignore cette réponse périmée.
      if (requestId !== requestIdRef.current) return;
      setResults(found);
      setSearching(false);
      setHasSearched(true);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function openConfirm(result: SearchResult) {
    setClaimError(null);
    setSelected(result);
  }

  function closeConfirm() {
    if (claiming) return;
    setSelected(null);
    setClaimError(null);
  }

  async function handleConfirmClaim() {
    if (!selected) return;
    setClaiming(true);
    setClaimError(null);
    const result = await claimExistingRestaurant(selected.slug);
    setClaiming(false);
    if (result.success) {
      setSelected(null);
      onClaimed();
    } else {
      setClaimError(result.error || t("claimError"));
    }
  }

  if (mode === "create") {
    return (
      <CreateRestaurantForm
        cuisineTypes={cuisineTypes}
        onCreated={onCreated}
        showHeader={true}
        onBack={() => setMode("search")}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="text-center py-4">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #fff3ee, #ffe4d6)" }}
        >
          <Search className="h-8 w-8" style={{ color: "#e85d26" }} />
        </div>
        <h1 className="mt-4 text-2xl font-black text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-[13px] text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
        <label htmlFor="restaurant-search" className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          {t("searchLabel")}
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="restaurant-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent h-11"
          />
        </div>

        {query.trim().length > 0 && query.trim().length < 2 && (
          <p className="mt-2 text-[11px] text-gray-400">{t("searchHint")}</p>
        )}

        {/* Zone résultats */}
        <div className="mt-4 space-y-2" aria-live="polite">
          {searching && (
            <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("searching")}
            </div>
          )}

          {!searching && hasSearched && results.length === 0 && (
            <p className="rounded-xl px-4 py-3 text-sm text-gray-500" style={{ background: "#f8fafc" }}>
              {t("noResults", { query: query.trim() })}
            </p>
          )}

          {!searching && !hasSearched && query.trim().length === 0 && (
            <p className="rounded-xl px-4 py-3 text-sm text-gray-400" style={{ background: "#f8fafc" }}>
              {t("emptyState")}
            </p>
          )}

          {!searching &&
            results.map((r) => (
              <div
                key={r.slug}
                className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ border: "1.5px solid #eaecf0" }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="flex items-center gap-1 text-[12px] text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {r.city}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openConfirm(r)}
                  className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
                >
                  {t("claimButton")}
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode("create")}
          className="text-[13px] font-semibold underline decoration-dotted underline-offset-4 transition-colors hover:text-gray-700"
          style={{ color: "#e85d26" }}
        >
          {t("notInList")}
        </button>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmTitle")}</DialogTitle>
            <DialogDescription>
              {selected && t("confirmDescription", { name: selected.name, city: selected.city })}
            </DialogDescription>
          </DialogHeader>

          {claimError && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {claimError}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={closeConfirm}
              disabled={claiming}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60"
              style={{ border: "1.5px solid #eaecf0" }}
            >
              {t("confirmCancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirmClaim}
              disabled={claiming}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {claiming ? t("claiming") : t("confirmSubmit")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
