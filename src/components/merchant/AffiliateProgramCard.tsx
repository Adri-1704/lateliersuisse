"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Share2, Gift, Users } from "lucide-react";

interface AffiliateProgramCardProps {
  refCode: string | null;
  locale: string;
  baseUrl?: string;
}

const COMMISSION_PERCENT = 10;
const MONTHLY_PRICE = 29.95;

export function AffiliateProgramCard({
  refCode,
  locale,
  baseUrl,
}: AffiliateProgramCardProps) {
  const [copied, setCopied] = useState(false);

  if (!refCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[var(--color-just-tag)]" />
            Programme d&apos;affiliation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Votre code d&apos;affiliation est en cours de génération. Reconnectez-vous dans quelques instants.
          </p>
        </CardContent>
      </Card>
    );
  }

  const site = baseUrl || (typeof window !== "undefined" ? window.location.origin : "https://just-tag.app");
  const shareLink = `${site}/${locale}/pour-restaurateurs?ref=${refCode}`;

  const monthlyCommission = (MONTHLY_PRICE * COMMISSION_PERCENT) / 100;
  const annualCommission = monthlyCommission * 12;

  const whatsappMessage = encodeURIComponent(
    `Salut ! Je suis sur Just-Tag, un super annuaire pour les restaurateurs en Suisse romande. Si tu t'inscris avec mon lien, tu profites de l'offre Early Bird : ${shareLink}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="border-[var(--color-just-tag)]/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-[var(--color-just-tag)]" />
          Programme d&apos;affiliation
          <Badge variant="secondary" className="ml-2">
            {COMMISSION_PERCENT}% de commission
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Partagez Just-Tag avec d&apos;autres restaurateurs. Pour chaque inscription via votre lien,
          vous recevez <strong>{COMMISSION_PERCENT}% de commission</strong> pendant toute la 1<sup>re</sup> année.
        </p>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Votre code unique
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-base font-semibold text-[var(--color-just-tag)] bg-background border rounded px-3 py-2">
              {refCode}
            </code>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Votre lien de parrainage
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs text-foreground bg-background border rounded px-3 py-2 truncate">
              {shareLink}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            className="bg-[#25D366] hover:bg-[#1ebe5a] text-white"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Share2 className="h-4 w-4 mr-2" />
              Partager sur WhatsApp
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copié !" : "Copier le lien"}
          </Button>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              Vos gains : <strong className="text-foreground">~CHF {monthlyCommission.toFixed(2)}/mois</strong> par filleul actif
              (≈ CHF {annualCommission.toFixed(0)} sur l&apos;année)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Les commissions sont versées trimestriellement après vérification des paiements de vos filleuls.
            Aucun engagement, aucune limite de filleuls.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
