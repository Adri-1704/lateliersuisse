import Link from "next/link";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { NewRestaurantForm } from "@/components/admin/NewRestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/restaurants"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eaecf0] bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <UtensilsCrossed className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Nouveau restaurant</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Créer une nouvelle fiche restaurant</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
        <h2 className="mb-5 text-sm font-bold text-gray-700">Informations du restaurant</h2>
        <NewRestaurantForm />
      </div>
    </div>
  );
}
