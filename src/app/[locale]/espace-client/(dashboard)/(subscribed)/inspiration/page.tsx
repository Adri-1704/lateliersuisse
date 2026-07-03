import { InspirationClient } from "@/components/merchant/InspirationClient";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { Sparkles, ChefHat } from "lucide-react";

export default async function InspirationPage() {
  const result = await getMerchantRestaurant();
  const cuisineType = result.data?.cuisine_type || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-[var(--color-just-tag)]" />
          Inspiration
        </h1>
        <p className="mt-1 text-muted-foreground">
          Entrez les ingrédients du jour — l&apos;IA vous propose des idées de plats adaptées à votre cuisine.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-muted bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <ChefHat className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-just-tag)]" />
        <span>
          Je vais te proposer des recettes en fonction de ce que tu as en stock
          {cuisineType ? (
            <> et du type de cuisine de ton restaurant : <strong className="text-foreground">{cuisineType}</strong>.</>
          ) : (
            <>. Pour des suggestions encore plus adaptées, renseigne ton <strong className="text-foreground">type de cuisine</strong> dans <em>Mon restaurant</em>.</>
          )}
        </span>
      </div>

      <InspirationClient />
    </div>
  );
}
