import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/logo";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo size={48} className="mx-auto mb-4 rounded-xl" />
          <h1 className="text-2xl font-bold">Just-Tag</h1>
          <p className="mt-1 text-sm text-muted-foreground">Administration</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
