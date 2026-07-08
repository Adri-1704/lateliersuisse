import { InspirationClient } from "@/components/merchant/InspirationClient";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { Lightbulb, ChefHat } from "lucide-react";

export default async function InspirationPage() {
  const result = await getMerchantRestaurant();
  const cuisineType = result.data?.cuisine_type || null;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #06b6d4, #22d3ee)" }}>
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Inspiration IA</h1>
          <p className="text-[13px] text-gray-400">
            Entrez les ingrédients du jour — l&apos;IA vous propose des idées de plats adaptées à votre cuisine.
          </p>
        </div>
      </div>

      {/* Context banner */}
      <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "linear-gradient(135deg, #ecfeff, #cffafe)", border: "1px solid #a5f3fc" }}>
        <ChefHat className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#06b6d4" }} />
        <p className="text-sm" style={{ color: "#164e63" }}>
          Je vais te proposer des recettes en fonction de ce que tu as en stock
          {cuisineType ? (
            <> et du type de cuisine de ton restaurant : <strong>{cuisineType}</strong>.</>
          ) : (
            <>. Pour des suggestions encore plus adaptées, renseigne ton <strong>type de cuisine</strong> dans <em>Mon restaurant</em>.</>
          )}
        </p>
      </div>

      <InspirationClient />
    </div>
  );
}
