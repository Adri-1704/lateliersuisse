"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
      `Voulez-vous vraiment délier "${merchantName}" de ce restaurant ?\n\nLe commerçant perdra l'accès à cette fiche. Cette action est réversible (le commerçant pourra refaire une demande).`
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
      <Button
        variant="destructive"
        size="sm"
        onClick={handleUnlink}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Unlink className="mr-2 h-4 w-4" />
        )}
        Délier ce commerçant
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
