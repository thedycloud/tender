// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFindUnique, mockCreateSignedUploadUrl } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreateSignedUploadUrl: vi.fn(),
}));

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    tender: {
      findUnique: mockFindUnique,
    },
  },
}));

vi.mock("../../../lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        createSignedUploadUrl: mockCreateSignedUploadUrl,
      })),
    },
  },
}));

import { createUploadTicket } from "./document";

describe("createUploadTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid file metadata before database or storage access", async () => {
    const result = await createUploadTicket({
      tenderId: "tender-1",
      file: {
        name: "malware.exe",
        size: 1024,
        type: "application/octet-stream",
      },
    });

    expect(result.ok).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreateSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 10 MB", async () => {
    const result = await createUploadTicket({
      tenderId: "tender-1",
      file: {
        name: "laporan.pdf",
        size: 10 * 1024 * 1024 + 1,
        type: "application/pdf",
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Ukuran file maksimal 10 MB");
    }
  });

  it("rejects a tender that does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await createUploadTicket({
      tenderId: "tender-hilang",
      file: {
        name: "laporan.pdf",
        size: 1024,
        type: "application/pdf",
      },
    });

    expect(result).toEqual({
      ok: false,
      error: "Tender tidak ditemukan.",
    });
    expect(mockCreateSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("returns a signed upload ticket and safe storage path", async () => {
    mockFindUnique.mockResolvedValue({ id: "tender-1" });
    mockCreateSignedUploadUrl.mockResolvedValue({
      data: {
        path: "tenders/tender-1/generated-laporan.pdf",
        token: "signed-token",
      },
      error: null,
    });

    const result = await createUploadTicket({
      tenderId: "tender-1",
      file: {
        name: "laporan.pdf",
        size: 1024,
        type: "application/pdf",
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.token).toBe("signed-token");
      expect(result.data.path).toMatch(/^tenders\/tender-1\/.+-laporan\.pdf$/);
    }
    expect(mockCreateSignedUploadUrl).toHaveBeenCalledOnce();
  });
});
