"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const baseUrl =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://just-tag.app";

interface Props {
  publicUrl: string;
  title: string;
}

/**
 * Affiche un QR code pointant vers la fiche du restaurant (avec UTM).
 * Zero coût : utilise l'API publique gratuite api.qrserver.com pour generer
 * l'image PNG cote serveur distant. Pas de dependance npm ajoutee.
 * Le merchant peut imprimer ce QR pour le mettre sur ses tables.
 */
export function HappyHourQrCode({ publicUrl, title }: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = publicUrl.startsWith("http") ? publicUrl : `${baseUrl}${publicUrl}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(fullUrl)}`;
  const qrLargeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=20&data=${encodeURIComponent(fullUrl)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencieux
    }
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <QrCode className="h-5 w-5 text-rose-500" />
        <h3 className="font-semibold text-gray-900">QR Code pour vos tables</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Imprimez ce QR et posez-le sur vos tables : les clients scannent et
        arrivent directement sur votre fiche avec l&apos;offre en avant.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="rounded-lg border bg-white p-3">
          <Image
            src={qrUrl}
            alt={`QR code pour ${title}`}
            width={200}
            height={200}
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="break-all rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {fullUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={qrLargeUrl} download={`happy-hour-${title.replace(/\s+/g, "-").toLowerCase()}.png`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Telecharger HD
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copie" : "Copier le lien"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
