export type TenderSortField = "title";
export type TenderSortDirection = "asc" | "desc";
export type TenderSortValue =
  | "newest"
  | "oldest"
  | "deadline"
  | "title"
  | "title_asc"
  | "title_desc";

export function parseTenderSort(
  value: string | null | undefined,
  field: TenderSortField = "title",
): TenderSortValue | null {
  if (!value) {
    return null;
  }

  if (field === "title" && (value === "title_asc" || value === "title_desc")) {
    return value;
  }

  return null;
}

export function getTenderSortDirection(
  sort: string | null | undefined,
  field: TenderSortField = "title",
): TenderSortDirection | null {
  const parsed = parseTenderSort(sort, field);
  if (!parsed) {
    return null;
  }

  return parsed.endsWith("_desc") ? "desc" : "asc";
}

export function getNextTenderSort(
  current: string | null | undefined,
  field: TenderSortField = "title",
): TenderSortValue | null {
  const direction = getTenderSortDirection(current, field);
  if (direction === null) {
    return `${field}_asc`;
  }
  if (direction === "asc") {
    return `${field}_desc`;
  }
  return null;
}

export const parseSort = parseTenderSort;
export const getNextSort = getNextTenderSort;
export const getSortDirection = getTenderSortDirection;
