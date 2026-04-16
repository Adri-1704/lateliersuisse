import { notFound } from "next/navigation";
import { getPostById } from "@/actions/blog";
import { BlogPostForm } from "../BlogPostForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Modifier l&apos;article</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
