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
    <div className="border-b px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="w-full md:max-w-md">
          <SearchInput initialQuery={initialQuery} />
        </div>

        <Select value={syncedStatus} onValueChange={changeStatus}>
          <SelectTrigger aria-label="Filter status" className="w-full md:w-44">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua status</SelectItem>
            {TENDER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {TENDER_STATUS_PRESENTATION[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={syncedCategory} onValueChange={changeCategory}>
          <SelectTrigger aria-label="Filter kategori" className="w-full md:w-52">
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

        {hasActiveFilter ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full md:w-auto"
            onClick={resetFilters}
          >
            <X aria-hidden="true" />
            Reset filter
          </Button>
        ) : null}
      </div>
    </div>
  );
}
