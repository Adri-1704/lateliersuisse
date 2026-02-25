"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const restResult = await getMerchantRestaurant();
      if (restResult.success && restResult.data) {
        setRestaurantId(restResult.data.id);
        setCoverUrl(restResult.data.cover_image);
        const imgResult = await getRestaurantImages(restResult.data.id);
        if (imgResult.success && imgResult.data) {
          setImages(imgResult.data);
        }
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
    const confirmed = window.confirm("Voulez-vous vraiment supprimer cette photo ?");
    if (!confirmed) return;

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
    if (result.success) {
      setCoverUrl(imageUrl);
      showSuccess(t("photos.coverSet"));
    }
  }

  // --- Drag & Drop handlers ---
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder locally
    const newImages = [...images];
    const [movedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, movedItem);
    setImages(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Persist to DB
    const imageIds = newImages.map((img) => img.id);
    const result = await reorderImages(imageIds);
    if (result.success) {
      showSuccess("Ordre mis à jour");
    } else {
      // Revert on error
      const imgResult = restaurantId ? await getRestaurantImages(restaurantId) : null;
      if (imgResult?.data) setImages(imgResult.data);
      setError("Erreur lors du réordonnancement");
      setTimeout(() => setError(null), 5000);
    }
  }, [draggedIndex, images, restaurantId]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canUpload = images.length < MAX_IMAGES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("photos.title")}</h1>
          <p className="text-muted-foreground">{t("photos.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !canUpload}
            className="bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag)]/90"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {t("photos.upload")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {t("photos.formats")} — {t("photos.maxSize")}
        </p>
        <p className="text-xs text-muted-foreground">
          {images.length} / {MAX_IMAGES} photos
        </p>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 font-semibold">{t("photos.empty")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("photos.emptyDescription")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {images.length > 1 && (
            <p className="text-xs text-muted-foreground italic">
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
                <Card
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                    isCover ? "ring-2 ring-[var(--color-just-tag)]" : ""
                  } ${isDragged ? "opacity-40 scale-95" : ""} ${
                    isDragOver ? "ring-2 ring-blue-400 scale-[1.02]" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt_text || "Photo restaurant"}
                      className="h-full w-full object-cover pointer-events-none"
                    />
                    {/* Position badge */}
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    {isCover && (
                      <Badge className="absolute left-2 top-2 bg-[var(--color-just-tag)]">
                        <Star className="mr-1 h-3 w-3" /> Couverture
                      </Badge>
                    )}
                    {/* Drag handle overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
                      <GripVertical className="h-6 w-6 text-white opacity-0 hover:opacity-70 drop-shadow-lg transition-opacity" />
                    </div>
                  </div>
                  <CardContent className="flex items-center justify-between p-2">
                    {!isCover && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleSetCover(img.url)}
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Couverture
                      </Button>
                    )}
                    {isCover && <div />}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(img.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                      )}
                      Supprimer
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
