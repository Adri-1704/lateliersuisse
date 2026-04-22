"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { trackHappyHourClick } from "@/actions/happy-hours";

interface Props {
  happyHourId: string;
  restaurantName: string;
  restaurantSlug: string;
  title: string;
  startsAt: string;
  locale: string;
  compact?: boolean;
}

const baseUrl =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://just-tag.app";

function formatHour(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(
      locale === "de" ? "de-CH" : locale === "en" ? "en-GB" : "fr-CH",
      { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" },
    ).format(new Date(iso));
  } catch {
    return "";
  }
}

export function HappyHourShareButton({
  happyHourId,
  restaurantName,
  restaurantSlug,
  title,
  startsAt,
  locale,
  compact = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  const link = `${baseUrl}/${locale}/restaurants/${restaurantSlug}?utm_source=whatsapp&utm_medium=share&utm_campaign=happy_hours&hh=${happyHourId}`;
  const hourLabel = formatHour(startsAt, locale);

  const message =
    locale === "en"
      ? `Happy Hour ${restaurantName} ${hourLabel ? `at ${hourLabel}` : ""}: ${title}. Info: ${link}`
      : locale === "de"
        ? `Happy Hour ${restaurantName} ${hourLabel ? `um ${hourLabel}` : ""}: ${title}. Infos: ${link}`
        : `Happy Hour ${restaurantName} ${hourLabel ? `a ${hourLabel}` : ""} : ${title}. Infos : ${link}`;

  const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function handleWhatsAppClick() {
    try {
      await trackHappyHourClick(happyHourId);
    } catch {
      // no-op
    }
    window.open(waLink, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback : select + execCommand — ignore
    }
  }

  const shareLabel = locale === "en" ? "Share" : locale === "de" ? "Teilen" : "Partager";
  const copyLabel =
    locale === "en" ? (copied ? "Copied" : "Copy link") : locale === "de" ? (copied ? "Kopiert" : "Link kopieren") : copied ? "Copie" : "Copier le lien";

  if (compact) {
    return (
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600"
        >
          <Share2 className="h-3.5 w-3.5" />
          {shareLabel}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          aria-label={copyLabel}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
      >
        <Share2 className="h-4 w-4" />
        {shareLabel} WhatsApp
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        {copyLabel}
      </button>
    </div>
  );
}
