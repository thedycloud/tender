import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildTenderOrderBy,
  buildTenderWhere,
  getTenderPagination,
  TenderQueryParams,
  toIsoString,
  TENDER_STATUSES,
  getDueSoonWhere,
} from "./tender-utils";
import type { TenderStatsDTO } from "@/types/tender";

export const tenderListSelect = {
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
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      documents: true,
    },
  },
} satisfies Prisma.TenderSelect;

export type TenderListRecord = Prisma.TenderGetPayload<{
  select: typeof tenderListSelect;
}>;

export interface TenderListItemDTO {
  id: string;
  title: string;
  referenceCode: string;
  description: string | null;
  organization: string | null;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  status: TenderListRecord["status"];
  deadlineAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    documents: number;
  };
}

export interface TenderListResult {
  items: TenderListItemDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function serializeTenderListItem(
  tender: TenderListRecord,
): TenderListItemDTO {
  return {
    ...tender,
    deadlineAt: toIsoString(tender.deadlineAt),
    publishedAt: toIsoString(tender.publishedAt),
    createdAt: toIsoString(tender.createdAt) ?? tender.createdAt.toISOString(),
    updatedAt: toIsoString(tender.updatedAt) ?? tender.updatedAt.toISOString(),
  };
}

export async function getTenders(
  params: TenderQueryParams = {},
): Promise<TenderListResult> {
  const where = buildTenderWhere(params);
  const orderBy = buildTenderOrderBy(params.sort);

  const { count, records, pagination } = await prisma.$transaction(
    async (tx) => {
      const count = await tx.tender.count({ where });
      const pagination = getTenderPagination(params.page, count);
      const records = await tx.tender.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.pageSize,
        select: tenderListSelect,
      });

      return { count, records, pagination };
    },
  );

  return {
    items: records.map(serializeTenderListItem),
    total: count,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

export const tenderDetailSelect = {
  ...tenderListSelect,
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
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.TenderSelect;

export type TenderDetailRecord = Prisma.TenderGetPayload<{
  select: typeof tenderDetailSelect;
}>;

export type TenderDocumentDTO = Omit<
  TenderDetailRecord["documents"][number],
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export type TenderDetailDTO = Omit<
  TenderDetailRecord,
  "deadlineAt" | "publishedAt" | "createdAt" | "updatedAt" | "documents"
> & {
  deadlineAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: TenderDocumentDTO[];
};

export async function getTenderDetail(
  id: string,
): Promise<TenderDetailDTO | null> {
  const tender = await prisma.tender.findUnique({
    where: { id },
    select: tenderDetailSelect,
  });

  if (!tender) {
    return null;
  }

  return {
    ...tender,
    deadlineAt: toIsoString(tender.deadlineAt),
    publishedAt: toIsoString(tender.publishedAt),
    createdAt: toIsoString(tender.createdAt) ?? tender.createdAt.toISOString(),
    updatedAt: toIsoString(tender.updatedAt) ?? tender.updatedAt.toISOString(),
    documents: tender.documents.map((document) => ({
      ...document,
      createdAt: toIsoString(document.createdAt) ?? document.createdAt.toISOString(),
      updatedAt: toIsoString(document.updatedAt) ?? document.updatedAt.toISOString(),
    })),
  };
}

export async function getTenderStats(
  now: Date = new Date(),
): Promise<TenderStatsDTO> {
  const [total, dueSoon, grouped] = await prisma.$transaction([
    prisma.tender.count(),
    prisma.tender.count({
      where: getDueSoonWhere(now),
    }),
    prisma.tender.groupBy({
      by: ["status"],
      _count: { status: true },
      orderBy: { status: "asc" },
    }),
  ]);

  const byStatus = Object.fromEntries(
    TENDER_STATUSES.map((status) => [status, 0]),
  ) as TenderStatsDTO["byStatus"];

  for (const group of grouped) {
    const statusCount =
      typeof group._count === "object" && group._count !== null
        ? group._count.status
        : undefined;
    byStatus[group.status] = statusCount ?? 0;
  }

  return {
    total,
    byStatus,
    dueSoon,
  };
}
