import type { TenderStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TENDER_STATUS_PRESENTATION } from "@/lib/tender-status";

interface StatusBadgeProps {
  status: TenderStatus;
  expired?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  expired = false,
  className,
}: StatusBadgeProps) {
  const presentation = TENDER_STATUS_PRESENTATION[status];

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <Badge variant={presentation.variant}>{presentation.label}</Badge>
      {expired ? (
        <Badge variant="destructive" className="border border-red-200 bg-red-50">
          Kedaluwarsa
        </Badge>
      ) : null}
    </span>
  );
}
