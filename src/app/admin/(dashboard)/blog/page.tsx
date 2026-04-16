import Link from "next/link";
import { getAllPosts } from "@/actions/blog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="mt-1 text-gray-600">{posts.length} articles · SEO content strategy</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2 bg-[var(--color-just-tag)] hover:opacity-90">
            <Plus className="h-4 w-4" /> Nouvel article
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Aucun article pour l&apos;instant.</p>
            <Link href="/admin/blog/new">
              <Button className="mt-4 gap-2 bg-[var(--color-just-tag)]">
                <Plus className="h-4 w-4" /> Ecrire le premier article
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-xs text-gray-500">/{post.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      {post.category && (
                        <Badge variant="secondary" className="text-xs capitalize">{post.category}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {post.is_published ? (
                        <Badge className="bg-green-100 text-green-800 border-0">Publié</Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("fr-CH")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
                        >
                          <Pencil className="h-3 w-3" /> Modifier
                        </Link>
                        {post.is_published && (
                          <Link
                            href={`/fr/blog/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
