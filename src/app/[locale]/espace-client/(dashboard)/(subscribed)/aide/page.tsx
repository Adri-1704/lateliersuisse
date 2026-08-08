"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LifeBuoy, MessageCircle, Mail, Video, ExternalLink } from "lucide-react";
import { getMerchantSession } from "@/actions/merchant/auth";

// Numéro direct du fondateur (déjà affiché publiquement sur /contact) — pas
// le numéro WhatsApp Business utilisé pour les alertes clients des
// restaurants (celui-là reste sur src/app/[locale]/rejoindre/[slug]).
const SUPPORT_WHATSAPP = "41794517496";
const SUPPORT_EMAIL = "contact@just-tag.app";

export default function AidePage() {
  const params = useParams();
  const locale = params.locale as string;
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    getMerchantSession().then((session) => {
      if (session?.restaurant?.name_fr) setRestaurantName(session.restaurant.name_fr);
    });
  }, []);

  const context = restaurantName ? ` pour "${restaurantName}"` : "";
  const whatsappMessage = encodeURIComponent(`Bonjour, j'ai besoin d'aide${context} sur Just-Tag.`);
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${whatsappMessage}`;
  const emailSubject = encodeURIComponent(restaurantName ? `Besoin d'aide — ${restaurantName}` : "Besoin d'aide");
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${emailSubject}`;

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #22c55e, #4ade80)" }}>
          <LifeBuoy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Besoin d&apos;aide ?</h1>
          <p className="text-[13px] text-gray-400">On vous répond directement, sans robot.</p>
        </div>
      </div>

      {/* WhatsApp direct */}
      <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" style={{ color: "#25D366" }} />
          <h2 className="font-bold text-gray-900">Écrivez-nous sur WhatsApp</h2>
        </div>
        <p className="mb-4 text-[13px] text-gray-500">
          Le plus rapide. Décrivez votre souci, on vous répond en général dans la journée.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "#25D366" }}
        >
          <MessageCircle className="h-4 w-4" />
          Nous écrire sur WhatsApp
        </a>
      </div>

      {/* Email fallback */}
      <div className="rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <h2 className="font-bold text-gray-900">Par email</h2>
        </div>
        <p className="mb-4 text-[13px] text-gray-500">
          Pour une question moins urgente, ou si vous préférez écrire.
        </p>
        <a
          href={mailtoUrl}
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
          style={{ border: "1.5px solid #eaecf0" }}
        >
          <Mail className="h-4 w-4" />
          {SUPPORT_EMAIL}
        </a>
      </div>

      {/* Self-help */}
      <div className="rounded-2xl p-6" style={{ background: "#fff3ee", border: "1.5px solid #ffe4d6" }}>
        <div className="mb-2 flex items-center gap-2">
          <Video className="h-4 w-4" style={{ color: "#e85d26" }} />
          <h2 className="font-bold text-gray-900">Envie de vous débrouiller seul·e ?</h2>
        </div>
        <p className="mb-4 text-[13px] text-gray-500">
          Les tutoriels vidéo couvrent la prise en main de Just-Tag pas à pas.
        </p>
        <Link
          href={`/${locale}/espace-client/videos`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "#e85d26" }}
        >
          Voir les tutoriels
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
