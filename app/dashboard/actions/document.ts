"use server";

import { z } from "zod";
import { documentUploadSchema, documentFileSchema } from "../../../schemas/document";
import { tenderIdSchema } from "../../../schemas/tender-id";
import {
  assertSafeStoragePath,
  buildTenderDocumentPath,
  TENDER_DOCUMENT_BUCKET,
} from "../../../lib/storage";
import { prisma } from "../../../lib/prisma";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import type { ActionResult } from "../../../types/tender";

export interface UploadTicket {
  path: string;
  token: string;
  signedUrl: string;
}

const createUploadTicketSchema = z.object({
  tenderId: tenderIdSchema,
  file: documentUploadSchema,
});

export type CreateUploadTicketInput = z.input<typeof createUploadTicketSchema>;

const commitDocumentSchema = z.object({
  tenderId: tenderIdSchema,
  path: z.string().trim().min(1, "Path dokumen wajib diisi"),
  fileName: z.string().trim().min(1, "Nama file wajib diisi"),
});

export type CommitDocumentInput = z.input<typeof commitDocumentSchema>;

const documentIdSchema = z.string().trim().min(1, "Dokumen tidak valid.");

export async function createUploadTicket(
  input: CreateUploadTicketInput,
): Promise<ActionResult<UploadTicket>> {
  const parsed = createUploadTicketSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data upload tidak valid.",
    };
  }

  try {
    const tender = await prisma.tender.findUnique({
      where: { id: parsed.data.tenderId },
      select: { id: true },
    });

    if (!tender) {
      return {
        ok: false,
        error: "Tender tidak ditemukan.",
      };
    }

    const path = buildTenderDocumentPath(
      parsed.data.tenderId,
      parsed.data.file.name,
    );
    const { data, error } = await supabaseAdmin.storage
      .from(TENDER_DOCUMENT_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.token) {
      console.error("Gagal membuat tiket upload dokumen:", error);
      return {
        ok: false,
        error: "Gagal menyiapkan upload dokumen.",
      };
    }

    return {
      ok: true,
      data: {
        path: data.path ?? path,
        token: data.token,
        signedUrl: data.signedUrl,
      },
    };
  } catch (error) {
    console.error("Gagal membuat tiket upload dokumen:", error);
    return {
      ok: false,
      error: "Gagal menyiapkan upload dokumen.",
    };
  }
}

export async function commitDocument(
  input: CommitDocumentInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = commitDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data dokumen tidak valid.",
    };
  }

  try {
    assertSafeStoragePath(parsed.data.path);
    const normalizedPath = parsed.data.path.replace(/\\/g, "/");
    const expectedPrefix = `tenders/${parsed.data.tenderId}/`;

    if (!normalizedPath.startsWith(expectedPrefix)) {
      return {
        ok: false,
        error: "Path dokumen tidak valid untuk tender ini.",
      };
    }

    const tender = await prisma.tender.findUnique({
      where: { id: parsed.data.tenderId },
      select: {
        id: true,
        categoryId: true,
      },
    });

    if (!tender) {
      return {
        ok: false,
        error: "Tender tidak ditemukan.",
      };
    }

    const lastSlash = normalizedPath.lastIndexOf("/");
    const folder = normalizedPath.slice(0, lastSlash);
    const objectName = normalizedPath.slice(lastSlash + 1);
    const storage = supabaseAdmin.storage.from(TENDER_DOCUMENT_BUCKET);
    const { data: objects, error: listError } = await storage.list(folder, {
      search: objectName,
    });

    if (listError || !objects) {
      return {
        ok: false,
        error: "Gagal memverifikasi dokumen di penyimpanan.",
      };
    }

    const object = objects.find((item) => item.name === objectName);
    if (!object || !object.metadata) {
      return {
        ok: false,
        error: "Dokumen tidak ditemukan di penyimpanan.",
      };
    }

    const metadataResult = documentFileSchema.safeParse({
      name: parsed.data.fileName,
      size: object.metadata.size,
      type: object.metadata.mimetype,
    });

    if (!metadataResult.success) {
      return {
        ok: false,
        error: metadataResult.error.issues[0]?.message ?? "Dokumen tidak valid.",
      };
    }

    try {
      const document = await prisma.document.create({
        data: {
          name: parsed.data.fileName,
          fileName: parsed.data.fileName,
          fileUrl: normalizedPath,
          fileSize: metadataResult.data.size,
          mimeType: metadataResult.data.type,
          tenderId: tender.id,
          categoryId: tender.categoryId,
        },
        select: { id: true },
      });

      return {
        ok: true,
        data: document,
      };
    } catch (error) {
      console.error("Gagal menyimpan metadata dokumen:", error);
      const { error: removeError } = await storage.remove([normalizedPath]);
      if (removeError) {
        console.error("Gagal membersihkan objek dokumen:", removeError);
      }
      return {
        ok: false,
        error: "Gagal menyimpan metadata dokumen.",
      };
    }
  } catch (error) {
    console.error("Gagal menyimpan dokumen:", error);
    return {
      ok: false,
      error: "Gagal menyimpan dokumen.",
    };
  }
}

export async function getDownloadUrl(
  documentId: string,
): Promise<ActionResult<{ url: string }>> {
  const parsedId = documentIdSchema.safeParse(documentId);
  if (!parsedId.success) {
    return {
      ok: false,
      error: parsedId.error.issues[0]?.message ?? "Dokumen tidak valid.",
    };
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: parsedId.data },
      select: {
        fileUrl: true,
        fileName: true,
      },
    });

    if (!document) {
      return {
        ok: false,
        error: "Dokumen tidak ditemukan.",
      };
    }

    const { data, error } = await supabaseAdmin.storage
      .from(TENDER_DOCUMENT_BUCKET)
      .createSignedUrl(document.fileUrl, 60, {
        download: document.fileName,
      });

    if (error || !data?.signedUrl) {
      console.error("Gagal membuat URL unduh dokumen:", error);
      return {
        ok: false,
        error: "Gagal menyiapkan URL unduh dokumen.",
      };
    }

    return {
      ok: true,
      data: { url: data.signedUrl },
    };
  } catch (error) {
    console.error("Gagal membuat URL unduh dokumen:", error);
    return {
      ok: false,
      error: "Gagal menyiapkan URL unduh dokumen.",
    };
  }
}

export async function deleteDocument(
  documentId: string,
): Promise<ActionResult<{ id: string }>> {
  const parsedId = documentIdSchema.safeParse(documentId);
  if (!parsedId.success) {
    return {
      ok: false,
      error: parsedId.error.issues[0]?.message ?? "Dokumen tidak valid.",
    };
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: parsedId.data },
      select: {
        id: true,
        fileUrl: true,
      },
    });

    if (!document) {
      return {
        ok: false,
        error: "Dokumen tidak ditemukan.",
      };
    }

    const storage = supabaseAdmin.storage.from(TENDER_DOCUMENT_BUCKET);
    const { error: storageError } = await storage.remove([document.fileUrl]);
    const storageErrorStatus = storageError
      ? Number((storageError as { statusCode?: string | number }).statusCode)
      : undefined;
    const storageObjectMissing =
      storageErrorStatus === 404 ||
      storageError?.message.toLowerCase().includes("not found") === true;

    if (storageError && !storageObjectMissing) {
      return {
        ok: false,
        error: "Gagal menghapus dokumen dari penyimpanan.",
      };
    }

    await prisma.document.delete({
      where: { id: document.id },
      select: { id: true },
    });

    return {
      ok: true,
      data: { id: document.id },
    };
  } catch (error) {
    console.error("Gagal menghapus dokumen:", error);
    return {
      ok: false,
      error: "Gagal menghapus dokumen.",
    };
  }
}
