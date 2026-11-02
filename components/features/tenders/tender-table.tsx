import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { TenderListItemDTO } from "@/lib/queries/tenders";
import type { TenderQuery } from "@/schemas/tender-query";
import type { TenderSortValue } from "@/lib/tender-sort";
import { SortableHead } from "./sortable-head";
import { TenderRow } from "./tender-row";

interface TenderTableProps {
  items: TenderListItemDTO[];
  query: TenderQuery;
}

function buildQueryUrl(
  query: TenderQuery,
  patch: {
    sort?: TenderSortValue | null;
    tender?: string | null;
    page?: number | null;
  },
): string {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.status !== "ALL") params.set("status", query.status);
  if (query.category) params.set("category", query.category);

  const sort = patch.sort === undefined ? query.sort : patch.sort;
  if (sort && sort !== "newest") params.set("sort", sort);

  const page = patch.page === undefined ? query.page : patch.page;
  if (page && page !== 1) params.set("page", String(page));

  if (patch.tender) params.set("tender", patch.tender);

  const search = params.toString();
  return search ? `/dashboard?${search}` : "/dashboard";
}

export function TenderTable({ items, query }: TenderTableProps) {
  if (items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          variant={query.q || query.status !== "ALL" || query.category ? "no-results" : "initial"}
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead
            label="Judul"
            sort={query.sort as TenderSortValue}
            buildHref={(sort) =>
              buildQueryUrl(query, {
                sort,
                page: null,
              })
            }
            className="min-w-64"
          />
          <th className="h-10 min-w-28 px-3 text-left align-middle font-medium text-zinc-500">
            Kode
          </th>
          <th className="h-10 min-w-40 px-3 text-left align-middle font-medium text-zinc-500">
            Instansi
          </th>
          <th className="h-10 min-w-36 px-3 text-left align-middle font-medium text-zinc-500">
            Kategori
          </th>
          <th className="h-10 min-w-32 px-3 text-left align-middle font-medium text-zinc-500">
            Status
          </th>
          <th className="h-10 min-w-36 px-3 text-left align-middle font-medium text-zinc-500">
            Deadline
          </th>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((tender) => (
          <TenderRow
            key={tender.id}
            tender={tender}
            href={(tenderId) =>
              buildQueryUrl(query, { tender: tenderId })
            }
          />
        ))}
      </TableBody>
    </Table>
  );
}
