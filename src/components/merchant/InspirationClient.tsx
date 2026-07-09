"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { generateRecipeIdeas } from "@/actions/merchant/inspiration";
import type { RecipeIdea } from "@/actions/merchant/inspiration";
import {
  getSavedRecipes,
  saveRecipe,
  toggleRecipeCooked,
  deleteRecipe,
} from "@/actions/merchant/saved-recipes";
import type { SavedRecipe } from "@/actions/merchant/saved-recipes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  ChefHat,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Bookmark,
  BookmarkCheck,
  Trash2,
  CheckSquare,
  Square,
  ShoppingCart,
} from "lucide-react";

const COUNTS = [3, 5, 10] as const;

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  onend: () => void;
  onerror: () => void;
  onresult: (e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  start: () => void;
  stop: () => void;
};

export function InspirationClient() {
  const [ingredients, setIngredients] = useState("");
  const [count, setCount] = useState<3 | 5 | 10>(5);
  const [ideas, setIdeas] = useState<RecipeIdea[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set());
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    loadSavedRecipes();
  }, []);

  async function loadSavedRecipes() {
    const result = await getSavedRecipes();
    if (!result.error) setSavedRecipes(result.recipes);
  }

  function toggleMic() {
    setMicError(false);

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor =
      (window as unknown as Record<string, unknown>).SpeechRecognition as
        | (new () => SpeechRecognitionInstance)
        | undefined ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition as
        | (new () => SpeechRecognitionInstance)
        | undefined;

    if (!SpeechRecognitionCtor) {
      setMicError(true);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); setMicError(true); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setIngredients((prev) => prev.trim() ? `${prev.trim()}, ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function handleGenerate() {
    setError(null);
    setSavedIdeas(new Set());
    startTransition(async () => {
      const result = await generateRecipeIdeas(ingredients, count);
      if (result.error) {
        setError(result.error);
      } else {
        setIdeas(result.ideas);
      }
    });
  }

  async function handleSave(idea: RecipeIdea, index: number) {
    setIsSaving(index);
    const result = await saveRecipe(idea);
    if (!result.error) {
      setSavedIdeas((prev) => new Set([...prev, index]));
      await loadSavedRecipes();
    }
    setIsSaving(null);
  }

  async function handleToggleCooked(id: string, current: boolean) {
    await toggleRecipeCooked(id, !current);
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, cooked: !current } : r))
    );
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
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
            <div className="relative">
              <Textarea
                placeholder="Ex: filets de perche, pommes de terre, citron, câpres, crème fraîche..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                rows={3}
                className={isIOS ? "resize-none" : "resize-none pr-12"}
              />
              {!isIOS && (
                <button
                  type="button"
                  onClick={toggleMic}
                  title={isListening ? "Arrêter l'écoute" : "Dicter les ingrédients"}
                  className={`absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
            </div>
            {isIOS && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Sur iPhone, utilisez le micro de votre clavier pour dicter.
              </p>
            )}
            {isListening && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Écoute en cours… parlez clairement
              </p>
            )}
            {micError && (
              <p className="text-xs text-muted-foreground">
                Microphone non disponible sur ce navigateur.
              </p>
            )}
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

      {/* Generated ideas */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-muted-foreground">
            {ideas.length} idée{ideas.length > 1 ? "s" : ""} générée{ideas.length > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea, i) => {
              const saved = savedIdeas.has(i);
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-just-tag)]" />
                        <h3 className="font-semibold leading-tight">{idea.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => !saved && handleSave(idea, i)}
                        disabled={saved || isSaving === i}
                        title={saved ? "Sauvegardé" : "Sauvegarder cette recette"}
                        className={`shrink-0 transition-colors ${
                          saved
                            ? "text-[var(--color-just-tag)]"
                            : "text-muted-foreground hover:text-[var(--color-just-tag)]"
                        }`}
                      >
                        {isSaving === i ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saved ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
                    {idea.missing_ingredients?.length > 0 && (
                      <div className="flex items-start gap-2 rounded-md px-3 py-2" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                        <ShoppingCart className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#dc2626" }} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#dc2626" }}>Ingrédients manquants</p>
                          <p className="text-xs" style={{ color: "#991b1b" }}>{idea.missing_ingredients.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {idea.tip && (
                      <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <p className="text-xs text-amber-800">{idea.tip}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {ideas.length === 0 && !isPending && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ChefHat className="mb-4 h-14 w-14 opacity-15" />
          <p className="text-sm">Entrez vos ingrédients ou dictez-les avec le micro.</p>
        </div>
      )}

      {/* Saved recipes */}
      {savedRecipes.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookmarkCheck className="h-4 w-4 text-[var(--color-just-tag)]" />
                Recettes déjà cuisinées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {savedRecipes.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    r.cooked ? "bg-muted/40" : "bg-background border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleCooked(r.id, r.cooked)}
                    className={`mt-0.5 shrink-0 transition-colors ${
                      r.cooked
                        ? "text-[var(--color-just-tag)]"
                        : "text-muted-foreground hover:text-[var(--color-just-tag)]"
                    }`}
                  >
                    {r.cooked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${r.cooked ? "line-through text-muted-foreground" : ""}`}>
                      {r.name}
                    </p>
                    {r.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
