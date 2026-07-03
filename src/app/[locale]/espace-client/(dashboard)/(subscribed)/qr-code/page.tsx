"use client";

import { useEffect, useRef, useState } from "react";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, QrCode } from "lucide-react";
import QRCode from "qrcode";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://just-tag.app";

export default function QRCodePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getMerchantRestaurant();
      if (result.success && result.data) {
        setSlug(result.data.slug);
        setRestaurantName(result.data.name_fr || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!slug || !canvasRef.current) return;
    const url = `${SITE_URL}/fr/rejoindre/${slug}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });
  }, [slug]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Crée un canvas plus grand avec le nom du restaurant + branding
    const out = document.createElement("canvas");
    out.width = 400;
    out.height = 500;
    const ctx = out.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.roundRect(0, 0, 400, 500, 20);
    ctx.fill();

    // Titre
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Just-Tag", 200, 48);

    // "-Tag" en orange
    ctx.fillStyle = "#e85d26";
    const justWidth = ctx.measureText("Just").width;
    ctx.fillText("-Tag", 200 + justWidth / 2 - 2, 48);

    // QR code centré
    ctx.drawImage(canvas, 60, 70, 280, 280);

    // Texte sous le QR
    ctx.fillStyle = "#555";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Scannez pour recevoir toutes nos offres", 200, 390);
    ctx.fillText("par WhatsApp", 200, 412);

    // Nom du restaurant
    ctx.fillStyle = "#e85d26";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(restaurantName, 200, 450);

    // URL
    ctx.fillStyle = "#bbb";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText(`just-tag.app/fr/rejoindre/${slug}`, 200, 478);

    const link = document.createElement("a");
    link.download = `qr-code-${slug}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  }

  function handlePrint() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank")!;
    win.document.write(`
      <html><head><title>QR Code — ${restaurantName}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; }
        img { width: 280px; height: 280px; }
        h2 { font-size: 20px; margin: 12px 0 4px; color: #1a1a1a; }
        p { font-size: 13px; color: #555; margin: 4px 0; text-align: center; }
        .orange { color: #e85d26; font-weight: 600; }
      </style></head>
      <body>
        <img src="${dataUrl}">
        <h2>${restaurantName}</h2>
        <p>Scannez pour recevoir toutes nos offres par WhatsApp</p>
        <p class="orange">just-tag.app/fr/rejoindre/${slug}</p>
        <script>window.onload = () => { window.print(); }<\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-[#e85d26]" />
          QR Code WhatsApp
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Imprimez ce QR code et posez-le sur vos tables. Vos clients s&apos;abonnent à vos offres en un scan.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Chargement…</div>
      ) : !slug ? (
        <div className="text-red-500 text-sm">Restaurant introuvable.</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-5 pt-6 pb-6">
              <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                <canvas ref={canvasRef} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{restaurantName}</p>
                <p className="text-xs text-gray-400 mt-1">just-tag.app/fr/rejoindre/{slug}</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button onClick={handleDownload} className="flex-1 gap-2 bg-[#e85d26] hover:bg-[#d04e1e] text-white">
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
                <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2">
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base">Comment l&apos;utiliser ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e85d26] text-white text-xs flex items-center justify-center font-bold">1</span>
                <p>Téléchargez ou imprimez le QR code.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e85d26] text-white text-xs flex items-center justify-center font-bold">2</span>
                <p>Posez-le sur vos tables, comptoir ou vitrine.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e85d26] text-white text-xs flex items-center justify-center font-bold">3</span>
                <p>Vos clients scannent et entrent leur numéro WhatsApp en quelques secondes.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center font-bold">4</span>
                <p>Ils reçoivent vos prochains plats du jour et offres directement sur WhatsApp.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
