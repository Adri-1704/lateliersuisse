"use client";

import { useState } from "react";
import { CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Labels {
  firstName: string;
  firstNamePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  consent: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMessage: string;
  errorInvalid: string;
  errorServer: string;
}

interface OptinFormProps {
  restaurantId: string;
  restaurantName: string;
  labels: Labels;
}

export function OptinForm({ restaurantId, restaurantName, labels }: OptinFormProps) {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = phone.replace(/[^0-9+]/g, "");
    if (normalized.length < 10) {
      setError(labels.errorInvalid);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/whatsapp-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          phone: normalized,
          first_name: firstName.trim() || null,
          source: "qr",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || labels.errorServer);
        return;
      }

      setSuccess(true);
    } catch {
      setError(labels.errorServer);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    const waText = encodeURIComponent(`Bonjour, je m'abonne aux alertes de ${restaurantName} sur Just-Tag !`);
    const waLink = `https://wa.me/41782344010?text=${waText}`;

    return (
      <div className="text-center py-6 space-y-4">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{labels.successTitle}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{labels.successMessage}</p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1fba58] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Confirmer sur WhatsApp
        </a>
        <p className="text-xs text-gray-400">
          Envoyez le message pour activer la réception des alertes
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
          {labels.firstName}
        </Label>
        <Input
          id="firstName"
          type="text"
          placeholder={labels.firstNamePlaceholder}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          {labels.phone} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder={labels.phonePlaceholder}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#e85d26] cursor-pointer"
        />
        <Label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
          {labels.consent.replace("{restaurant}", restaurantName)}
        </Label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button
        type="submit"
        disabled={submitting || !consent}
        className="w-full bg-[#25D366] hover:bg-[#1fba58] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {labels.submitting}
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            {labels.submit}
          </>
        )}
      </Button>
    </form>
  );
}
