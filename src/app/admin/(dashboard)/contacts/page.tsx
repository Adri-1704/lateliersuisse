import { listContacts } from "@/actions/admin/contacts";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listContacts({ page, search: params.search });

  const contacts = result.data?.contacts || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages de contact</h1>
        <p className="text-muted-foreground">{total} message{total > 1 ? "s" : ""}</p>
      </div>

      <SearchInput placeholder="Rechercher par nom, email..." />

      {contacts.length === 0 ? (
        <EmptyState title="Aucun message" description="Aucun message de contact." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead className="max-w-[300px]">Message</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("fr-CH")}
                    </TableCell>
                    <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="text-sm">{c.subject || "\u2014"}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {c.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.is_read ? "secondary" : "default"}>
                        {c.is_read ? "Lu" : "Non lu"}
                      </Badge>
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
