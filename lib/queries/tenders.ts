import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildTenderOrderBy,
  buildTenderWhere,
  getTenderPagination,
  TenderQueryParams,
  toIsoString,
} from "./tender-utils";

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
