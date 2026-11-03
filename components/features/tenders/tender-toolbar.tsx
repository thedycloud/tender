"use client";

import { X } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSyncedState } from "@/hooks/use-synced-state";
import { useUrlState } from "@/hooks/use-url-state";
import { TENDER_STATUS_PRESENTATION } from "@/lib/tender-status";
import { TENDER_STATUSES } from "@/lib/queries/tender-utils";
import type { CategoryOption } from "@/types/tender";

interface TenderToolbarProps {
  initialQuery: string;
  status: string;
  categorySlug?: string;
  categories: CategoryOption[];
}

export function TenderToolbar({
  initialQuery,
  status,
  categorySlug,
  categories,
}: TenderToolbarProps) {
  const urlState = useUrlState();
  const [syncedStatus, setSyncedStatus] = useSyncedState(status);
  const [syncedCategory, setSyncedCategory] = useSyncedState(
    categorySlug ?? "ALL",
  );

  const hasActiveFilter =
    Boolean(initialQuery) ||
    syncedStatus !== "ALL" ||
    syncedCategory !== "ALL";

  function changeStatus(nextStatus: string) {
    setSyncedStatus(nextStatus);
    urlState.push(
      { status: nextStatus === "ALL" ? null : nextStatus, page: null },
      { scroll: false },
    );
  }

  function changeCategory(nextCategory: string) {
    setSyncedCategory(nextCategory);
    urlState.push(
      { category: nextCategory === "ALL" ? null : nextCategory, page: null },
      { scroll: false },
    );
  }

  function resetFilters() {
    setSyncedStatus("ALL");
    setSyncedCategory("ALL");
    urlState.push(
      { q: null, status: null, category: null, page: null },
      { scroll: false },
    );
  }

  return (
    <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="w-full xl:max-w-[460px]">
          <SearchInput initialQuery={initialQuery} />
        </div>
        <div className="flex flex-wrap gap-2 xl:ml-auto">
        <Select value={syncedCategory} onValueChange={changeCategory}>
          <SelectTrigger aria-label="Filter kategori" className="h-9 w-full rounded-md border-zinc-200 text-xs md:w-36">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value="ALL" onValueChange={() => undefined}>
          <SelectTrigger aria-label="Filter tanggal" className="h-9 w-full rounded-md border-zinc-200 text-xs md:w-36">
            <SelectValue placeholder="Semua Tanggal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tanggal</SelectItem>
            <SelectItem value="7">7 hari terakhir</SelectItem>
            <SelectItem value="30">30 hari terakhir</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilter ? (
          <Button type="button" variant="ghost" className="h-9 rounded-md text-xs text-zinc-500" onClick={resetFilters}>
            <X className="size-3" aria-hidden="true" /> Reset
          </Button>
        ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
        {[
          { value: "ALL", label: "Semua" },
          { value: "DRAFT", label: "Draft" },
          { value: "CLOSING_SOON", label: "Menunggu Review" },
          { value: "OPEN", label: "Disetujui" },
          { value: "CANCELLED", label: "Ditolak" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => changeStatus(tab.value)}
            className={`h-8 rounded-full px-3 text-xs ${
              syncedStatus === tab.value
                ? "bg-[#4f46e5] font-semibold text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
