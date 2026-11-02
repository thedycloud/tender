import { z } from "zod";

export const TENDER_STATUSES = [
  "DRAFT",
  "OPEN",
  "CLOSING_SOON",
  "CLOSED",
  "CANCELLED",
] as const;

export const TENDER_SORT_OPTIONS = [
  "newest",
  "oldest",
  "deadline",
  "title",
  "title_asc",
  "title_desc",
] as const;

export type TenderSort = (typeof TENDER_SORT_OPTIONS)[number];

const firstSearchParam = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}, z.unknown());

const optionalText = z.preprocess((value) => {
  const parsed = firstSearchParam.parse(value);
  if (typeof parsed !== "string") {
    return undefined;
  }

  const trimmed = parsed.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional().catch(undefined));

export const tenderQuerySchema = z.object({
  q: z.preprocess(
    (value) => {
      const parsed = firstSearchParam.parse(value);
      return typeof parsed === "string" ? parsed.trim() : "";
    },
    z.string().catch(""),
  ),
  status: z.preprocess(
    (value) => {
      const parsed = firstSearchParam.parse(value);
      if (typeof parsed !== "string") {
        return "ALL";
      }

      const normalized = parsed.trim().toUpperCase();
      return normalized.length === 0 || normalized === "ALL"
        ? "ALL"
        : normalized;
    },
    z.enum(["ALL", ...TENDER_STATUSES]).catch("ALL"),
  ),
  category: optionalText,
  sort: z.preprocess(
    (value) => {
      const parsed = firstSearchParam.parse(value);
      return typeof parsed === "string" ? parsed.trim().toLowerCase() : "newest";
    },
    z.enum(TENDER_SORT_OPTIONS).catch("newest"),
  ),
  page: z.preprocess(
    (value) => {
      const parsed = firstSearchParam.parse(value);
      if (typeof parsed !== "string" && typeof parsed !== "number") {
        return 1;
      }

      const number = Number(parsed);
      return Number.isInteger(number) && number >= 1 ? number : 1;
    },
    z.number().int().min(1).catch(1),
  ),
  tender: optionalText,
});

export type TenderQuery = z.infer<typeof tenderQuerySchema>;

export function parseTenderQuery(
  input: Record<string, string | string[] | undefined> = {},
): TenderQuery {
  return tenderQuerySchema.parse(input);
}
