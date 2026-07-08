import Link from "next/link";
import { getMerchant } from "@/actions/admin/merchants";
import { ArrowLeft, Mail, Phone, Calendar, CreditCard } from "lucide-react";
import { DeleteMerchantButton } from "./DeleteMerchantButton";

const statusColors: Record<string, { bg: string; color: string }> = {
  active: { bg: "#f0fdf4", color: "#16a34a" },
  past_due: { bg: "#fef2f2", color: "#dc2626" },
  canceled: { bg: "#f3f4f6", color: "#6b7280" },
  incomplete: { bg: "#fffbeb", color: "#d97706" },
  trialing: { bg: "#eff6ff", color: "#2563eb" },
};

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "À vie",
};

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getMerchant(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Commerçant non trouvé</h1>
        <Link
          href="/admin/merchants"
          className="inline-flex items-center gap-2 rounded-xl border border-[#eaecf0] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const m = result.data;
  const sub = m.subscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/merchants"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eaecf0] bg-white text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-gray-900">{m.name}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{m.email}</p>
        </div>
        <DeleteMerchantButton merchantId={m.id} merchantName={m.name} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="font-bold text-gray-900 mb-4">Informations</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${m.email}`} className="text-indigo-600 hover:underline">
                {m.email}
              </a>
            </div>
            {m.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{m.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                Inscrit le{" "}
                {new Date(m.created_at).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Abonnement */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Abonnement
          </h2>
          {sub ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Plan :</span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "#eef2ff", color: "#4f46e5" }}
                >
                  {planLabels[sub.plan_type] || sub.plan_type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Statut :</span>
                {(() => {
                  const s = statusColors[sub.status] || { bg: "#f3f4f6", color: "#374151" };
                  return (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {sub.status}
                    </span>
                  );
                })()}
              </div>
              {sub.current_period_start && (
                <p className="text-sm text-gray-500">
                  Début : {new Date(sub.current_period_start).toLocaleDateString("fr-CH")}
                </p>
              )}
              {sub.current_period_end && (
                <p className="text-sm text-gray-500">
                  Fin : {new Date(sub.current_period_end).toLocaleDateString("fr-CH")}
                </p>
              )}
              {sub.cancel_at_period_end && (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "#fef2f2", color: "#dc2626" }}
                >
                  Annulation prévue
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">Aucun abonnement actif</p>
          )}
        </div>
      </div>
    </div>
  );
}
