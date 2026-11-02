import { Prisma } from "@prisma/client";

export const select = {
  id: true,
  title: true,
  referenceCode: true,
  description: true,
  organization: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  status: true,
  deadlineAt: true,
  publishedAt: true,
  documents: {
    select: {
      id: true,
      name: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      status: true,
      tenderId: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      documents: true,
    },
  },
} satisfies Prisma.TenderSelect;

export type TenderListItem = Prisma.TenderGetPayload<{
  select: typeof select;
}>;

export type TenderDetail = TenderListItem;

export interface TenderStatsDTO {
  total: number;
  byStatus: Record<
    "DRAFT" | "OPEN" | "CLOSING_SOON" | "CLOSED" | "CANCELLED",
    number
  >;
  dueSoon: number;
}

export const tenderSelect = select;
export const tenderListSelect = select;
export const tenderDetailSelect = select;

export type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

export interface TenderCategoryDTO {
  id: string;
  name: string;
  slug: string;
}

export interface TenderDocumentDTO {
  id: string;
  name: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  status: string;
  tenderId: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenderListItemDTO {
  id: string;
  title: string;
  referenceCode: string;
  organization: string | null;
  categoryId: string | null;
  category: TenderCategoryDTO | null;
  status: TenderListItem["status"];
  deadlineAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    documents: number;
  };
  hps?: number | string | null;
}

export interface TenderDetailDTO extends TenderListItemDTO {
  description: string | null;
  documents: TenderDocumentDTO[];
}

/* ---------- Opsi kategori (untuk filter & form) ---------- */

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};
