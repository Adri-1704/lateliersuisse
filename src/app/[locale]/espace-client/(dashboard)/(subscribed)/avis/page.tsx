"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Star,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Pencil,
  Trash2,
  Send,
  X,
} from "lucide-react";
import {
  getMerchantReviews,
  replyToReview,
  deleteReply,
} from "@/actions/merchant/reviews";
import type { DbReview } from "@/lib/supabase/types";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-CH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AvisPage() {
  const t = useTranslations("merchantPortal");
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reply form state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getMerchantReviews();
      if (result.success && result.data) {
        setReviews(result.data);
      }
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
    if (existingReply) {
      setEditingReply(reviewId);
      setReplyingTo(null);
    } else {
      setReplyingTo(reviewId);
      setEditingReply(null);
    }
    setReplyText(existingReply || "");
  }

  function cancelReply() {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  }

  async function handleSubmitReply(reviewId: string) {
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await replyToReview(reviewId, replyText.trim());

    if (result.success) {
      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                reply_comment: replyText.trim(),
                reply_date: new Date().toISOString(),
              }
            : r
        )
      );
      cancelReply();
      showSuccess(t("reviews.replySaved"));
    } else {
      showError(result.error || "Erreur");
    }

    setSubmitting(false);
  }

  async function handleDeleteReply(reviewId: string) {
    const confirmed = window.confirm(t("reviews.confirmDelete"));
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);

    const result = await deleteReply(reviewId);

    if (result.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply_comment: null, reply_date: null }
            : r
        )
      );
      showSuccess(t("reviews.replyDeleted"));
    } else {
      showError(result.error || "Erreur");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : "–";
  const noReplyCount = reviews.filter((r) => !r.reply_comment).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("reviews.title")}</h1>
          <p className="text-muted-foreground">{t("reviews.subtitle")}</p>
        </div>
        {success && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalReviews}</p>
            <p className="text-xs text-muted-foreground">
              {t("reviews.total")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{avgRating}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("reviews.avgRating")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{noReplyCount}</p>
            <p className="text-xs text-muted-foreground">
              {t("reviews.noReply")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-semibold">{t("reviews.empty")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("reviews.emptyDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Reviews list */
        <div className="space-y-4">
          {reviews.map((review) => {
            const isReplying = replyingTo === review.id;
            const isEditing = editingReply === review.id;
            const showForm = isReplying || isEditing;

            return (
              <Card key={review.id}>
                <CardContent className="p-5">
                  {/* Review header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{review.author_name}</p>
                        <div className="flex items-center gap-2">
                          <StarDisplay rating={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reply action button */}
                    {!review.reply_comment && !showForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReplyForm(review.id)}
                        className="text-xs"
                      >
                        <MessageSquare className="mr-1 h-3.5 w-3.5" />
                        {t("reviews.reply")}
                      </Button>
                    )}
                  </div>

                  {/* Review comment */}
                  {review.comment && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Existing reply */}
                  {review.reply_comment && !isEditing && (
                    <div className="mt-4 ml-4 rounded-lg bg-gray-50 border-l-2 border-[var(--color-just-tag)] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--color-just-tag)]">
                            {t("reviews.replyLabel")}
                          </span>
                          {review.reply_date && (
                            <span className="text-xs text-gray-400">
                              {formatDate(review.reply_date)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() =>
                              openReplyForm(review.id, review.reply_comment)
                            }
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            {t("reviews.editReply")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteReply(review.id)}
                            disabled={submitting}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            {t("reviews.deleteReply")}
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {review.reply_comment}
                      </p>
                    </div>
                  )}

                  {/* Reply form */}
                  {showForm && (
                    <div className="mt-4 ml-4 space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t("reviews.replyPlaceholder")}
                        maxLength={1000}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-[var(--color-just-tag)] focus:outline-none focus:ring-1 focus:ring-[var(--color-just-tag)] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {replyText.length}/1000
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelReply}
                            disabled={submitting}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            {t("reviews.cancel")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(review.id)}
                            disabled={
                              submitting || replyText.trim().length < 2
                            }
                            className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
                          >
                            {submitting ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-1 h-3.5 w-3.5" />
                            )}
                            {isEditing
                              ? t("reviews.updateReply")
                              : t("reviews.submitReply")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
