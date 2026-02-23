import { LoginForm } from "@/components/admin/LoginForm";
import { UtensilsCrossed } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-just-tag)] text-white">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Just-Tag</h1>
          <p className="mt-1 text-sm text-muted-foreground">Administration</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
