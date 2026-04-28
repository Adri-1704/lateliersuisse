"use client";

import { useState } from "react";
import { MessageCircle, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppSubscribeProps {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

export function WhatsAppSubscribe({ restaurantId, restaurantName, restaurantSlug }: WhatsAppSubscribeProps) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showQR, setShowQR] = useState(false);
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !consent) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/whatsapp-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, phone: phone.trim(), source: "website" }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  // QR code URL using Google Charts API (free, no dependency)
  const qrData = `https://just-tag.app/wa/${restaurantSlug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  if (status === "success") {
    return (
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-semibold text-green-800">Inscrit !</p>
        <p className="mt-1 text-sm text-green-600">
          Vous recevrez les actualités de {restaurantName} par WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Actus du restaurant par WhatsApp</h3>
          <p className="text-xs text-gray-500">Plats du jour, offres et nouveautés</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+41 79 123 45 67"
            className="w-full rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30"
          />
        </div>

        {/* Consent */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            J&apos;accepte de recevoir les actualités de {restaurantName} par WhatsApp (plats du jour, offres). Désabonnement possible à tout moment.
          </span>
        </label>

        <Button
          type="submit"
          disabled={!phone.trim() || !consent || status === "loading"}
          className="w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
        >
          {status === "loading" ? "Inscription..." : "S'abonner"}
        </Button>

        {status === "error" && (
          <p className="text-xs text-red-500 text-center">Une erreur est survenue. Réessayez.</p>
        )}
      </form>

      {/* QR Code toggle */}
      <div className="mt-4 border-t border-green-200 pt-3">
        <button
          type="button"
          onClick={() => setShowQR(!showQR)}
          className="flex w-full items-center justify-center gap-2 text-xs font-medium text-green-700 hover:text-green-800"
        >
          <QrCode className="h-4 w-4" />
          {showQR ? "Masquer le QR code" : "Afficher le QR code pour vos clients"}
        </button>

        {showQR && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <img
              src={qrUrl}
              alt={`QR code pour s'abonner aux plats du jour de ${restaurantName}`}
              width={160}
              height={160}
              className="rounded-lg border border-green-200"
            />
            <p className="text-xs text-gray-500 text-center max-w-[200px]">
              Scannez pour recevoir les plats du jour par WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
