import type { CategoryOption } from "@/types/tender";
import { TenderFormDialog } from "./tender-form-dialog";

interface DashboardHeaderProps {
  total: number;
  categories?: CategoryOption[];
}

export function DashboardHeader({ total, categories = [] }: DashboardHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 id="dashboard-page-title" tabIndex={-1} className="text-[22px] font-bold leading-tight text-zinc-950 outline-none">
          Daftar Dokumen Tender
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          Kelola, tinjau, dan pantau seluruh dokumen lelang pengadaan Anda.
        </p>
      </div>
      <TenderFormDialog categories={categories} triggerLabel="Unggah Dokumen Baru" />
    </div>
  );
}
