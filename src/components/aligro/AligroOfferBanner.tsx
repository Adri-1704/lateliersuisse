import { Gift } from "lucide-react";
import { getAligroOfferLabel } from "@/config/aligro";

/**
 * Bandeau mettant en avant l'offre partenaire Aligro. Le texte de l'offre
 * provient de `getAligroOfferLabel()` (voir src/config/aligro.ts) : il
 * s'adapte automatiquement une fois le pourcentage de remise décidé.
 */
export function AligroOfferBanner() {
  return (
    <div className="border-y border-[var(--color-just-tag-dark)] bg-[var(--color-just-tag)] py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 text-center sm:flex-row sm:gap-3">
        <Gift className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
        <p className="text-sm font-semibold text-white sm:text-base">
          <span className="uppercase tracking-wide text-white/80">
            Offre partenaire Aligro —{" "}
          </span>
          {getAligroOfferLabel()}
        </p>
      </div>
    </div>
  );
}
