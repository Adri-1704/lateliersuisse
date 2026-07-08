"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2, Star, CheckCircle, MessageSquare, AlertCircle, Pencil, Trash2, Send, X,
} from "lucide-react";
import {
  getMerchantReviews, replyToReview, deleteReply,
} from "@/actions/merchant/reviews";
import type { DbReview } from "@/lib/supabase/types";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #f97316, #fb923c)",
  "linear-gradient(135deg, #3b82f6, #60a5fa)",
  "linear-gradient(135deg, #10b981, #34d399)",
  "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
];

function getAvatarGradient(name: string) {
  const code = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[code];
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

export default function AvisPage() {
  const t = useTranslations("merchantPortal");
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getMerchantReviews();
      if (result.success && result.data) setReviews(result.data);
      setLoading(false);
    }
    load();
  }, []);

  const showSuccess = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  }, []);

  function openReplyForm(reviewId: string, existingReply?: string | null) {
    if (existingReply) { setEditingReply(reviewId); setReplyingTo(null); }
    else { setReplyingTo(reviewId); setEditingReply(null); }
    setReplyText(existingReply || "");
  }

  function cancelReply() { setReplyingTo(null); setEditingReply(null); setReplyText(""); }

  async function handleSubmitReply(reviewId: string) {
    if (!replyText.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await replyToReview(reviewId, replyText.trim());
    if (result.success) {
      setReviews((prev) => prev.map((r) =>
        r.id === reviewId ? { ...r, reply_comment: replyText.trim(), reply_date: new Date().toISOString() } : r
      ));
      cancelReply();
      showSuccess(t("reviews.replySaved"));
    } else {
      showError(result.error || "Erreur");
    }
    setSubmitting(false);
  }

  async function handleDeleteReply(reviewId: string) {
    if (!window.confirm(t("reviews.confirmDelete"))) return;
    setSubmitting(true);
    setError(null);
    const result = await deleteReply(reviewId);
    if (result.success) {
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, reply_comment: null, reply_date: null } : r));
      showSuccess(t("reviews.replyDeleted"));
    } else {
      showError(result.error || "Erreur");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#f59e0b" }} />
      </div>
    );
  }

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "–";
  const noReplyCount = reviews.filter((r) => !r.reply_comment).length;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">{t("reviews.title")}</h1>
            <p className="text-[13px] text-gray-400">{t("reviews.subtitle")}</p>
          </div>
        </div>
        {success && (
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1.5px solid #f59e0b22" }}>
          <p className="text-4xl font-black text-gray-900">{totalReviews}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>{t("reviews.total")}</p>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1.5px solid #f59e0b22" }}>
          <div className="flex items-center justify-center gap-1.5">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <span className="text-4xl font-black text-gray-900">{avgRating}</span>
          </div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>{t("reviews.avgRating")}</p>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1.5px solid #3b82f622" }}>
          <p className="text-4xl font-black text-gray-900">{noReplyCount}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#3b82f6" }}>{t("reviews.noReply")}</p>
        </div>
      </div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center" style={{ background: "#fff", border: "1.5px solid #eaecf0" }}>
          <span className="text-5xl">⭐</span>
          <h3 className="mt-4 text-lg font-bold text-gray-800">{t("reviews.empty")}</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-xs">{t("reviews.emptyDescription")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isReplying = replyingTo === review.id;
            const isEditing = editingReply === review.id;
            const showForm = isReplying || isEditing;
            const hasNoReply = !review.reply_comment && !showForm;
            const initials = review.author_name.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() || "").join("");

            return (
              <div
                key={review.id}
                className="rounded-2xl bg-white p-5"
                style={{ border: "1.5px solid #eaecf0" }}
              >
                {/* Review header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: getAvatarGradient(review.author_name) }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.author_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarDisplay rating={review.rating} />
                        <span className="text-[11px] text-gray-400">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {hasNoReply && (
                    <button
                      onClick={() => openReplyForm(review.id)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-colors"
                      style={{ background: "#f5f6fa", color: "#6b7280", border: "1px solid #eaecf0" }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t("reviews.reply")}
                    </button>
                  )}
                </div>

                {/* Review comment */}
                {review.comment && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                )}

                {/* Existing reply */}
                {review.reply_comment && !isEditing && (
                  <div className="mt-4 rounded-xl p-4" style={{ background: "#f8fafc", borderLeft: "3px solid #e85d26" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#e85d26" }}>
                          {t("reviews.replyLabel")}
                        </span>
                        {review.reply_date && (
                          <span className="text-[11px] text-gray-400">{formatDate(review.reply_date)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openReplyForm(review.id, review.reply_comment)}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          {t("reviews.editReply")}
                        </button>
                        <button
                          onClick={() => handleDeleteReply(review.id)}
                          disabled={submitting}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors"
                          style={{ color: "#dc2626" }}
                        >
                          <Trash2 className="h-3 w-3" />
                          {t("reviews.deleteReply")}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.reply_comment}</p>
                  </div>
                )}

                {/* Reply form */}
                {showForm && (
                  <div className="mt-4 space-y-3 rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid #eaecf0" }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t("reviews.replyPlaceholder")}
                      maxLength={1000}
                      rows={3}
                      autoFocus
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2"
                      style={{ focusRingColor: "#e85d26" } as React.CSSProperties}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">{replyText.length}/1000</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={cancelReply}
                          disabled={submitting}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t("reviews.cancel")}
                        </button>
                        <button
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={submitting || replyText.trim().length < 2}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[12px] font-bold text-white transition-opacity disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}
                        >
                          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          {isEditing ? t("reviews.updateReply") : t("reviews.submitReply")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
