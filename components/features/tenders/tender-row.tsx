"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, isExpired } from "@/lib/format";
import type { TenderListItemDTO } from "@/lib/queries/tenders";

interface TenderRowProps {
  tender: TenderListItemDTO;
  href: (tenderId: string) => string;
}

export function TenderRow({ tender, href }: TenderRowProps) {
  const router = useRouter();

  const openTender = () => {
    router.push(href(tender.id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openTender();
    }
    if (event.key === " ") {
      event.preventDefault();
      openTender();
    }
  };

  return (
    <TableRow
      role="button"
      tabIndex={0}
      data-tender-id={tender.id}
      aria-label={`Buka tender ${tender.title}`}
      onClick={openTender}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950"
    >
      <TableCell className="min-w-64 max-w-xs font-medium text-zinc-950">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block max-w-64 truncate">{tender.title}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            {tender.title}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="font-mono text-xs">
        {tender.referenceCode}
      </TableCell>
      <TableCell className="min-w-40">
        {tender.organization ?? "-"}
      </TableCell>
      <TableCell className="min-w-36">
        {tender.category?.name ?? "-"}
      </TableCell>
      <TableCell className="min-w-32">
        <StatusBadge
          status={tender.status}
          expired={isExpired(tender.deadlineAt, tender.status)}
        />
      </TableCell>
      <TableCell className="min-w-36">
        {formatDate(tender.deadlineAt)}
      </TableCell>
    </TableRow>
  );
}
