"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, deletePost, type BlogPost } from "@/actions/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BlogPostFormProps {
  post?: BlogPost;
}

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    const result = post
      ? await updatePost(post.id, formData)
      : await createPost(formData);

    if (result.success) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setError(result.error || "Erreur inconnue");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!post || !confirm("Supprimer cet article ? Cette action est irréversible.")) return;
    setDeleting(true);
    const result = await deletePost(post.id);
    if (result.success) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setError(result.error || "Erreur de suppression");
    }
    setDeleting(false);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux articles
        </Link>
        <div className="flex items-center gap-3">
          {post && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1"
            >
              <Trash2 className="h-3 w-3" /> {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-[var(--color-just-tag)] hover:opacity-90"
          >
            <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contenu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Titre *</label>
                <Input
                  name="title"
                  defaultValue={post?.title || ""}
                  placeholder="Les 10 meilleurs restaurants de Genève en 2026"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Résumé</label>
                <textarea
                  name="excerpt"
                  defaultValue={post?.excerpt || ""}
                  placeholder="Court résumé pour les cartes et la meta description (2-3 lignes)"
                  rows={3}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contenu * <span className="font-normal text-gray-400">(Markdown supporté)</span>
                </label>
                <textarea
                  name="content"
                  defaultValue={post?.content || ""}
                  placeholder={"## Introduction\n\nVotre contenu ici...\n\n## Section 1\n\n..."}
                  rows={25}
                  required
                  className="w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_published"
                  id="is_published"
                  defaultChecked={post?.is_published || false}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Publié
                </label>
              </div>
              {post?.published_at && (
                <p className="text-xs text-gray-500">
                  Publié le {new Date(post.published_at).toLocaleDateString("fr-CH")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Image de couverture</label>
                <Input
                  name="cover_image"
                  defaultValue={post?.cover_image || ""}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  name="category"
                  defaultValue={post?.category || ""}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                >
                  <option value="">Aucune</option>
                  <option value="guide">Guide</option>
                  <option value="top">Top / Classement</option>
                  <option value="actualite">Actualité</option>
                  <option value="conseil">Conseil restaurateur</option>
                  <option value="decouverte">Découverte</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tags <span className="font-normal text-gray-400">(séparés par des virgules)</span>
                </label>
                <Input
                  name="tags"
                  defaultValue={post?.tags?.join(", ") || ""}
                  placeholder="geneve, terrasse, gastronomique"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Titre SEO <span className="font-normal text-gray-400">(override)</span>
                </label>
                <Input
                  name="meta_title"
                  defaultValue={post?.meta_title || ""}
                  placeholder="Laisse vide = utilise le titre"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Meta description <span className="font-normal text-gray-400">(override)</span>
                </label>
                <textarea
                  name="meta_description"
                  defaultValue={post?.meta_description || ""}
                  placeholder="Laisse vide = utilise le résumé"
                  rows={3}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
