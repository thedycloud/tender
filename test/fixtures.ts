import type {
  TenderDetailDTO,
  TenderListItemDTO,
} from "../lib/queries/tenders";

export const tenderFixture: TenderDetailDTO = {
  id: "tender-1",
  title: "Pengadaan Jembatan Test",
  referenceCode: "TND-001",
  description: "Tender untuk pembangunan jembatan uji.",
  organization: "Dinas Pekerjaan Umum",
  categoryId: "category-1",
  category: {
    id: "category-1",
    name: "Jembatan",
    slug: "jembatan",
  },
  status: "OPEN",
  deadlineAt: "2026-12-31T00:00:00.000Z",
  publishedAt: "2026-11-01T00:00:00.000Z",
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
  documents: [],
  _count: {
    documents: 0,
  },
};

export const tenderListFixture: TenderListItemDTO = {
  id: tenderFixture.id,
  title: tenderFixture.title,
  referenceCode: tenderFixture.referenceCode,
  description: tenderFixture.description,
  organization: tenderFixture.organization,
  categoryId: tenderFixture.categoryId,
  category: tenderFixture.category,
  status: tenderFixture.status,
  deadlineAt: tenderFixture.deadlineAt,
  publishedAt: tenderFixture.publishedAt,
  createdAt: tenderFixture.createdAt,
  updatedAt: tenderFixture.updatedAt,
  _count: {
    documents: 0,
  },
};
