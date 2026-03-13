"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle, Facebook, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "text-green-600 hover:bg-green-50",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "text-blue-600 hover:bg-blue-50",
    },
  ];

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
            >
              <Share2 className="h-4 w-4 text-gray-600" />
              Partager
            </button>
          )}
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${link.color}`}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </a>
          ))}
          <button
            onClick={handleCopy}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copie !</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 text-gray-600" />
                Copier le lien
              </>
            )}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
