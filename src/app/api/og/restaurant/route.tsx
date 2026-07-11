import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Restaurant";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 24,
          padding: 80,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 64,
            height: 4,
            background: "#e85d26",
            borderRadius: 2,
            marginBottom: 8,
          }}
        />
        {/* Restaurant name */}
        <div
          style={{
            fontSize: name.length > 30 ? 72 : 96,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          {name}
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.45)",
            fontWeight: 400,
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginTop: 8,
          }}
        >
          just-tag.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
