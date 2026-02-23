import { listReviews } from "@/actions/admin/reviews";
import { SearchInput } from "@/components/admin/SearchInput";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const result = await listReviews({ page, search: params.search });

  const reviews = result.data?.reviews || [];
  const total = result.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Avis</h1>
        <p className="text-muted-foreground">{total} avis</p>
      </div>

      <SearchInput placeholder="Rechercher par auteur, commentaire..." />

      {reviews.length === 0 ? (
        <EmptyState title="Aucun avis" description="Aucun avis ne correspond a votre recherche." />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="max-w-[300px]">Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("fr-CH")}
                    </TableCell>
                    <TableCell className="font-medium">{r.author_name}</TableCell>
                    <TableCell className="text-sm">{r.restaurant_name || "\u2014"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {r.comment || "\u2014"}
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
