import { InspirationClient } from "@/components/merchant/InspirationClient";
import { Sparkles } from "lucide-react";

export default function InspirationPage() {
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
      <InspirationClient />
    </div>
  );
}
