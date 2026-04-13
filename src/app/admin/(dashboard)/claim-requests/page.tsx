import Link from "next/link";
import { listClaimRequests } from "@/actions/admin/claims";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "default" },
  approved: { label: "Approuve", variant: "outline" },
  rejected: { label: "Rejete", variant: "destructive" },
};

export default async function ClaimRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "pending";
  const result = await listClaimRequests({ status: statusFilter });

  const claims = result.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes de claim</h1>
        <p className="text-muted-foreground">
          {claims.length} demande{claims.length > 1 ? "s" : ""}{" "}
          {statusFilter === "pending" ? "en attente" : statusFilter === "all" ? "au total" : ""}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { value: "pending", label: "En attente" },
          { value: "approved", label: "Approuvees" },
          { value: "rejected", label: "Rejetees" },
          { value: "all", label: "Toutes" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/claim-requests?status=${tab.value}`}
            className={`px-3 py-1.5 text-sm rounded-md border ${
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {claims.length === 0 ? (
        <EmptyState
          title="Aucune demande"
          description="Aucune demande de claim ne correspond a ce filtre."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Commercant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Methode</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((c) => {
                const status = statusLabels[c.status] || {
                  label: c.status,
                  variant: "outline" as const,
                };
                return (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-sm text-muted-foreground">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {new Date(c.created_at).toLocaleDateString("fr-CH")}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {c.restaurant_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {c.restaurant_city}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {c.merchant_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {c.merchant_email}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/admin/claim-requests/${c.id}`} className="block">
                        {c.method}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
