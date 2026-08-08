import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Même logo que src/app/icon.svg (favicon) et src/components/ui/logo.tsx
// (back-office, site public) — une assiette (restaurant) avec un badge de
// notification vert (message WhatsApp). Redessiné en divs car ImageResponse
// (Satori) ne supporte pas d'injecter du SVG arbitraire.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#ff3c48",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Assiette */}
        <div
          style={{
            position: "absolute",
            left: 42,
            top: 66,
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "11px solid #ffffff",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 71,
            top: 95,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "8px solid #ffffff",
            display: "flex",
          }}
        />
        {/* Badge message */}
        <div
          style={{
            position: "absolute",
            left: 111,
            top: 12,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#25d366",
            border: "8px solid #ff3c48",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: 180, height: 180 }
  );
}
