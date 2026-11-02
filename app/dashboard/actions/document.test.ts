// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFindUnique,
  mockDocumentFindUnique,
  mockDocumentCreate,
  mockDocumentDelete,
  mockCreateSignedUploadUrl,
  mockList,
  mockRemove,
  mockCreateSignedUrl,
} = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockDocumentFindUnique: vi.fn(),
  mockDocumentCreate: vi.fn(),
  mockDocumentDelete: vi.fn(),
  mockCreateSignedUploadUrl: vi.fn(),
  mockList: vi.fn(),
  mockRemove: vi.fn(),
  mockCreateSignedUrl: vi.fn(),
}));

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    tender: {
      findUnique: mockFindUnique,
    },
    document: {
      findUnique: mockDocumentFindUnique,
      create: mockDocumentCreate,
      delete: mockDocumentDelete,
    },
  },
}));

vi.mock("../../../lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        createSignedUploadUrl: mockCreateSignedUploadUrl,
        list: mockList,
        remove: mockRemove,
        createSignedUrl: mockCreateSignedUrl,
      })),
    },
  },
}));

import {
  commitDocument,
  createUploadTicket,
  deleteDocument,
  getDownloadUrl,
} from "./document";

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

describe("commitDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("commits metadata from Storage and creates the database record", async () => {
    mockFindUnique.mockResolvedValue({
      id: "tender-1",
      categoryId: "category-1",
    });
    mockList.mockResolvedValue({
      data: [{
        name: "ticket-laporan.pdf",
        metadata: {
          size: 2048,
          mimetype: "application/pdf",
        },
      }],
      error: null,
    });
    mockDocumentCreate.mockResolvedValue({ id: "document-1" });

    const result = await commitDocument({
      tenderId: "tender-1",
      path: "tenders/tender-1/ticket-laporan.pdf",
      fileName: "laporan.pdf",
    });

    expect(result).toEqual({
      ok: true,
      data: { id: "document-1" },
    });
    expect(mockDocumentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileSize: 2048,
          mimeType: "application/pdf",
          fileUrl: "tenders/tender-1/ticket-laporan.pdf",
        }),
      }),
    );
  });

  it("removes the Storage object when database commit fails", async () => {
    mockFindUnique.mockResolvedValue({
      id: "tender-1",
      categoryId: null,
    });
    mockList.mockResolvedValue({
      data: [{
        name: "ticket-laporan.pdf",
        metadata: {
          size: 2048,
          mimetype: "application/pdf",
        },
      }],
      error: null,
    });
    mockDocumentCreate.mockRejectedValue(new Error("database failed"));
    mockRemove.mockResolvedValue({ data: null, error: null });

    const result = await commitDocument({
      tenderId: "tender-1",
      path: "tenders/tender-1/ticket-laporan.pdf",
      fileName: "laporan.pdf",
    });

    expect(result).toEqual({
      ok: false,
      error: "Gagal menyimpan metadata dokumen.",
    });
    expect(mockRemove).toHaveBeenCalledWith([
      "tenders/tender-1/ticket-laporan.pdf",
    ]);
  });
});

describe("getDownloadUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a 60-second download URL with the original name", async () => {
    mockDocumentFindUnique.mockResolvedValue({
      fileUrl: "tenders/tender-1/laporan.pdf",
      fileName: "laporan.pdf",
    });
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://example.test/download" },
      error: null,
    });

    const result = await getDownloadUrl("document-1");

    expect(result).toEqual({
      ok: true,
      data: { url: "https://example.test/download" },
    });
    expect(mockCreateSignedUrl).toHaveBeenCalledWith(
      "tenders/tender-1/laporan.pdf",
      60,
      { download: "laporan.pdf" },
    );
  });
});

describe("deleteDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes Storage first, then the database record", async () => {
    mockDocumentFindUnique.mockResolvedValue({
      id: "document-1",
      fileUrl: "tenders/tender-1/laporan.pdf",
    });
    mockRemove.mockResolvedValue({ data: null, error: null });
    mockDocumentDelete.mockResolvedValue({ id: "document-1" });

    const result = await deleteDocument("document-1");

    expect(result).toEqual({
      ok: true,
      data: { id: "document-1" },
    });
    expect(mockRemove).toHaveBeenCalledWith([
      "tenders/tender-1/laporan.pdf",
    ]);
    expect(mockDocumentDelete).toHaveBeenCalledWith({
      where: { id: "document-1" },
      select: { id: true },
    });
  });

  it("does not delete the database record when Storage fails", async () => {
    mockDocumentFindUnique.mockResolvedValue({
      id: "document-1",
      fileUrl: "tenders/tender-1/laporan.pdf",
    });
    mockRemove.mockResolvedValue({
      data: null,
      error: { message: "Storage unavailable" },
    });

    const result = await deleteDocument("document-1");

    expect(result).toEqual({
      ok: false,
      error: "Gagal menghapus dokumen dari penyimpanan.",
    });
    expect(mockDocumentDelete).not.toHaveBeenCalled();
  });

  it("keeps Storage deletion success when the object is already absent", async () => {
    mockDocumentFindUnique.mockResolvedValue({
      id: "document-1",
      fileUrl: "tenders/tender-1/laporan.pdf",
    });
    mockRemove.mockResolvedValue({
      data: null,
      error: { message: "Object not found", statusCode: 404 },
    });
    mockDocumentDelete.mockResolvedValue({ id: "document-1" });

    const result = await deleteDocument("document-1");

    expect(result.ok).toBe(true);
    expect(mockDocumentDelete).toHaveBeenCalledOnce();
  });
});
