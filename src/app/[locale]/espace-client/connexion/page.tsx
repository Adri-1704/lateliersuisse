import { UtensilsCrossed } from "lucide-react";
import { MerchantLoginForm } from "@/components/merchant/MerchantLoginForm";

export default function MerchantLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-warm-cream)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-just-tag)] text-white">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">
            Just<span className="text-[var(--color-just-tag)]">-Tag</span>
          </h1>
          <p className="text-sm text-muted-foreground">Espace Partenaire</p>
        </div>
        <MerchantLoginForm />
      </div>
    </div>
  );
}
