import Image from "next/image";
import { Gift } from "lucide-react";
import { getAligroOfferLabel } from "@/config/aligro";

/**
 * Bandeau mettant en avant l'offre partenaire Aligro. Le texte de l'offre
 * provient de `getAligroOfferLabel()` (voir src/config/aligro.ts) : il
 * s'adapte automatiquement une fois le pourcentage de remise décidé.
 */
export function AligroOfferBanner() {
  return (
    <div className="relative overflow-hidden border-y border-[var(--color-just-tag-dark)] bg-gradient-to-r from-[var(--color-just-tag)] to-[var(--color-just-tag-dark)] py-4">
      <div className="animate-shimmer absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 text-center sm:flex-row sm:gap-3">
        <Gift className="h-5 w-5 shrink-0 animate-pulse-gentle text-white" aria-hidden="true" />
        <p className="text-sm font-semibold text-white sm:text-base">
          <span className="uppercase tracking-wide text-white/80">
            Offre partenaire{" "}
          </span>
          <span className="mx-1 inline-flex items-center rounded-full bg-white px-2 py-0.5 align-middle shadow-sm">
            <Image
              src="/partners/aligro-logo.png"
              alt="ALIGRO"
              width={900}
              height={500}
              className="h-4 w-auto object-contain"
            />
          </span>
          {" — "}
          {getAligroOfferLabel()}
        </p>
      </div>
    </div>
  );
}
