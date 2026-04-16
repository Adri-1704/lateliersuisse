"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export function PublishButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    const res = await fetch("/api/blog/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      onClick={handlePublish}
      disabled={loading}
      className="gap-1 bg-green-600 hover:bg-green-700 text-white"
    >
      <Rocket className="h-3 w-3" />
      {loading ? "..." : "Publier"}
    </Button>
  );
}
