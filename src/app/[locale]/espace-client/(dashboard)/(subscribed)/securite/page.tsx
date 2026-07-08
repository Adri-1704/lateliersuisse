"use client";

import { useState } from "react";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { changeMerchantPassword } from "@/actions/merchant/auth";

export default function SecurityPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (newPassword !== confirmPassword) { setError("Les deux mots de passe ne correspondent pas."); return; }
    if (newPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true);
    const result = await changeMerchantPassword(newPassword);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error);
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent";

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #64748b, #94a3b8)" }}>
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Sécurité</h1>
          <p className="text-[13px] text-gray-400">Gérez le mot de passe de votre compte.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
        <div className="mb-5">
          <h2 className="font-bold text-gray-900">Changer mon mot de passe</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">Choisissez un mot de passe d&apos;au moins 8 caractères.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <CheckCircle className="h-4 w-4" />
              Mot de passe mis à jour avec succès.
            </div>
          )}
          {error && (
            <div className="rounded-xl px-3 py-2.5 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className={inputClass}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px]" style={{ color: "#dc2626" }}>Les mots de passe ne correspondent pas</p>
            )}
            {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8 && (
              <p className="flex items-center gap-1 text-[11px]" style={{ color: "#16a34a" }}>
                <CheckCircle className="h-3 w-3" /> Mots de passe identiques
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #64748b, #94a3b8)" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Mettre à jour mon mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
