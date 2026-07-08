import Link from "next/link";
import { getRestaurant } from "@/actions/admin/restaurants";
import { ArrowLeft, UserCheck, UserX } from "lucide-react";
import { RestaurantEditForm } from "./RestaurantEditForm";
import { UnlinkMerchantButton } from "./UnlinkMerchantButton";
import { createAdminClient } from "@/lib/supabase/server";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getRestaurant(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant non trouvé</h1>
        <Link
          href="/admin/restaurants"
          className="inline-flex items-center gap-2 rounded-xl border border-[#eaecf0] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const r = result.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rAny = r as any;
  let merchant: { id: string; name: string; email: string } | null = null;
  if (rAny.merchant_id) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("merchants")
      .select("id, name, email")
      .eq("id", rAny.merchant_id)
      .single();
    merchant = data as { id: string; name: string; email: string } | null;
  }

  const claimStatus = (rAny.claim_status as string) || "unclaimed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/restaurants"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eaecf0] bg-white text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">{r.name_fr}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {r.city}, {r.canton}
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
          style={
            r.is_published
              ? { background: "#f0fdf4", color: "#16a34a" }
              : { background: "#f3f4f6", color: "#6b7280" }
          }
        >
          {r.is_published ? "Publié" : "Brouillon"}
        </span>
      </div>

      {/* Commerçant lié */}
      <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-4">
          {merchant ? (
            <UserCheck className="h-4 w-4 text-emerald-600" />
          ) : (
            <UserX className="h-4 w-4 text-gray-400" />
          )}
          Commerçant
        </h2>
        {merchant ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{merchant.name}</p>
              <p className="text-sm text-gray-500">{merchant.email}</p>
              <span
                className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: "#eef2ff", color: "#4f46e5" }}
              >
                {claimStatus === "claimed"
                  ? "Revendiqué"
                  : claimStatus === "pending"
                  ? "En attente"
                  : claimStatus}
              </span>
            </div>
            <UnlinkMerchantButton restaurantId={r.id} merchantName={merchant.name} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucun commerçant lié à ce restaurant.</p>
        )}
      </div>

      <RestaurantEditForm restaurant={r} />
    </div>
  );
}
