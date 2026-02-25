"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRestaurant } from "@/actions/admin/restaurants";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { toast } from "sonner";

export function RestaurantDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteRestaurant(id);
      if (res.success) {
        toast.success(`${name} supprime`);
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la suppression");
      }
    });
  }

  return (
    <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
      <DeleteConfirmDialog
        title="Supprimer ce restaurant ?"
        description={`Voulez-vous vraiment supprimer "${name}" ? Cette action est irreversible.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
