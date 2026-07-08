"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Unlink } from "lucide-react";
import { unlinkMerchantFromRestaurant } from "@/actions/admin/restaurants";

interface Props {
  restaurantId: string;
  merchantName: string;
}

export function UnlinkMerchantButton({ restaurantId, merchantName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlink() {
    const confirmed = window.confirm(
      `Voulez-vous vraiment délier "${merchantName}" de ce restaurant ?\n\nLe commerçant perdra l'accès à cette fiche. Cette action est réversible.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    const result = await unlinkMerchantFromRestaurant(restaurantId);
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div>
      <button
        onClick={handleUnlink}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Unlink className="h-3.5 w-3.5" />
        )}
        Délier ce commerçant
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
