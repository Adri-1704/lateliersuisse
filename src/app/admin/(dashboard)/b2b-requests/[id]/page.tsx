import Link from "next/link";
import { getB2BRequest } from "@/actions/admin/b2b-requests";
import { ArrowLeft, Mail, Phone, Store, MapPin, Calendar, MessageSquare } from "lucide-react";
import { B2BStatusChanger } from "./B2BStatusChanger";

export default async function B2BRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getB2BRequest(id);

  if (!result.success || !result.data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Demande non trouvée</h1>
        <Link
          href="/admin/b2b-requests"
          className="inline-flex items-center gap-2 rounded-xl border border-[#eaecf0] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const r = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/b2b-requests"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eaecf0] bg-white text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">{r.restaurant_name}</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {r.first_name || r.last_name
              ? `${r.first_name || ""} ${r.last_name || ""}`.trim()
              : ""}
            {r.city ? ` — ${r.city}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="font-bold text-gray-900 mb-4">Contact</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${r.email}`} className="text-indigo-600 hover:underline">{r.email}</a>
            </div>
            {r.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href={`tel:${r.phone}`} className="text-indigo-600 hover:underline">{r.phone}</a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Store className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{r.restaurant_name}</span>
            </div>
            {r.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{r.city}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                Reçu le{" "}
                {new Date(r.created_at).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6">
          <h2 className="font-bold text-gray-900 mb-4">Statut</h2>
          <B2BStatusChanger id={r.id} currentStatus={r.status} />
        </div>

        {/* Message */}
        <div className="rounded-2xl border border-[#eaecf0] bg-white p-6 md:col-span-2">
          <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            Message
          </h2>
          {r.message ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{r.message}</p>
          ) : (
            <p className="text-sm italic text-gray-400">Aucun message</p>
          )}
        </div>
      </div>
    </div>
  );
}
