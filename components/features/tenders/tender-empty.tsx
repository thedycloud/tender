"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/hooks/use-url-state";

export function TenderEmpty() {
  return (
    <div className="p-4">
      <EmptyState
        variant="initial"
        title="Belum ada tender"
        description="Belum ada tender yang tersedia untuk ditampilkan."
      />
    </div>
  );
}

interface TenderNoResultsProps {
  description: string;
}

export function TenderNoResults({ description }: TenderNoResultsProps) {
  const urlState = useUrlState();

  function resetFilters() {
    urlState.push(
      { q: null, status: null, category: null, page: null },
      { scroll: false },
    );
  }

  return (
    <div className="p-4">
      <EmptyState
        variant="no-results"
        title="Tidak ada hasil"
        description={description}
        action={
          <Button type="button" onClick={resetFilters}>
            Reset filter
          </Button>
        }
      />
    </div>
  );
}
