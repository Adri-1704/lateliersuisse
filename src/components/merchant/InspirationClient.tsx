"use client";

import { useState, useTransition } from "react";
import { generateRecipeIdeas } from "@/actions/merchant/inspiration";
import type { RecipeIdea } from "@/actions/merchant/inspiration";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChefHat, Lightbulb, Loader2 } from "lucide-react";

const COUNTS = [3, 5, 10] as const;

export function InspirationClient() {
  const [ingredients, setIngredients] = useState("");
  const [count, setCount] = useState<3 | 5 | 10>(5);
  const [ideas, setIdeas] = useState<RecipeIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateRecipeIdeas(ingredients, count);
      if (result.error) {
        setError(result.error);
      } else {
        setIdeas(result.ideas);
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Input card */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Quels ingrédients avez-vous aujourd&apos;hui ?
            </label>
            <Textarea
              placeholder="Ex: filets de perche, pommes de terre, citron, câpres, crème fraîche..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Nombre d&apos;idées :</span>
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={`h-8 w-10 rounded-md text-sm font-medium transition-colors ${
                  count === n
                    ? "bg-[var(--color-just-tag)] text-white"
                    : "border border-input bg-background hover:bg-muted"
                }`}
              >
                {n}
              </button>
            ))}

            <Button
              onClick={handleGenerate}
              disabled={isPending || !ingredients.trim()}
              className="ml-auto bg-[var(--color-just-tag)] hover:bg-[#CC1119] text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer
                </>
              )}
            </Button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-muted-foreground">
            {ideas.length} idée{ideas.length > 1 ? "s" : ""} générée{ideas.length > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
                    <h3 className="font-semibold leading-tight">{idea.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
                  {idea.tip && (
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <p className="text-xs text-amber-800">{idea.tip}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {ideas.length === 0 && !isPending && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <ChefHat className="mb-4 h-14 w-14 opacity-15" />
          <p className="text-sm">Entrez vos ingrédients et laissez l&apos;IA vous inspirer.</p>
        </div>
      )}
    </div>
  );
}
