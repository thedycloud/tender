import { describe, expect, it } from "vitest";
import {
  assertSafeStoragePath,
  buildTenderDocumentPath,
  sanitizeFileName,
  sanitizeStorageSegment,
  TENDER_DOCUMENT_BUCKET,
} from "./storage";

describe("storage helpers", () => {
  it("exports the private tender document bucket name", () => {
    expect(TENDER_DOCUMENT_BUCKET).toBe("tender-documents");
  });

  it("sanitizes spaces, Unicode accents, and unsafe characters", () => {
    expect(sanitizeFileName("Berita   Acara Résumé.pdf")).toBe(
      "berita-acara-resume.pdf",
    );
  });

  it("removes traversal markers and separators from file names", () => {
    expect(sanitizeFileName("../../Laporan Rahasia.pdf")).toBe(
      "laporan-rahasia.pdf",
    );
    expect(sanitizeFileName("a\\b/c?.pdf")).toBe("a-b-c-.pdf");
  });

  it("provides a fallback for a file name with no usable characters", () => {
    expect(sanitizeFileName("...")).toBe("document");
  });

  it("builds a deterministic tender document path", () => {
    expect(
      buildTenderDocumentPath(
        "tender-123",
        "Berita Acara.pdf",
        "550e8400-e29b-41d4-a716-446655440000",
      ),
    ).toBe(
      "tenders/tender-123/550e8400-e29b-41d4-a716-446655440000-berita-acara.pdf",
    );
  });

  it("rejects traversal in a storage path", () => {
    expect(() => assertSafeStoragePath("../secret/file.pdf")).toThrow();
    expect(() => assertSafeStoragePath("tenders/../../file.pdf")).toThrow();
    expect(() => assertSafeStoragePath("tenders//file.pdf")).toThrow();
  });

  it("accepts a safe storage path", () => {
    expect(() =>
      assertSafeStoragePath(
        "tenders/tender-123/550e8400-file.pdf",
      ),
    ).not.toThrow();
  });

  it("does not return traversal segments as identifiers", () => {
    expect(sanitizeStorageSegment("../secret")).toBe("item");
    expect(sanitizeStorageSegment("")).toBe("item");
  });
});
