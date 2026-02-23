import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nouveau", variant: "default" },
  contacted: { label: "Contacte", variant: "secondary" },
  converted: { label: "Converti", variant: "outline" },
  archived: { label: "Archive", variant: "destructive" },
  active: { label: "Actif", variant: "default" },
  past_due: { label: "En retard", variant: "destructive" },
  canceled: { label: "Annule", variant: "destructive" },
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
