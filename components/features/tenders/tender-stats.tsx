import type { TenderStatsDTO } from "../../../types/tender";
import { Skeleton } from "../../ui/skeleton";

export function TenderStatsCards({ stats }: { stats: TenderStatsDTO }) {
  const cards = [
    { label: "Total tender", value: stats.total },
    { label: "Sedang dibuka", value: stats.byStatus.OPEN },
    { label: "Segera tutup", value: stats.byStatus.CLOSING_SOON },
    { label: "Deadline segera", value: stats.dueSoon },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 border-b px-4 py-4 sm:px-6 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-white p-3 sm:p-4">
          <p className="text-xs text-zinc-500 sm:text-sm">{card.label}</p>
          <p className="mt-1 text-xl font-semibold text-zinc-950 sm:text-2xl">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TenderStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 border-b px-4 py-4 sm:px-6 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-lg border bg-white p-3 sm:p-4">
          <Skeleton className="h-4 w-24 max-w-full" />
          <Skeleton className="mt-2 h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
