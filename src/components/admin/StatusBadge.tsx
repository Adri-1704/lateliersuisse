const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: "Nouveau", bg: "#eff6ff", color: "#2563eb" },
  contacted: { label: "Contacté", bg: "#f3f4f6", color: "#374151" },
  converted: { label: "Converti", bg: "#f0fdf4", color: "#16a34a" },
  archived: { label: "Archivé", bg: "#f9fafb", color: "#9ca3af" },
  pending: { label: "En attente", bg: "#fffbeb", color: "#d97706" },
  approved: { label: "Approuvé", bg: "#f0fdf4", color: "#16a34a" },
  rejected: { label: "Rejeté", bg: "#fef2f2", color: "#dc2626" },
  unclaimed: { label: "Non revendiqué", bg: "#f3f4f6", color: "#374151" },
  claimed: { label: "Revendiqué", bg: "#eef2ff", color: "#4f46e5" },
  active: { label: "Actif", bg: "#f0fdf4", color: "#16a34a" },
  past_due: { label: "En retard", bg: "#fef2f2", color: "#dc2626" },
  canceled: { label: "Annulé", bg: "#fef2f2", color: "#dc2626" },
  incomplete: { label: "Incomplet", bg: "#fffbeb", color: "#d97706" },
  trialing: { label: "Essai", bg: "#eff6ff", color: "#2563eb" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = statusConfig[status] || { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
