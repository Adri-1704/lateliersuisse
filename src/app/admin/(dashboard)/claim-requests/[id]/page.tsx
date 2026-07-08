import Link from "next/link";
import { getClaimRequest } from "@/actions/admin/claims";
import { ArrowLeft, Mail, Phone, Store, MapPin, Calendar } from "lucide-react";
import { ClaimActions } from "./ClaimActions";

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "En attente", bg: "#fffbeb", color: "#d97706" },
  approved: { label: "Approuvé", bg: "#f0fdf4", color: "#16a34a" },
  rejected: { label: "Rejeté", bg: "#fef2f2", color: "#dc2626" },
};

export default async function ClaimRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getClaimRequest(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Demande non trouvée</h1>
        <Link
          href="/admin/claim-requests"
          className="inline-flex items-center gap-2 rounded-xl border border-[#eaecf0] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const c = result.data;
  const status = statusConfig[c.status] || { label: c.status, bg: "#f3f4f6", color: "#374151" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/claim-requests"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eaecf0] bg-white text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">{c.restaurant_name}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Demande de claim par {c.merchant_name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Restaurant */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="font-bold text-gray-900 mb-4">Restaurant</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{c.restaurant_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{c.restaurant_city}</span>
            </div>
            {c.restaurant_slug && (
              <Link
                href={`/fr/restaurants/${c.restaurant_slug}`}
                className="text-sm text-indigo-600 hover:underline"
                target="_blank"
              >
                Voir la fiche restaurant →
              </Link>
            )}
          </div>
        </div>

        {/* Commerçant */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="font-bold text-gray-900 mb-4">Commerçant</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{c.merchant_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${c.merchant_email}`} className="text-indigo-600 hover:underline">
                {c.merchant_email}
              </a>
            </div>
            {c.merchant_phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${c.merchant_phone}`} className="text-indigo-600 hover:underline">
                  {c.merchant_phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Statut & métadonnées */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="font-bold text-gray-900 mb-4">Statut</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Statut actuel :</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                Soumis le{" "}
                {new Date(c.created_at).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {c.resolved_at && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">
                  Traité le{" "}
                  {new Date(c.resolved_at).toLocaleDateString("fr-CH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-gray-500">Méthode :</span>{" "}
              <span className="font-medium text-gray-900">{c.method}</span>
            </div>
            {c.admin_notes && (
              <div className="text-sm">
                <span className="text-gray-500">Notes admin :</span>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{c.admin_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {c.status === "pending" && (
          <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
            <h2 className="font-bold text-gray-900 mb-4">Actions</h2>
            <ClaimActions claimId={c.id} />
          </div>
        )}
      </div>
    </div>
  );
}
