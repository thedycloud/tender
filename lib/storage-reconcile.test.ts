import { describe, expect, it } from "vitest";
import { findOrphanStoragePaths } from "./storage-reconcile";

describe("findOrphanStoragePaths", () => {
  it("returns paths present in Storage but absent from the database", () => {
    const result = findOrphanStoragePaths(
      [
        "tenders/tender-1/z.pdf",
        "tenders/tender-1/a.pdf",
        "tenders/tender-1/z.pdf",
      ],
      ["tenders/tender-1/z.pdf"],
    );

    expect(result).toEqual(["tenders/tender-1/a.pdf"]);
  });

  it("returns empty when all Storage paths are recorded", () => {
    expect(findOrphanStoragePaths(
      ["tenders/tender-1/a.pdf"],
      ["tenders/tender-1/a.pdf"],
    )).toEqual([]);
  });
});
