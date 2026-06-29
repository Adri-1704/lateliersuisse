"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, ImagePlus, Send, Users, X, CheckCircle2, Clock, Loader2, ArrowUpCircle, Trash2 } from "lucide-react";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import { getMerchantSession } from "@/actions/merchant/auth";
import { broadcastWhatsApp, getBroadcastHistory, getWhatsAppSubscriberCount, getWhatsAppPlanTier, getSubscribers, deleteSubscriber, getMonthlyBroadcastUsage } from "@/actions/merchant/whatsapp-broadcast";

interface Broadcast {
  id: string;
  message: string;
  image_url: string | null;
  sent_count: number;
  created_at: string;
}

interface Subscriber {
  id: string;
  phone: string;
  first_name: string | null;
  subscribed_at: string;
  is_active: boolean;
  source: string | null;
}

const MAX_CHARS = 1024;

export default function WhatsAppPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [planTier, setPlanTier] = useState<50 | 100 | 200 | null>(null);
  const [quotaUsed, setQuotaUsed] = useState<number>(0);
  const [quotaMax] = useState<number>(4);
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [restResult, session] = await Promise.all([
          getMerchantRestaurant(),
          getMerchantSession(),
        ]);
        if (restResult.success && restResult.data) {
          const id = restResult.data.id;
          setRestaurantId(id);
          const [count, hist, tier, subs, usage] = await Promise.all([
            getWhatsAppSubscriberCount(id),
            getBroadcastHistory(id),
            session?.merchant?.id ? getWhatsAppPlanTier(session.merchant.id) : Promise.resolve(null),
            getSubscribers(id),
            getMonthlyBroadcastUsage(id),
          ]);
          setSubscriberCount(count);
          setHistory(hist);
          setPlanTier(tier);
          setSubscribers(subs);
          setQuotaUsed(usage);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDeleteSubscriber(id: string) {
    setDeletingId(id);
    const res = await deleteSubscriber(id);
    if (res.success) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setSubscriberCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
    }
    setDeletingId(null);
  }

  async function handleSend() {
    if (!message.trim() || !restaurantId) return;
    setSending(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append("message", message);
    if (image) fd.append("image", image);

    const res = await broadcastWhatsApp(fd);

    if (res.success) {
      setResult({ sent: res.sent });
      if (res.quotaUsed !== undefined) setQuotaUsed(res.quotaUsed);
      setMessage("");
      removeImage();
      const hist = await getBroadcastHistory(restaurantId);
      setHistory(hist);
    } else {
      setError(res.error);
      if (res.quotaUsed !== undefined) setQuotaUsed(res.quotaUsed);
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
          WhatsApp
        </h1>
        <p className="text-muted-foreground">
          Envoyez votre plat du jour ou une offre directement dans le WhatsApp de vos abonnés
        </p>
      </div>

      {/* Subscriber count */}
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <Users className="h-5 w-5 text-green-600" />
        <div>
          <span className="font-semibold text-green-800">
            {subscriberCount ?? "—"} abonné{subscriberCount !== 1 ? "s" : ""}
          </span>
          <span className="ml-1 text-sm text-green-700">recevront votre message</span>
        </div>
        {subscriberCount === 0 && (
          <span className="ml-auto text-xs text-green-600">
            Vos clients s&apos;abonnent en scannant votre QR code
          </span>
        )}
      </div>

      {/* Quota mensuel */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        quotaUsed >= quotaMax
          ? "border-red-200 bg-red-50"
          : quotaUsed >= quotaMax - 2
          ? "border-orange-200 bg-orange-50"
          : "border-gray-200 bg-gray-50"
      }`}>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              quotaUsed >= quotaMax ? "text-red-700" : quotaUsed >= quotaMax - 2 ? "text-orange-700" : "text-gray-700"
            }`}>
              {quotaUsed >= quotaMax
                ? "Quota mensuel atteint — renouvellement le 1er du mois"
                : `${quotaUsed} / ${quotaMax} envois ce mois${planTier ? ` · jusqu'à ${planTier * 4} messages` : ""}`}
            </span>
            <span className="text-xs text-gray-500">{quotaMax - quotaUsed} restant{quotaMax - quotaUsed > 1 ? "s" : ""}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaUsed >= quotaMax ? "bg-red-500" : quotaUsed >= quotaMax - 2 ? "bg-orange-400" : "bg-[#25D366]"
              }`}
              style={{ width: `${Math.min(100, (quotaUsed / quotaMax) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upsell banner — shown when subscriber count exceeds plan tier */}
      {planTier !== null && subscriberCount !== null && subscriberCount > planTier && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <ArrowUpCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold text-orange-800">
              Vous avez {subscriberCount} abonnés — votre plan est limité à {planTier}
            </p>
            <p className="mt-0.5 text-sm text-orange-700">
              {subscriberCount - planTier} abonné{subscriberCount - planTier > 1 ? "s" : ""} ne recevront pas vos messages.
              Passez au plan {planTier === 50 ? "100" : "200"} abonnés pour les inclure.
            </p>
          </div>
          <a
            href="../abonnement"
            className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Mettre à jour
          </a>
        </div>
      )}

      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouveau message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Aperçu"
                className="h-32 w-32 rounded-lg object-cover border border-gray-200"
              />
              <button
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Textarea */}
          <div className="space-y-1">
            <Textarea
              placeholder="Plat du jour : Entrecôte sauce béarnaise CHF 28, frites maison. À midi seulement !"
              rows={4}
              maxLength={MAX_CHARS}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">
              {message.length}/{MAX_CHARS}
            </p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {result && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Message envoyé à <strong>{result.sent}</strong> abonné{result.sent !== 1 ? "s" : ""}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {image ? "Changer la photo" : "Ajouter une photo"}
            </Button>

            <Button
              className="ml-auto bg-[#25D366] hover:bg-[#1ebe59] text-white"
              disabled={!message.trim() || sending || quotaUsed >= quotaMax}
              onClick={handleSend}
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sending ? "Envoi…" : quotaUsed >= quotaMax ? "Quota atteint" : `Envoyer à ${subscriberCount ?? "…"} abonné${(subscriberCount ?? 0) > 1 ? "s" : ""}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Abonnés ({subscribers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucun abonné pour l&apos;instant
            </p>
          ) : (
            <div className="divide-y">
              {subscribers.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {sub.first_name && <span className="mr-1">{sub.first_name}</span>}
                      <span className="font-mono text-gray-500">{sub.phone}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Abonné le {new Date(sub.subscribed_at).toLocaleDateString("fr-CH", { day: "numeric", month: "short", year: "numeric" })}
                      {sub.source && sub.source !== "website" && (
                        <span className="ml-1 text-gray-400">· {sub.source}</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={deletingId === sub.id}
                    onClick={() => handleDeleteSubscriber(sub.id)}
                  >
                    {deletingId === sub.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />
                    }
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Messages récents
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {history.map((item) => (
              <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-gray-800">{item.message}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{new Date(item.created_at).toLocaleDateString("fr-CH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-green-600 font-medium">✓ {item.sent_count} envoyés</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
