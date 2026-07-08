"use client";

import { useEffect, useRef, useState } from "react";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
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
    const out = document.createElement("canvas");
    out.width = 400; out.height = 500;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(0, 0, 400, 500, 20);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Just-Tag", 200, 48);
    ctx.fillStyle = "#e85d26";
    const justWidth = ctx.measureText("Just").width;
    ctx.fillText("-Tag", 200 + justWidth / 2 - 2, 48);
    ctx.drawImage(canvas, 60, 70, 280, 280);
    ctx.fillStyle = "#555";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText("Scannez pour recevoir toutes nos offres", 200, 390);
    ctx.fillText("par WhatsApp", 200, 412);
    ctx.fillStyle = "#e85d26";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.fillText(restaurantName, 200, 450);
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
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #0ea5e9, #38bdf8)" }}>
          <QrCode className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">QR Code WhatsApp</h1>
          <p className="text-[13px] text-gray-400">
            Imprimez ce QR code et posez-le sur vos tables. Vos clients s&apos;abonnent en un scan.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-12 text-center text-gray-400" style={{ border: "1.5px solid #eaecf0" }}>
          Chargement…
        </div>
      ) : !slug ? (
        <div className="rounded-2xl bg-white p-12 text-center text-red-500" style={{ border: "1.5px solid #fecaca" }}>
          Restaurant introuvable.
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* QR card */}
          <div className="rounded-2xl bg-white p-6 flex flex-col items-center gap-5" style={{ border: "1.5px solid #eaecf0", width: "fit-content", minWidth: 320 }}>
            <div className="rounded-2xl p-4 shadow-sm" style={{ background: "#fff", border: "1px solid #f0f0f0" }}>
              <canvas ref={canvasRef} />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">{restaurantName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">just-tag.app/fr/rejoindre/{slug}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleDownload}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>
              <button
                onClick={handlePrint}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                style={{ border: "1.5px solid #eaecf0" }}
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex-1 rounded-2xl bg-white p-6" style={{ border: "1.5px solid #eaecf0" }}>
            <h2 className="mb-5 font-bold text-gray-900">Comment l&apos;utiliser ?</h2>
            <div className="space-y-4">
              {[
                { n: 1, text: "Téléchargez ou imprimez le QR code.", color: "#e85d26" },
                { n: 2, text: "Posez-le sur vos tables, comptoir ou vitrine.", color: "#e85d26" },
                { n: 3, text: "Vos clients scannent et entrent leur numéro WhatsApp en quelques secondes.", color: "#e85d26" },
                { n: 4, text: "Ils reçoivent vos prochains plats du jour et offres directement sur WhatsApp.", color: "#25D366" },
              ].map(({ n, text, color }) => (
                <div key={n} className="flex gap-3 items-start">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white mt-0.5"
                    style={{ background: color }}
                  >
                    {n}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {/* Pro tip */}
            <div className="mt-6 rounded-xl p-4" style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", border: "1px solid #bae6fd" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#0ea5e9" }}>Conseil</p>
              <p className="text-sm text-blue-800">
                Plastifiez votre QR code pour une durée de vie maximale et posez-le à l&apos;entrée ou sur chaque table.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
