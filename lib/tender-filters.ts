import type { CategoryOption } from "../types/tender";
import type { TenderQuery } from "../schemas/tender-query";
import { TENDER_STATUS_PRESENTATION } from "./tender-status";

export function hasActiveFilters(
  query: Pick<TenderQuery, "q" | "status" | "category">,
  category?: CategoryOption | null,
): boolean {
  return Boolean(
    query.q.trim() ||
      (query.status && query.status !== "ALL") ||
      (query.category && category),
  );
}

export function getTenderFilterSummaryParts(
  query: Pick<TenderQuery, "q" | "status" | "category">,
  category?: CategoryOption | null,
): string[] {
  const parts: string[] = [];

  if (query.q.trim()) {
    parts.push(`kata kunci "${query.q.trim()}"`);
  }

  if (query.status && query.status !== "ALL") {
    parts.push(`status ${TENDER_STATUS_PRESENTATION[query.status].label}`);
  }

  if (query.category && category) {
    parts.push(`kategori ${category.name}`);
  }

  return parts;
}

export function buildTenderFilterSummary(
  query: Pick<TenderQuery, "q" | "status" | "category">,
  category?: CategoryOption | null,
): string {
  const parts = getTenderFilterSummaryParts(query, category);

  if (
    parts.length === 1 &&
    query.q.trim() &&
    query.status === "ALL" &&
    !category
  ) {
    return `Tidak ada tender dengan ${parts[0]}.`;
  }

  if (parts.length === 0) {
    return "Tidak ada tender yang cocok dengan filter.";
  }

  return `Tidak ada tender yang cocok untuk ${parts.join(", ")}.`;
}

export const isTenderFilterActive = hasActiveFilters;
export const summarizeTenderFilters = buildTenderFilterSummary;
