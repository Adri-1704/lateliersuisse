"use client";

import { useState } from "react";
import { updateAdminPassword } from "@/actions/admin/auth";
import { CheckCircle, Loader2, Settings } from "lucide-react";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const inputClass =
    "w-full rounded-xl border border-[#eaecf0] bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await updateAdminPassword(password);
    setSaving(false);
    if (result.success) {
      setMessage({ type: "success", text: "Mot de passe mis à jour avec succès." });
      setPassword("");
      setConfirm("");
    } else {
      setMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour." });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Settings className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Paramètres</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Configuration du compte admin</p>
        </div>
      </div>

      {/* Password card */}
      <div className="max-w-md rounded-2xl border border-[#eaecf0] bg-white p-6">
        <h2 className="font-bold text-gray-900 mb-1">Changer le mot de passe</h2>
        <p className="text-[13px] text-gray-400 mb-5">Minimum 6 caractères.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </button>

          {message && (
            <div
              className={`flex items-center gap-2 text-sm ${
                message.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {message.type === "success" && <CheckCircle className="h-3.5 w-3.5" />}
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
