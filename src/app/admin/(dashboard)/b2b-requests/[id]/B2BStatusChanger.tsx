"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateB2BRequestStatus } from "@/actions/admin/b2b-requests";
import { CheckCircle, Loader2 } from "lucide-react";
import type { B2BContactStatus } from "@/lib/supabase/types";

const statuses: {
  value: B2BContactStatus;
  label: string;
  activeBg: string;
  activeColor: string;
}[] = [
  { value: "new", label: "Nouveau", activeBg: "#eff6ff", activeColor: "#2563eb" },
  { value: "contacted", label: "Contacté", activeBg: "#fffbeb", activeColor: "#d97706" },
  { value: "converted", label: "Converti", activeBg: "#f0fdf4", activeColor: "#16a34a" },
  { value: "archived", label: "Archivé", activeBg: "#f3f4f6", activeColor: "#374151" },
];

export function B2BStatusChanger({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
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
        {statuses.map((s) => {
          const isActive = currentStatus === s.value;
          return (
            <button
              key={s.value}
              disabled={saving}
              onClick={() => handleChange(s.value)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={
                isActive
                  ? { background: s.activeBg, color: s.activeColor, borderColor: s.activeColor + "40" }
                  : { background: "white", color: "#374151", borderColor: "#eaecf0" }
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {saving && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Mise à jour...
        </div>
      )}
      {message && !saving && (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-3 w-3" />
          {message}
        </div>
      )}
    </div>
  );
}
