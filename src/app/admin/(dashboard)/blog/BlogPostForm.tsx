"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost, deletePost, type BlogPost } from "@/actions/blog";
import { Save, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface BlogPostFormProps {
  post?: BlogPost;
}

const inputClass =
  "w-full rounded-xl border border-[#eaecf0] bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#eaecf0] bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-gray-700">{title}</h2>
      {children}
    </div>
  );
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
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux articles
        </Link>
        <div className="flex items-center gap-3">
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Contenu">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className={labelClass}>Titre *</label>
                <input
                  id="title"
                  name="title"
                  defaultValue={post?.title || ""}
                  placeholder="Les 10 meilleurs restaurants de Genève en 2026"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="excerpt" className={labelClass}>Résumé</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  defaultValue={post?.excerpt || ""}
                  placeholder="Court résumé pour les cartes et la meta description (2-3 lignes)"
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>
              <div>
                <label htmlFor="content" className={labelClass}>
                  Contenu * <span className="font-normal normal-case text-gray-400">(Markdown supporté)</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  defaultValue={post?.content || ""}
                  placeholder={"## Introduction\n\nVotre contenu ici...\n\n## Section 1\n\n..."}
                  rows={25}
                  required
                  className={inputClass + " resize-y font-mono"}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SectionCard title="Publication">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_published"
                  id="is_published"
                  defaultChecked={post?.is_published || false}
                  className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Publié
                </label>
              </div>
              {post?.published_at && (
                <p className="text-xs text-gray-400">
                  Publié le {new Date(post.published_at).toLocaleDateString("fr-CH")}
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Métadonnées">
            <div className="space-y-4">
              <div>
                <label htmlFor="cover_image" className={labelClass}>Image de couverture</label>
                <input
                  id="cover_image"
                  name="cover_image"
                  defaultValue={post?.cover_image || ""}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="category" className={labelClass}>Catégorie</label>
                <select
                  id="category"
                  name="category"
                  defaultValue={post?.category || ""}
                  className={inputClass}
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
                <label htmlFor="tags" className={labelClass}>
                  Tags <span className="font-normal normal-case text-gray-400">(séparés par des virgules)</span>
                </label>
                <input
                  id="tags"
                  name="tags"
                  defaultValue={post?.tags?.join(", ") || ""}
                  placeholder="geneve, terrasse, gastronomique"
                  className={inputClass}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="SEO">
            <div className="space-y-4">
              <div>
                <label htmlFor="meta_title" className={labelClass}>
                  Titre SEO <span className="font-normal normal-case text-gray-400">(override)</span>
                </label>
                <input
                  id="meta_title"
                  name="meta_title"
                  defaultValue={post?.meta_title || ""}
                  placeholder="Laisse vide = utilise le titre"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="meta_description" className={labelClass}>
                  Meta description <span className="font-normal normal-case text-gray-400">(override)</span>
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  defaultValue={post?.meta_description || ""}
                  placeholder="Laisse vide = utilise le résumé"
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </form>
  );
}
