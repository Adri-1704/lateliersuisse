"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateB2BRequestStatus } from "@/actions/admin/b2b-requests";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import type { B2BContactStatus } from "@/lib/supabase/types";

const statuses: { value: B2BContactStatus; label: string; color: string }[] = [
  { value: "new", label: "Nouveau", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacté", color: "bg-yellow-100 text-yellow-700" },
  { value: "converted", label: "Converti", color: "bg-green-100 text-green-700" },
  { value: "archived", label: "Archivé", color: "bg-gray-100 text-gray-700" },
];

export function B2BStatusChanger({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChange(newStatus: B2BContactStatus) {
    if (newStatus === currentStatus) return;
    setSaving(true);
    setMessage(null);
    const result = await updateB2BRequestStatus(id, newStatus);
    setSaving(false);
    if (result.success) {
      setMessage("Statut mis à jour");
      router.refresh();
    } else {
      setMessage(result.error || "Erreur");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Button
            key={s.value}
            variant={currentStatus === s.value ? "default" : "outline"}
            size="sm"
            disabled={saving}
            onClick={() => handleChange(s.value)}
            className={currentStatus === s.value ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {s.label}
          </Button>
        ))}
      </div>
      {saving && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Mise à jour...
        </div>
      )}
      {message && !saving && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-3 w-3" />
          {message}
        </div>
      )}
    </div>
  );
}
