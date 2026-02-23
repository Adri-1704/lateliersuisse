import Link from "next/link";
import { listMerchants } from "@/actions/admin/merchants";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

const planLabels: Record<string, string> = {
  monthly: "Mensuel",
  semiannual: "Semestriel",
  annual: "Annuel",
  lifetime: "A vie",
};

export default async function MerchantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listMerchants({ page, search: params.search });

  const merchants = result.data?.merchants || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commercants</h1>
        <p className="text-muted-foreground">{total} commercant{total > 1 ? "s" : ""}</p>
      </div>

      <SearchInput placeholder="Rechercher par nom, email..." />

      {merchants.length === 0 ? (
        <EmptyState title="Aucun commercant" description="Aucun commercant inscrit pour le moment." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telephone</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchants.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-sm">{m.email}</TableCell>
                    <TableCell className="text-sm">{m.phone || "\u2014"}</TableCell>
                    <TableCell>
                      {m.subscription ? (
                        <Badge variant="outline">{planLabels[m.subscription.plan_type] || m.subscription.plan_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">{"\u2014"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {m.subscription ? (
                        <StatusBadge status={m.subscription.status} />
                      ) : (
                        <span className="text-muted-foreground text-sm">{"\u2014"}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("fr-CH")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/merchants/${m.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} />
        </>
      )}
    </div>
  );
}
