import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseTenderId, tenderIdSchema } from "../../../../schemas/tender-id";
import type { TenderDetailDTO } from "../../../../types/tender";

const { getTenderDetail } = vi.hoisted(() => ({
  getTenderDetail: vi.fn(),
}));

vi.mock("../../../../lib/queries/tenders", () => ({
  getTenderDetail,
}));

import { GET } from "./route";

const detail: TenderDetailDTO = {
  id: "real-tender-id",
  title: "Tender Jembatan",
  referenceCode: "TND-001",
  organization: "Instansi Contoh",
  categoryId: null,
  category: null,
  status: "OPEN",
  deadlineAt: null,
  publishedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  description: null,
  documents: [],
  _count: {
    documents: 0,
  },
};

describe("tender ID schema", () => {
  it("accepts a normal or seeded-style ID", () => {
    expect(tenderIdSchema.safeParse("real-tender-id").success).toBe(true);
    expect(parseTenderId("id_ngawur-123")).toBe("id_ngawur-123");
  });

  it("rejects empty and whitespace-containing IDs", () => {
    expect(tenderIdSchema.safeParse("a b").success).toBe(false);
    expect(tenderIdSchema.safeParse("   ").success).toBe(false);
  });
});

describe("GET /api/tenders/[id]", () => {
  beforeEach(() => {
    getTenderDetail.mockReset();
  });

  it("returns detail with an empty documents list", async () => {
    getTenderDetail.mockResolvedValue(detail);

    const response = await GET(new Request("http://localhost/api/tenders/real-tender-id"), {
      params: Promise.resolve({ id: "real-tender-id" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: detail,
    });
    expect(getTenderDetail).toHaveBeenCalledWith("real-tender-id");
  });

  it("returns 404 for an unknown valid ID", async () => {
    getTenderDetail.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/tenders/id-ngawur-123"), {
      params: Promise.resolve({ id: "id-ngawur-123" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Tender tidak ditemukan.",
    });
  });

  it("returns 400 for an invalid ID", async () => {
    const response = await GET(new Request("http://localhost/api/tenders/a%20b"), {
      params: Promise.resolve({ id: "a b" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "ID tender tidak valid.",
    });
    expect(getTenderDetail).not.toHaveBeenCalled();
  });
});
