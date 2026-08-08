import { Logo } from "@/components/ui/logo";
import { MerchantLoginForm } from "@/components/merchant/MerchantLoginForm";

export default function MerchantLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-warm-cream)] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Logo size={48} className="rounded-xl" />
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
