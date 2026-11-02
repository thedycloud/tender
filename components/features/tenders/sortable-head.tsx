"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import {
  getTenderSortDirection,
  type TenderSortValue,
} from "@/lib/tender-sort";

interface SortableHeadProps {
  label: string;
  sort: TenderSortValue | null | undefined;
  href: string;
  className?: string;
}

export function SortableHead({
  label,
  sort,
  href,
  className,
}: SortableHeadProps) {
  const direction = getTenderSortDirection(sort, "title");
  const ariaSort =
    direction === "asc"
      ? "ascending"
      : direction === "desc"
        ? "descending"
        : "none";

  return (
    <TableHead
      aria-sort={ariaSort}
      className={className}
      scope="col"
    >
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded-sm font-medium text-zinc-700 outline-none hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
        aria-label={
          direction === "asc"
            ? `Urutkan ${label} menurun`
            : direction === "desc"
              ? `Reset urutan ${label}`
              : `Urutkan ${label} menaik`
        }
      >
        {label}
        {direction === "asc" ? (
          <ArrowUp aria-hidden="true" className="size-4" />
        ) : direction === "desc" ? (
          <ArrowDown aria-hidden="true" className="size-4" />
        ) : (
          <ChevronsUpDown aria-hidden="true" className="size-4" />
        )}
      </Link>
    </TableHead>
  );
}
