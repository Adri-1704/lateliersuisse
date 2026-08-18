import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // /pitch et /application servaient exactement la même page (argumentaire
  // restaurateur en images). Contenu dupliqué pour les moteurs, et deux
  // fichiers à maintenir en double : /application devient l'URL canonique
  // (c'est elle qui est liée dans le footer) et /pitch redirige en 301, ce
  // qui préserve les liens /pitch déjà partagés à des prospects (#40).
  async redirects() {
    return [
      {
        source: "/:locale(fr|de|en|es|pt)/pitch",
        destination: "/:locale/application",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "odbkdijcmwqdxctukjmh.supabase.co",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
