"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveClaim, rejectClaim } from "@/actions/admin/claims";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
      <div>
        <label className="text-sm font-medium text-muted-foreground" htmlFor="admin-notes">
          Notes admin (obligatoire pour le rejet)
        </label>
        <Textarea
          id="admin-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Raison de la décision, observations..."
          rows={3}
          className="mt-1"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Approuver
        </Button>
        <Button
          onClick={handleReject}
          disabled={saving}
          variant="destructive"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Rejeter
        </Button>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
