import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, isExpired } from "@/lib/format";
import type { TenderListItemDTO } from "@/lib/queries/tenders";

interface TenderTableProps {
  tenders: TenderListItemDTO[];
}

export function TenderTable({ tenders }: TenderTableProps) {
  if (tenders.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Kode</TableHead>
          <TableHead>Instansi</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deadline</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenders.map((tender) => (
          <TableRow key={tender.id}>
            <TableCell className="max-w-xs font-medium text-zinc-950">
              <span className="block truncate">{tender.title}</span>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {tender.referenceCode}
            </TableCell>
            <TableCell>{tender.organization ?? "-"}</TableCell>
            <TableCell>{tender.category?.name ?? "-"}</TableCell>
            <TableCell>
              <StatusBadge
                status={tender.status}
                expired={isExpired(tender.deadlineAt, tender.status)}
              />
            </TableCell>
            <TableCell>{formatDate(tender.deadlineAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
