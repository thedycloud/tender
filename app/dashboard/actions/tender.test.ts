// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  categoryFindUnique: vi.fn(),
  tenderCreate: vi.fn(),
  tenderUpdate: vi.fn(),
  tenderFindUnique: vi.fn(),
  tenderDelete: vi.fn(),
  storageRemove: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    category: { findUnique: mocks.categoryFindUnique },
    tender: {
      create: mocks.tenderCreate,
      update: mocks.tenderUpdate,
      findUnique: mocks.tenderFindUnique,
      delete: mocks.tenderDelete,
    },
  },
}));

vi.mock("../../../lib/supabase/admin", () => ({
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({ remove: mocks.storageRemove })),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
  },
}));

import { createTender, deleteTender, updateTender } from "./tender";

const validTender = {
  referenceCode: "T-NEW",
  title: "Tender Pengadaan Laptop",
  organization: "Kementerian",
  categoryId: "category-1",
  hps: 1_500_000_000,
  deadlineAt: "2026-12-31T00:00:00.000Z",
  status: "OPEN" as const,
  description: "Pengadaan perangkat",
};

describe("tender actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a tender and revalidates the dashboard", async () => {
    mocks.categoryFindUnique.mockResolvedValue({ id: "category-1" });
    mocks.tenderCreate.mockResolvedValue({ id: "tender-1" });

    const result = await createTender(validTender);

    expect(result).toEqual({ ok: true, data: { id: "tender-1" } });
    expect(mocks.tenderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceCode: "T-NEW",
          categoryId: "category-1",
        }),
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a field error when reference code is duplicated", async () => {
    mocks.categoryFindUnique.mockResolvedValue({ id: "category-1" });
    mocks.tenderCreate.mockRejectedValue({ code: "P2002" });

    const result = await createTender(validTender);

    expect(result).toEqual({
      ok: false,
      error: "Kode tender sudah digunakan.",
      fieldErrors: { referenceCode: ["Kode tender sudah digunakan"] },
    });
  });

  it("updates an existing tender", async () => {
    mocks.categoryFindUnique.mockResolvedValue({ id: "category-1" });
    mocks.tenderUpdate.mockResolvedValue({ id: "tender-1" });

    const result = await updateTender("tender-1", validTender);

    expect(result).toEqual({ ok: true, data: { id: "tender-1" } });
    expect(mocks.tenderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "tender-1" } }),
    );
  });

  it("deletes Storage objects before deleting the tender database record", async () => {
    mocks.tenderFindUnique.mockResolvedValue({
      id: "tender-1",
      documents: [
        { fileUrl: "tenders/tender-1/a.pdf" },
        { fileUrl: "tenders/tender-1/b.xlsx" },
      ],
    });
    mocks.storageRemove.mockResolvedValue({ data: null, error: null });
    mocks.tenderDelete.mockResolvedValue({ id: "tender-1" });

    const result = await deleteTender("tender-1");

    expect(result).toEqual({ ok: true, data: { id: "tender-1" } });
    expect(mocks.storageRemove).toHaveBeenCalledWith([
      "tenders/tender-1/a.pdf",
      "tenders/tender-1/b.xlsx",
    ]);
    expect(mocks.tenderDelete).toHaveBeenCalledWith({
      where: { id: "tender-1" },
      select: { id: true },
    });
  });

  it("does not delete the tender when Storage deletion fails", async () => {
    mocks.tenderFindUnique.mockResolvedValue({
      id: "tender-1",
      documents: [{ fileUrl: "tenders/tender-1/a.pdf" }],
    });
    mocks.storageRemove.mockResolvedValue({
      data: null,
      error: { message: "Storage unavailable", statusCode: 500 },
    });

    const result = await deleteTender("tender-1");

    expect(result).toEqual({
      ok: false,
      error: "Gagal menghapus dokumen tender.",
    });
    expect(mocks.tenderDelete).not.toHaveBeenCalled();
  });
});
