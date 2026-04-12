"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMerchant } from "@/actions/admin/merchants";

export function DeleteMerchantButton({ merchantId, merchantName }: { merchantId: string; merchantName: string }) {
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
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-sm text-red-700 flex-1">
          Supprimer <strong>{merchantName}</strong> ? Cette action est irréversible.
        </p>
        <Button size="sm" variant="outline" onClick={() => setConfirming(false)} disabled={loading}>
          Annuler
        </Button>
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}
        </Button>
      </div>
    );
  }

  return (
    <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="mr-2 h-4 w-4" />
      Supprimer ce compte
    </Button>
  );
}
