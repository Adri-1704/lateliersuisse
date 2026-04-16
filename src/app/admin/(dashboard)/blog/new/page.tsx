import { BlogPostForm } from "../BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Nouvel article</h1>
      <BlogPostForm />
    </div>
  );
}
