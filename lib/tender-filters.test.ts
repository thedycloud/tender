import { describe, expect, it } from "vitest";
import {
  buildTenderFilterSummary,
  getTenderFilterSummaryParts,
  hasActiveFilters,
} from "./tender-filters";
import type { TenderQuery } from "@/schemas/tender-query";

const query = (
  overrides: Partial<TenderQuery> = {},
): Pick<TenderQuery, "q" | "status" | "category"> => ({
  q: "",
  status: "ALL",
  category: undefined,
  ...overrides,
});

describe("tender filters", () => {
  it("detects active q, status, and valid category filters", () => {
    expect(hasActiveFilters(query({ q: "jembatan" }))).toBe(true);
    expect(hasActiveFilters(query({ status: "OPEN" }))).toBe(true);
    expect(
      hasActiveFilters(
        query({ category: "jalan" }),
        { id: "1", name: "Jalan", slug: "jalan" },
      ),
    ).toBe(true);
  });

  it("ignores an invalid category value", () => {
    expect(hasActiveFilters(query({ category: "ngawur" }))).toBe(false);
  });

  it("summarizes search and status filters with comma separation", () => {
    const parts = getTenderFilterSummaryParts(
      query({ q: "zzzz", status: "CANCELLED" }),
    );
    expect(parts.join(", ")).toContain("kata kunci");
    expect(parts.join(", ")).toContain("status Dibatalkan");
  });

  it("formats a search-only empty result", () => {
    expect(buildTenderFilterSummary(query({ q: "zzzzzzzz" }))).toBe(
      'Tidak ada tender dengan kata kunci "zzzzzzzz".',
    );
  });
});
