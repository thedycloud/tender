"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/status-badge";
import { useRowActivation } from "@/hooks/use-row-activation";
import { isExpired } from "@/lib/format";
import type { TenderListItemDTO } from "@/lib/queries/tenders";
import { MoreVertical } from "lucide-react";

interface TenderRowProps {
  tender: TenderListItemDTO;
  href: string;
}

export function TenderRow({ tender, href }: TenderRowProps) {
  const activation = useRowActivation({ id: tender.id, href });
  const deadline = tender.deadlineAt
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(tender.deadlineAt))
    : "-";

  return (
    <TableRow
      role="button"
      tabIndex={0}
      data-tender-id={tender.id}
      aria-label={`Buka tender ${tender.title}`}
      onClick={activation.onClick}
      onKeyDown={activation.onKeyDown}
      className="h-[68px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950"
    >
      <TableCell className="w-10 px-3">
        <input type="checkbox" aria-label={`Pilih ${tender.title}`} className="size-3.5 rounded border-zinc-300" />
      </TableCell>
      <TableCell className="min-w-64 max-w-xs px-3 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block max-w-[270px] truncate text-xs font-semibold text-zinc-950">{tender.title}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            {tender.title}
          </TooltipContent>
        </Tooltip>
        <span className="mt-1 block text-[10px] text-zinc-500">{tender.referenceCode || `TDR-${tender.id.slice(0, 6)}`}</span>
      </TableCell>
      <TableCell className="min-w-44 px-3 py-2.5">
        <span className="block text-xs text-zinc-800">{tender.organization ?? "-"}</span>
        <span className="mt-1 block text-[10px] text-zinc-500">{tender.category?.name ?? "-"}</span>
      </TableCell>
      <TableCell className="min-w-36 px-3 py-2.5">
        <span className="block text-xs text-zinc-800">{deadline === "-" ? "-" : deadline.replace(",", "").replace(" ", " ")}</span>
        <span className="mt-1 inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
          {isExpired(tender.deadlineAt, tender.status) ? "LEWAT DEADLINE" : "Aktif"}
        </span>
      </TableCell>
      <TableCell className="min-w-28 px-3 py-2.5">
        <StatusBadge
          status={tender.status}
          expired={isExpired(tender.deadlineAt, tender.status)}
        />
      </TableCell>
      <TableCell className="w-12 px-3 py-2.5 text-right">
        <button
          type="button"
          aria-label={`Aksi untuk ${tender.title}`}
          className="grid size-7 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="size-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}
