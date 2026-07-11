"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, ImagePlus, Send, Users, X, CheckCircle2, Clock, Loader2, ArrowUpCircle, Trash2, Square, CheckSquare, FileText } from "lucide-react";
import { getMerchantRestaurant, updateRestaurantPhone } from "@/actions/merchant/restaurant";
import { getMerchantSession } from "@/actions/merchant/auth";
import { broadcastWhatsApp, getBroadcastHistory, getWhatsAppSubscriberCount, getWhatsAppPlanTier, getSubscribers, deleteSubscriber, getMonthlyBroadcastUsage } from "@/actions/merchant/whatsapp-broadcast";

interface Broadcast {
  id: string;
  message: string;
  image_url: string | null;
  sent_count: number;
  delivered_count: number;
  read_count: number;
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
  const [quotaMax, setQuotaMax] = useState<number>(30);
  const [reservationPhone, setReservationPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>("Restaurant");
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuPdfUrl, setMenuPdfUrl] = useState<string | null>(null);
  const [includeMenuPdf, setIncludeMenuPdf] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [restResult, session] = await Promise.all([getMerchantRestaurant(), getMerchantSession()]);
        if (restResult.success && restResult.data) {
          const id = restResult.data.id;
          setRestaurantId(id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setMenuPdfUrl((restResult.data as any).menu_pdf_url ?? null);
          const phone = restResult.data.phone ?? null;
          setReservationPhone(phone);
          setPhoneInput(phone ?? "");
          setRestaurantName(restResult.data.name_fr || "Restaurant");
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
          setSelectedIds(new Set(subs.filter((s) => s.is_active).map((s) => s.id)));
          setQuotaUsed(usage);
          setQuotaMax((tier ?? 50) * 4);
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
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setSubscriberCount((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
    }
    setDeletingId(null);
  }

  function toggleSubscriber(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const activeIds = subscribers.filter((s) => s.is_active).map((s) => s.id);
    if (selectedIds.size === activeIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeIds));
    }
  }

  async function handleSavePhone() {
    setSavingPhone(true);
    const res = await updateRestaurantPhone(phoneInput);
    if (res.success) {
      setReservationPhone(phoneInput.trim() || null);
      setPhoneSaved(true);
      setTimeout(() => setPhoneSaved(false), 2500);
    }
    setSavingPhone(false);
  }

  async function handleSend() {
    if (!message.trim() || !restaurantId) return;
    setSending(true);
    setError(null);
    setResult(null);
    const fd = new FormData();
    const finalMessage = (includeMenuPdf && menuPdfUrl)
      ? `${message}\n\n📋 Notre carte : ${menuPdfUrl}`
      : message;
    fd.append("message", finalMessage);
    if (includeMenuPdf) {
      fd.append("includePdf", "true");
    } else if (image) {
      fd.append("image", image);
    }
    const activeCount = subscribers.filter((s) => s.is_active).length;
    // Only send selectedIds if it's a partial selection
    if (selectedIds.size < activeCount) {
      fd.append("selectedIds", JSON.stringify([...selectedIds]));
    }
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
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#25D366" }} />
      </div>
    );
  }

  const quotaColor = quotaUsed >= quotaMax ? "#dc2626" : quotaUsed >= quotaMax - 2 ? "#f97316" : "#25D366";

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">WhatsApp</h1>
          <p className="text-[13px] text-gray-400">Envoyez votre plat du jour ou une offre directement dans le WhatsApp de vos abonnés</p>
        </div>
      </div>

      {/* Subscriber count + quota */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-4" style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1.5px solid #25D36630" }}>
          <Users className="h-5 w-5" style={{ color: "#25D366" }} />
          <div>
            <p className="text-2xl font-black" style={{ color: "#0f1117" }}>{subscriberCount ?? "—"}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#25D366" }}>
              Abonné{subscriberCount !== 1 ? "s" : ""} · recevront votre message
            </p>
          </div>
          {subscriberCount === 0 && (
            <p className="ml-auto text-[11px] text-green-600">Vos clients s&apos;abonnent via QR code</p>
          )}
        </div>

        <div className="rounded-2xl px-4 py-4" style={{
          background: quotaUsed >= quotaMax ? "#fef2f2" : quotaUsed >= quotaMax - 2 ? "#fff7ed" : "#f8fafc",
          border: `1.5px solid ${quotaColor}30`,
        }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: quotaUsed >= quotaMax ? "#dc2626" : quotaUsed >= quotaMax - 2 ? "#ea580c" : "#374151" }}>
              {quotaUsed >= quotaMax
                ? "Quota mensuel atteint"
                : `${quotaUsed} / ${quotaMax} messages ce mois`}
            </p>
            <span className="text-[11px] font-bold" style={{ color: quotaColor }}>
              {quotaMax - quotaUsed} restant{quotaMax - quotaUsed > 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#e5e7eb" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (quotaUsed / quotaMax) * 100)}%`, background: quotaColor }}
            />
          </div>
          {quotaUsed >= quotaMax && (
            <p className="mt-1 text-[11px]" style={{ color: "#dc2626" }}>Renouvellement le 1er du mois</p>
          )}
        </div>
      </div>

      {/* Upsell */}
      {planTier !== null && subscriberCount !== null && subscriberCount > planTier && (
        <div className="flex items-start gap-3 rounded-2xl px-4 py-4" style={{ background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
          <ArrowUpCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#f97316" }} />
          <div className="flex-1">
            <p className="font-bold text-orange-900">
              Vous avez {subscriberCount} abonnés — votre plan est limité à {planTier}
            </p>
            <p className="mt-0.5 text-sm text-orange-700">
              {subscriberCount - planTier} abonné{subscriberCount - planTier > 1 ? "s" : ""} ne recevront pas vos messages. Passez au plan {planTier === 50 ? "100" : "200"} pour les inclure.
            </p>
          </div>
          <a href="../abonnement" className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "#f97316" }}>
            Mettre à jour
          </a>
        </div>
      )}

      {/* Compose + Preview */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">

        {/* Compose form */}
        <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
            <h2 className="font-bold text-gray-900">Nouveau message</h2>
          </div>
          <div className="p-5 space-y-4">

            {/* Photo preview (message normal uniquement) */}
            {!includeMenuPdf && imagePreview && (
              <div className="relative w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Aperçu" className="h-32 w-32 rounded-xl object-cover" style={{ border: "1px solid #eaecf0" }} />
                <button onClick={removeImage} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Textarea */}
            <div className="space-y-1">
              <textarea
                placeholder="Plat du jour : Entrecôte sauce béarnaise CHF 28, frites maison. À midi seulement !"
                rows={4}
                maxLength={MAX_CHARS}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              />
              <p className="text-right text-[11px] text-gray-400">{message.length}/{MAX_CHARS}</p>
            </div>

            {/* PDF menu toggle */}
            {menuPdfUrl && (
              <button
                type="button"
                onClick={() => setIncludeMenuPdf((v) => !v)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                style={{
                  background: includeMenuPdf ? "#f5f3ff" : "#f8fafc",
                  border: `1px solid ${includeMenuPdf ? "#8b5cf6" : "#eaecf0"}`,
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: includeMenuPdf ? "#8b5cf6" : "#e5e7eb" }}
                >
                  <FileText className="h-4 w-4" style={{ color: includeMenuPdf ? "#fff" : "#6b7280" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold" style={{ color: includeMenuPdf ? "#6d28d9" : "#374151" }}>
                    Joindre le menu PDF
                  </p>
                  <p className="text-[11px]" style={{ color: includeMenuPdf ? "#7c3aed" : "#9ca3af" }}>
                    {includeMenuPdf ? "Le lien de téléchargement sera ajouté au message" : "Ajouter un lien vers votre carte au message"}
                  </p>
                </div>
                <div
                  className="h-5 w-9 shrink-0 rounded-full transition-colors"
                  style={{ background: includeMenuPdf ? "#8b5cf6" : "#d1d5db" }}
                >
                  <div
                    className="mt-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: includeMenuPdf ? "translateX(18px)" : "translateX(2px)" }}
                  />
                </div>
              </button>
            )}

            {/* Reservation phone */}
            <div className="rounded-xl p-3 space-y-2" style={{ background: "#f8fafc", border: "1px solid #eaecf0" }}>
              <p className="text-[11px] font-semibold text-gray-600">
                📞 Numéro de réservation
                <span className="ml-1 font-normal text-gray-400">(ajouté automatiquement à chaque message)</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+41 22 123 45 67"
                  value={phoneInput}
                  onChange={(e) => { setPhoneInput(e.target.value); setPhoneSaved(false); }}
                  className="h-8 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1"
                />
                <button
                  type="button"
                  disabled={savingPhone || phoneInput === (reservationPhone ?? "")}
                  onClick={handleSavePhone}
                  className="h-8 shrink-0 rounded-lg px-3 text-[12px] font-semibold transition-colors disabled:opacity-40"
                  style={{ border: "1px solid #eaecf0", background: "#fff", color: "#374151" }}
                >
                  {savingPhone ? <Loader2 className="h-3 w-3 animate-spin" /> : phoneSaved ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : "Sauvegarder"}
                </button>
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                {error}
              </div>
            )}
            {result && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                <CheckCircle2 className="h-4 w-4" />
                Message envoyé à <strong>{result.sent}</strong> abonné{result.sent !== 1 ? "s" : ""}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              {!includeMenuPdf && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                    style={{ border: "1px solid #eaecf0" }}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {image ? "Changer" : "Photo du plat"}
                  </button>
                </>
              )}
              <button
                className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                disabled={!message.trim() || sending || quotaUsed >= quotaMax || selectedIds.size === 0}
                onClick={handleSend}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Envoi…" : quotaUsed >= quotaMax ? "Quota atteint" : selectedIds.size === 0 ? "Sélectionnez des abonnés" : `Envoyer à ${selectedIds.size} abonné${selectedIds.size > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>

        {/* iPhone preview */}
        <div className="flex flex-col items-center gap-3">
          <p className="self-start text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Aperçu — ce que reçoit l&apos;abonné
          </p>
          <div
            className="relative w-[260px] rounded-[42px] p-[11px] shadow-2xl"
            style={{ background: "#1a1a1a", boxShadow: "0 0 0 1px #2a2a2a, 0 24px 64px rgba(0,0,0,0.5)" }}
          >
            <div className="absolute left-1/2 top-[17px] h-[24px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
            <div className="overflow-hidden rounded-[32px]" style={{ background: "#ece5dd", minHeight: 520 }}>
              <div className="flex items-center gap-2 px-3 pb-2 pt-11" style={{ background: "#075E54" }}>
                <span className="text-lg text-white opacity-80">‹</span>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#25D366" }}>
                  {restaurantName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-tight text-white">{restaurantName}</p>
                  <p className="text-[10px] text-white opacity-60">en ligne</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-2" style={{ background: "#ece5dd", minHeight: 380 }}>
                <div className="self-center rounded px-2 py-0.5 text-[10px] text-gray-600" style={{ background: "rgba(255,255,255,0.7)" }}>
                  Aujourd&apos;hui
                </div>
                {message ? (
                  <div className="w-[88%] overflow-hidden rounded-[0_10px_10px_10px] shadow-sm" style={{ background: "#fff" }}>
                    {includeMenuPdf ? (
                      <div className="flex h-[90px] flex-col items-center justify-center gap-1" style={{ background: "linear-gradient(135deg, #0f1117, #1a1f2e)" }}>
                        <div style={{ width: 20, height: 2, background: "#e85d26", borderRadius: 1 }} />
                        <p className="text-[10px] font-black text-white text-center px-2" style={{ letterSpacing: "-0.3px" }}>{restaurantName}</p>
                        <p className="text-[7px]" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>JUST-TAG.APP</p>
                      </div>
                    ) : imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="" className="h-[130px] w-full object-cover" />
                    ) : (
                      <div className="flex h-[90px] items-center justify-center text-[10px] font-medium" style={{ background: "#c8d8e8", color: "#5c7a99" }}>
                        📸 1ère photo de la galerie
                      </div>
                    )}
                    <div className="px-2 pb-1 pt-1.5">
                      <p className="whitespace-pre-wrap break-words text-[11px] leading-[1.5] text-gray-900">
                        {message || ""}
                        {includeMenuPdf && menuPdfUrl && (
                          <span className="text-blue-500">{message ? "\n\n" : ""}📋 Notre carte : <span className="underline">Lien PDF</span></span>
                        )}
                        {phoneInput && (
                          <span className="text-gray-500">{(message || (includeMenuPdf && menuPdfUrl)) ? "\n" : ""}Pour réserver : 📞 {phoneInput}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex justify-end gap-1 px-2 pb-1.5">
                      <span className="text-[9px] text-gray-400">12:34</span>
                      <span className="text-[9px]" style={{ color: "#53bdeb" }}>✓✓</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 text-center text-[11px] text-gray-400">Tapez un message pour<br />voir l&apos;aperçu</p>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-gray-200 px-2 py-1.5" style={{ background: "#f0f0f0" }}>
                <div className="flex-1 rounded-full bg-white px-3 py-1 text-[10px] text-gray-400">Votre message…</div>
                <span className="text-base opacity-40">🎤</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">Aperçu fidèle · iPhone &amp; Android</p>
        </div>
      </div>

      {/* Subscribers list */}
      <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
        <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
          <Users className="h-4 w-4" style={{ color: "#25D366" }} />
          <h2 className="font-bold text-gray-900">Abonnés ({subscribers.length})</h2>
          {subscribers.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors hover:bg-gray-100"
              style={{ color: "#25D366" }}
            >
              {selectedIds.size === subscribers.filter((s) => s.is_active).length
                ? <><CheckSquare className="h-3.5 w-3.5" /> Tout désélectionner</>
                : <><Square className="h-3.5 w-3.5" /> Tout sélectionner</>
              }
            </button>
          )}
          {selectedIds.size > 0 && selectedIds.size < subscribers.filter((s) => s.is_active).length && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#25D366" }}>
              {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="p-4">
          {subscribers.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Aucun abonné pour l&apos;instant</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {subscribers.map((sub) => {
                const isSelected = selectedIds.has(sub.id);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    style={{ opacity: sub.is_active ? 1 : 0.5 }}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      disabled={!sub.is_active}
                      onClick={() => toggleSubscriber(sub.id)}
                      className="shrink-0 transition-colors disabled:cursor-not-allowed"
                      style={{ color: isSelected ? "#25D366" : "#d1d5db" }}
                    >
                      {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </button>

                    {/* Info — clicking the row also toggles */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => sub.is_active && toggleSubscriber(sub.id)}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {sub.first_name && <span className="mr-1">{sub.first_name}</span>}
                        <span className="font-mono text-gray-500">{sub.phone}</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Abonné le {new Date(sub.subscribed_at).toLocaleDateString("fr-CH", { day: "numeric", month: "short", year: "numeric" })}
                        {sub.source && sub.source !== "website" && <span className="ml-1">· {sub.source}</span>}
                      </p>
                    </div>

                    <button
                      disabled={deletingId === sub.id}
                      onClick={() => handleDeleteSubscriber(sub.id)}
                      className="shrink-0 rounded-lg p-2 transition-colors hover:bg-red-50 disabled:opacity-40"
                    >
                      {deletingId === sub.id
                        ? <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        : <Trash2 className="h-4 w-4 text-red-400" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid #f5f6fa" }}>
            <Clock className="h-4 w-4 text-gray-400" />
            <h2 className="font-bold text-gray-900">Messages récents</h2>
          </div>
          <div className="divide-y divide-gray-50 p-4">
            {history.map((item) => (
              <div key={item.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-gray-800">{item.message}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                    <span>{new Date(item.created_at).toLocaleDateString("fr-CH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="font-semibold" style={{ color: "#25D366" }}>✓ {item.sent_count} envoyés</span>
                    {item.delivered_count > 0 && (
                      <span className="font-semibold" style={{ color: "#3b82f6" }}>✓✓ {item.delivered_count} délivrés</span>
                    )}
                    {item.read_count > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold" style={{ background: "#fef3c7", color: "#d97706" }}>
                        👁 {item.read_count} lus
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
