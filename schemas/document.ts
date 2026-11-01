import { z } from "zod";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_TYPES = {
  pdf: {
    extension: ".pdf",
    mimeTypes: ["application/pdf"],
  },
  docx: {
    extension: ".docx",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  xlsx: {
    extension: ".xlsx",
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
} as const;

const FILE_METADATA_SCHEMA = z.object({
  name: z.string().trim().min(1, "Nama file wajib diisi"),
  size: z.number().int("Ukuran file harus berupa bilangan bulat"),
  type: z.string(),
});

export const documentFileSchema = z
  .preprocess((value) => {
    if (typeof value !== "object" || value === null) {
      return value;
    }

    const file = value as {
      name?: unknown;
      fileName?: unknown;
      size?: unknown;
      type?: unknown;
      mimeType?: unknown;
    };

    return {
      name: file.name ?? file.fileName,
      size: file.size,
      type: file.type ?? file.mimeType,
    };
  }, FILE_METADATA_SCHEMA)
  .superRefine((file, ctx) => {
    if (file.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: "custom",
        message: "Ukuran file maksimal 10 MB",
        path: ["size"],
      });
    }

    if (!file.type.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "MIME type file wajib diisi",
        path: ["type"],
      });
      return;
    }

    const lowerName = file.name.toLowerCase();
    const lowerType = file.type.toLowerCase();
    const matchedRule = Object.values(ALLOWED_TYPES).find((rule) =>
      lowerName.endsWith(rule.extension),
    );

    if (!matchedRule) {
      ctx.addIssue({
        code: "custom",
        message: "Ekstensi file harus PDF, DOCX, atau XLSX",
        path: ["name"],
      });
      return;
    }

    if (!matchedRule.mimeTypes.some((mimeType) => mimeType === lowerType)) {
      ctx.addIssue({
        code: "custom",
        message: `MIME type tidak sesuai dengan ekstensi ${matchedRule.extension}`,
        path: ["type"],
      });
    }
  });

export const documentUploadSchema = documentFileSchema;
