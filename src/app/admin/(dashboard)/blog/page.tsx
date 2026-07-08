import Link from "next/link";
import { getAllPosts } from "@/actions/blog";
import { Plus, Pencil, Eye, FileText } from "lucide-react";
import { PublishButton } from "./PublishButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Blog</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {posts.length} article{posts.length !== 1 ? "s" : ""} · SEO content strategy
            </p>
          </div>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-[#eaecf0] bg-white py-12 text-center">
          <p className="text-gray-400 mb-4">Aucun article pour l&apos;instant.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Écrire le premier article
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#eaecf0] bg-[#f8fafc]">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Titre</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Catégorie</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f5]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#fafbfc] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-400">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    {post.category && (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                        style={{ background: "#f3f4f6", color: "#374151" }}
                      >
                        {post.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={
                        post.is_published
                          ? { background: "#f0fdf4", color: "#16a34a" }
                          : { background: "#f3f4f6", color: "#6b7280" }
                      }
                    >
                      {post.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("fr-CH")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {!post.is_published && <PublishButton postId={post.id} />}
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#eaecf0] px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Modifier
                      </Link>
                      {post.is_published && (
                        <Link
                          href={`/fr/blog/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#eaecf0] px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-3 w-3" /> Voir
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
