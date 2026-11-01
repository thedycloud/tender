import { Prisma, TenderStatus } from "@prisma/client";

export const TENDER_PAGE_SIZE = 20;

export interface TenderQueryParams {
  q?: string;
  status?: TenderStatus | "ALL";
  category?: string;
  sort?: "newest" | "oldest" | "deadline" | "title";
  page?: number;
}

export function normalizeTenderPage(page: number | undefined): number {
  return Number.isInteger(page) && Number(page) >= 1 ? Number(page) : 1;
}

export function buildTenderWhere(
  params: TenderQueryParams = {},
): Prisma.TenderWhereInput {
  const where: Prisma.TenderWhereInput = {};
  const q = params.q?.trim();

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { referenceCode: { contains: q, mode: "insensitive" } },
      { organization: { contains: q, mode: "insensitive" } },
    ];
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params.category?.trim()) {
    const category = params.category.trim();
    where.category = {
      OR: [
        { id: category },
        { slug: { equals: category, mode: "insensitive" } },
        { name: { equals: category, mode: "insensitive" } },
      ],
    };
  }

  return where;
}

export function buildTenderOrderBy(
  sort: TenderQueryParams["sort"] = "newest",
): Prisma.TenderOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "deadline":
      return { deadlineAt: "asc" };
    case "title":
      return { title: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export function getTenderPagination(
  page: number | undefined,
  total: number,
): {
  page: number;
  pageSize: number;
  totalPages: number;
  skip: number;
} {
  const requestedPage = normalizeTenderPage(page);
  const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / TENDER_PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);

  return {
    page: safePage,
    pageSize: TENDER_PAGE_SIZE,
    totalPages,
    skip: (safePage - 1) * TENDER_PAGE_SIZE,
  };
}

export function toIsoString(
  value: Date | string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.toISOString();
}
