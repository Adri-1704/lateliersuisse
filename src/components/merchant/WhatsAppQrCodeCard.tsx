"use client";

import { QrCode, Printer, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WhatsAppQrCodeCardProps {
  slug: string;
  restaurantName: string;
}

export function WhatsAppQrCodeCard({ slug, restaurantName }: WhatsAppQrCodeCardProps) {
  const targetUrl = `https://just-tag.app/wa/${slug}`;
  const qrDisplay = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(targetUrl)}`;
  const qrPrint = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=20&data=${encodeURIComponent(targetUrl)}`;
  const qrDownload = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=20&format=png&download=1&data=${encodeURIComponent(targetUrl)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-[var(--color-just-tag)]" />
          QR code WhatsApp pour vos clients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDisplay}
              alt={`QR code pour s'abonner aux actus WhatsApp de ${restaurantName}`}
              width={300}
              height={300}
              className="rounded-lg border bg-white p-2"
            />
            <p className="text-center text-xs text-gray-500">
              Redirige vers la fiche de {restaurantName}
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="space-y-3 text-sm text-gray-700">
              <p className="font-medium">Comment l&apos;utiliser&nbsp;?</p>
              <ol className="list-decimal space-y-1 pl-5 text-gray-600">
                <li>Téléchargez ou imprimez ce QR code</li>
                <li>Affichez-le dans votre restaurant&nbsp;: cavaliers de table, menu, ticket de caisse, porte d&apos;entrée</li>
                <li>Vos clients scannent avec leur téléphone et s&apos;abonnent à vos actus WhatsApp en 1 clic</li>
                <li>Vous leur envoyez vos plats du jour, offres et événements</li>
              </ol>
              <p className="rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-800">
                <strong>Avantage&nbsp;:</strong> 98% de taux d&apos;ouverture WhatsApp vs ~20% pour l&apos;email. Construisez votre propre base fidélisée, sans dépendre de Meta ni de Google.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="gap-2">
                <a href={qrDownload} download={`qr-code-${slug}.png`}>
                  <Download className="h-4 w-4" />
                  Télécharger PNG
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href={qrPrint} target="_blank" rel="noopener noreferrer">
                  <Printer className="h-4 w-4" />
                  Version impression
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
