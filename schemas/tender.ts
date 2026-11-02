import { z } from "zod";

export const TENDER_STATUSES = [
  "DRAFT",
  "OPEN",
  "CLOSING_SOON",
  "CLOSED",
  "CANCELLED",
] as const;

const requiredText = (message: string) =>
  z.string({ message: `${message} wajib diisi` }).trim().min(1, `${message} wajib diisi`);

const positiveHps = z.union([
  z.number({
    error: "HPS harus berupa angka",
  }),
  z
    .string()
    .trim()
    .min(1, "HPS wajib diisi")
    .transform((value, ctx) => {
      const number = Number(value.replace(/[,_]/g, ""));
      if (!Number.isFinite(number)) {
        ctx.addIssue({
          code: "custom",
          message: "HPS harus berupa angka",
        });
        return z.NEVER;
      }
      return number;
    }),
]);

const deadline = z.union([
  z.string({ message: "Deadline wajib diisi" }).trim().min(1, "Deadline wajib diisi"),
  z.date({ message: "Tanggal deadline tidak valid" }),
]);

export const normalizedTenderFormSchema = z.object({
  referenceCode: requiredText("Kode tender"),
  title: requiredText("Judul tender"),
  organization: requiredText("Instansi"),
  categoryId: requiredText("Kategori"),
  hps: positiveHps.refine((value) => value >= 0, {
    message: "HPS tidak boleh negatif",
  }),
  deadlineAt: deadline.transform((value, ctx) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Tanggal deadline tidak valid",
      });
      return z.NEVER;
    }
    return value instanceof Date ? value.toISOString() : value;
  }),
  status: z.enum(TENDER_STATUSES, {
    error: "Status tidak valid",
  }),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
});

export const tenderFormSchema = z.preprocess((value) => {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  const input = value as Record<string, unknown>;
  const referenceCode = input.referenceCode ?? input.code;
  const organization = input.organization ?? input.agency ?? input.instansi;
  const categoryId = input.categoryId ?? input.category;
  const deadlineAt = input.deadlineAt ?? input.deadline;
  const hps = input.hps ?? input.HPS;
  const status =
    typeof input.status === "string" ? input.status.toUpperCase() : input.status;

  return {
    referenceCode,
    title: input.title,
    organization,
    categoryId,
    hps,
    deadlineAt,
    status,
    description: input.description,
  };
}, normalizedTenderFormSchema);

export const tenderSchema = tenderFormSchema;

export type TenderFormInput = z.input<typeof normalizedTenderFormSchema>;
export type TenderFormValues = z.output<typeof tenderFormSchema>;
