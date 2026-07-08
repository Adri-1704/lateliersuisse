"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveClaim, rejectClaim } from "@/actions/admin/claims";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function ClaimActions({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleApprove() {
    setSaving(true);
    setMessage(null);
    const result = await approveClaim(claimId, notes || undefined);
    setSaving(false);
    if (result.success) {
      setMessage({ text: "Claim approuvé avec succès !", type: "success" });
      router.refresh();
    } else {
      setMessage({ text: result.error || "Erreur", type: "error" });
    }
  }

  async function handleReject() {
    if (!notes.trim()) {
      setMessage({ text: "Veuillez saisir une raison de rejet", type: "error" });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await rejectClaim(claimId, notes);
    setSaving(false);
    if (result.success) {
      setMessage({ text: "Claim rejeté", type: "success" });
      router.refresh();
    } else {
      setMessage({ text: result.error || "Erreur", type: "error" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="admin-notes" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Notes admin (obligatoire pour le rejet)
        </label>
        <textarea
          id="admin-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Raison de la décision, observations..."
          rows={3}
          className="w-full rounded-xl border border-[#eaecf0] bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApprove}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Approuver
        </button>
        <button
          onClick={handleReject}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Rejeter
        </button>
      </div>

      {message && (
        <p
          className="text-sm font-medium"
          style={{ color: message.type === "success" ? "#16a34a" : "#dc2626" }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
