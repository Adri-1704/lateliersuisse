import { listB2BRequests } from "@/actions/admin/b2b-requests";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function B2BRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listB2BRequests({
    page,
    search: params.search,
    status: params.status,
  });

  const requests = result.data?.requests || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes B2B</h1>
        <p className="text-muted-foreground">{total} demande{total > 1 ? "s" : ""}</p>
      </div>

      <SearchInput placeholder="Rechercher par nom, restaurant, email..." />

      {requests.length === 0 ? (
        <EmptyState title="Aucune demande" description="Aucune demande B2B ne correspond a votre recherche." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telephone</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("fr-CH")}
                    </TableCell>
                    <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                    <TableCell>{r.restaurant_name}</TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell className="text-sm">{r.email}</TableCell>
                    <TableCell className="text-sm">{r.phone || "\u2014"}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
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
