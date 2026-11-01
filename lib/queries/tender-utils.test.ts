import { describe, expect, it } from "vitest";
import {
  buildTenderOrderBy,
  buildTenderWhere,
  getTenderPagination,
  normalizeTenderPage,
  TENDER_PAGE_SIZE,
  toIsoString,
} from "./tender-utils";

describe("tender query utilities", () => {
  it("builds a case-insensitive search across title, code, and organization", () => {
    const where = buildTenderWhere({ q: "Jembatan" });

    expect(where.OR).toEqual([
      { title: { contains: "Jembatan", mode: "insensitive" } },
      { referenceCode: { contains: "Jembatan", mode: "insensitive" } },
      { organization: { contains: "Jembatan", mode: "insensitive" } },
    ]);
  });

  it("combines status and category filters with search", () => {
    const where = buildTenderWhere({
      q: "jalan",
      status: "OPEN",
      category: "infrastruktur",
    });

    expect(where.status).toBe("OPEN");
    expect(where.category).toBeDefined();
    expect(where.OR).toBeDefined();
  });

  it("builds supported sort orders", () => {
    expect(buildTenderOrderBy("oldest")).toEqual({ createdAt: "asc" });
    expect(buildTenderOrderBy("deadline")).toEqual({ deadlineAt: "asc" });
    expect(buildTenderOrderBy("title")).toEqual({ title: "asc" });
    expect(buildTenderOrderBy("newest")).toEqual({ createdAt: "desc" });
  });

  it("normalizes invalid page values and clamps large pages", () => {
    expect(normalizeTenderPage(-1)).toBe(1);
    expect(normalizeTenderPage(0)).toBe(1);
    expect(normalizeTenderPage(undefined)).toBe(1);

    expect(getTenderPagination(999, 520)).toEqual({
      page: 26,
      pageSize: TENDER_PAGE_SIZE,
      totalPages: 26,
      skip: 500,
    });
  });

  it("uses page 1 for an empty result", () => {
    expect(getTenderPagination(999, 0)).toEqual({
      page: 1,
      pageSize: 20,
      totalPages: 1,
      skip: 0,
    });
  });

  it("serializes Date values to ISO and preserves null", () => {
    expect(toIsoString(new Date("2026-11-01T00:00:00.000Z"))).toBe(
      "2026-11-01T00:00:00.000Z",
    );
    expect(toIsoString(null)).toBeNull();
  });
});
