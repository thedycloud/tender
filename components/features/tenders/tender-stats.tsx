import type { TenderStatsDTO } from "../../../types/tender";
import { Skeleton } from "../../ui/skeleton";

export function TenderStatsCards({ stats }: { stats: TenderStatsDTO }) {
  const cards = [
    { label: "Total Dokumen", value: stats.total, detail: `+${Math.min(8, Math.max(0, stats.total))} minggu ini`, dot: "bg-[#5b67f1]" },
    { label: "Menunggu Review", value: stats.byStatus.CLOSING_SOON + stats.byStatus.OPEN, detail: "Perlu tindaklanjuti segera", dot: "bg-[#f59e0b]" },
    { label: "Disetujui & Aktif", value: stats.byStatus.OPEN, detail: "Lelang berjalan", dot: "bg-[#10b981]" },
    { label: "Ditolak", value: stats.byStatus.CANCELLED + stats.byStatus.CLOSED, detail: "Perlu revisi", dot: "bg-[#ef476f]" },
  ];

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="relative rounded-lg border border-zinc-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          <span className={`absolute right-4 top-4 size-2 rounded-full ${card.dot}`} />
          <p className="text-[11px] text-zinc-500">{card.label}</p>
          <p className={`mt-2 text-[25px] font-bold leading-none ${
            card.label === "Menunggu Review" ? "text-[#c45a00]" :
            card.label === "Ditolak" ? "text-[#d93262]" : "text-zinc-950"
          }`}>
            {card.value}
          </p>
          <p className="mt-2 text-[10px] text-zinc-500">{card.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function TenderStatsSkeleton() {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-lg border bg-white p-3 sm:p-4">
          <Skeleton className="h-4 w-24 max-w-full" />
          <Skeleton className="mt-2 h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
