"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMerchant } from "@/actions/admin/merchants";

export function DeleteMerchantButton({
  merchantId,
  merchantName,
}: {
  merchantId: string;
  merchantName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteMerchant(merchantId);
    if (result.success) {
      router.push("/admin/merchants");
    } else {
      alert(result.error || "Erreur");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <p className="flex-1 text-sm text-red-700">
          Supprimer <strong>{merchantName}</strong> ? Action irréversible.
        </p>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Confirmer
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
    >
      <Trash2 className="h-4 w-4" />
      Supprimer ce compte
    </button>
  );
}
