"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2, Upload, Trash2, Star, CheckCircle, ImageIcon, AlertCircle, GripVertical,
} from "lucide-react";
import { getMerchantRestaurant } from "@/actions/merchant/restaurant";
import {
  getRestaurantImages, uploadImage, deleteImage, setCoverImage, reorderImages,
} from "@/actions/merchant/photos";
import type { RestaurantImage } from "@/lib/supabase/types";

const MAX_IMAGES = 10;

export default function PhotosPage() {
  const t = useTranslations("merchantPortal");
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const restResult = await getMerchantRestaurant();
      if (restResult.success && restResult.data) {
        setRestaurantId(restResult.data.id);
        setCoverUrl(restResult.data.cover_image);
        const imgResult = await getRestaurantImages(restResult.data.id);
        if (imgResult.success && imgResult.data) setImages(imgResult.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;
    if (images.length >= MAX_IMAGES) {
      setError(`Vous avez atteint la limite de ${MAX_IMAGES} photos`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadImage(restaurantId, formData);
    if (result.success) {
      const imgResult = await getRestaurantImages(restaurantId);
      if (imgResult.data) setImages(imgResult.data);
      showSuccess(t("photos.uploaded"));
    } else {
      setError(result.error || "Erreur lors de l'upload");
      setTimeout(() => setError(null), 5000);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(imageId: string) {
    if (!window.confirm("Voulez-vous vraiment supprimer cette photo ?")) return;
    setDeletingId(imageId);
    setError(null);
    const result = await deleteImage(imageId);
    if (result.success) {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      showSuccess(t("photos.deleted"));
    } else {
      setError(result.error || "Erreur lors de la suppression");
      setTimeout(() => setError(null), 5000);
    }
    setDeletingId(null);
  }

  async function handleSetCover(imageUrl: string) {
    if (!restaurantId) return;
    const result = await setCoverImage(restaurantId, imageUrl);
    if (result.success) { setCoverUrl(imageUrl); showSuccess(t("photos.coverSet")); }
  }

  const handleDragStart = useCallback((index: number) => { setDraggedIndex(index); }, []);
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverIndex(index);
  }, []);
  const handleDragLeave = useCallback(() => { setDragOverIndex(null); }, []);
  const handleDrop = useCallback(async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null); setDragOverIndex(null); return;
    }
    const newImages = [...images];
    const [movedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, movedItem);
    setImages(newImages); setDraggedIndex(null); setDragOverIndex(null);
    const imageIds = newImages.map((img) => img.id);
    const result = await reorderImages(imageIds);
    if (result.success) {
      showSuccess("Ordre mis à jour");
    } else {
      const imgResult = restaurantId ? await getRestaurantImages(restaurantId) : null;
      if (imgResult?.data) setImages(imgResult.data);
      setError("Erreur lors du réordonnancement");
      setTimeout(() => setError(null), 5000);
    }
  }, [draggedIndex, images, restaurantId]);
  const handleDragEnd = useCallback(() => { setDraggedIndex(null); setDragOverIndex(null); }, []);

  function showSuccess(msg: string) { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#ec4899" }} />
      </div>
    );
  }

  const canUpload = images.length < MAX_IMAGES;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}>
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">{t("photos.title")}</h1>
            <p className="text-[13px] text-gray-400">{t("photos.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !canUpload}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {t("photos.upload")}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Meta bar */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-gray-400">{t("photos.formats")} — {t("photos.maxSize")}</p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-gray-600">{images.length}</span>
          <span className="text-[12px] text-gray-400">/ {MAX_IMAGES} photos</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "#e5e7eb" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(images.length / MAX_IMAGES) * 100}%`, background: "linear-gradient(90deg, #ec4899, #f472b6)" }}
            />
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20 text-center cursor-pointer transition-colors hover:border-pink-300"
          style={{ border: "2px dashed #e5e7eb", background: "#fafafa" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #fdf2f8, #fce7f3)" }}>
            <ImageIcon className="h-7 w-7" style={{ color: "#ec4899" }} />
          </div>
          <h3 className="font-bold text-gray-800">{t("photos.empty")}</h3>
          <p className="mt-1 text-sm text-gray-400">{t("photos.emptyDescription")}</p>
          <span className="mt-4 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}>
            Ajouter une photo
          </span>
        </div>
      ) : (
        <>
          {images.length > 1 && (
            <p className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <GripVertical className="h-3.5 w-3.5" />
              Glissez-déposez les photos pour modifier l&apos;ordre d&apos;affichage
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, index) => {
              const isCover = img.url === coverUrl;
              const isDeleting = deletingId === img.id;
              const isDragged = draggedIndex === index;
              const isDragOver = dragOverIndex === index;
              return (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className="overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing transition-all"
                  style={{
                    background: "#fff",
                    border: isCover ? "2px solid #ec4899" : isDragOver ? "2px solid #3b82f6" : "1.5px solid #eaecf0",
                    opacity: isDragged ? 0.4 : 1,
                    transform: isDragOver ? "scale(1.03)" : isDragged ? "scale(0.95)" : "scale(1)",
                    boxShadow: isDragOver ? "0 8px 24px rgba(59,130,246,0.15)" : "none",
                  }}
                >
                  <div className="relative aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt_text || "Photo restaurant"}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                    {/* Index badge */}
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] font-bold text-white">
                      {index + 1}
                    </div>
                    {/* Cover badge */}
                    {isCover && (
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#ec4899" }}>
                        <Star className="h-2.5 w-2.5 fill-white" /> Couverture
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2">
                    {!isCover ? (
                      <button
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                        onClick={() => handleSetCover(img.url)}
                      >
                        <Star className="h-3 w-3" />
                        Couverture
                      </button>
                    ) : (
                      <div />
                    )}
                    <button
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium hover:bg-red-50 transition-colors"
                      style={{ color: "#dc2626" }}
                      onClick={() => handleDelete(img.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
