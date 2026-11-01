import { describe, expect, it } from "vitest";
import {
  ALLOWED_TYPES,
  documentFileSchema,
  MAX_FILE_SIZE,
} from "./document";

describe("document file upload schema", () => {
  it("accepts each allowed extension with its matching MIME type", () => {
    for (const rule of Object.values(ALLOWED_TYPES)) {
      const result = documentFileSchema.safeParse({
        name: `dokumen${rule.extension}`,
        size: 1024,
        type: rule.mimeTypes[0],
      });

      expect(result.success).toBe(true);
    }
  });

  it("rejects files larger than 10 MB", () => {
    const result = documentFileSchema.safeParse({
      name: "laporan.pdf",
      size: MAX_FILE_SIZE + 1,
      type: "application/pdf",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "size")).toBe(
        true,
      );
    }
  });

  it("rejects an extension not in the allowed list", () => {
    const result = documentFileSchema.safeParse({
      name: "malware.exe",
      size: 1024,
      type: "application/octet-stream",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a final extension that differs from an allowed preceding extension", () => {
    const result = documentFileSchema.safeParse({
      name: "a.pdf.exe",
      size: 1024,
      type: "application/pdf",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched extension and MIME type", () => {
    const result = documentFileSchema.safeParse({
      name: "report.pdf",
      size: 1024,
      type: "image/png",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty MIME type with a clear message", () => {
    const result = documentFileSchema.safeParse({
      name: "laporan.pdf",
      size: 1024,
      type: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("MIME type file wajib diisi"),
        ),
      ).toBe(true);
    }
  });
});
