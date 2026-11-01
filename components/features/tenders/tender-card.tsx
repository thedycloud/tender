"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { useRowActivation } from "@/hooks/use-row-activation";
import { formatDate, isExpired } from "@/lib/format";
import type { TenderListItemDTO } from "@/lib/queries/tenders";

interface TenderCardProps {
  tender: TenderListItemDTO;
  href: string;
}

export function TenderCard({ tender, href }: TenderCardProps) {
  const activation = useRowActivation({ id: tender.id, href });

  return (
    <article
      role="button"
      tabIndex={0}
      data-tender-id={tender.id}
      aria-label={`Buka tender ${tender.title}`}
      onClick={activation.onClick}
      onKeyDown={activation.onKeyDown}
      className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <code className="text-xs text-zinc-500">{tender.referenceCode}</code>
        <StatusBadge
          status={tender.status}
          expired={isExpired(tender.deadlineAt, tender.status)}
        />
      </div>

      <h2 className="mt-3 line-clamp-2 text-base font-semibold text-zinc-950">
        {tender.title}
      </h2>

      <p className="mt-2 text-sm text-zinc-600">
        {[tender.organization, tender.category?.name].filter(Boolean).join(" · ") || "-"}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-zinc-600">
        <span>Deadline: {formatDate(tender.deadlineAt)}</span>
        <span>{tender._count.documents} dokumen</span>
      </div>
    </article>
  );
}
