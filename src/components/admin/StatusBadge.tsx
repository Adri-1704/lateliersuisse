import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nouveau", variant: "default" },
  contacted: { label: "Contacté", variant: "secondary" },
  converted: { label: "Converti", variant: "outline" },
  archived: { label: "Archivé", variant: "destructive" },
  pending: { label: "En attente", variant: "secondary" },
  approved: { label: "Approuvé", variant: "default" },
  rejected: { label: "Rejeté", variant: "destructive" },
  unclaimed: { label: "Non revendiqué", variant: "outline" },
  claimed: { label: "Revendiqué", variant: "default" },
  active: { label: "Actif", variant: "default" },
  past_due: { label: "En retard", variant: "destructive" },
  canceled: { label: "Annulé", variant: "destructive" },
  incomplete: { label: "Incomplet", variant: "secondary" },
  trialing: { label: "Essai", variant: "outline" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
