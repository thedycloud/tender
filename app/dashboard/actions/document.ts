"use server";

import { z } from "zod";
import { documentUploadSchema } from "../../../schemas/document";
import { tenderIdSchema } from "../../../schemas/tender-id";
import { buildTenderDocumentPath, TENDER_DOCUMENT_BUCKET } from "../../../lib/storage";
import { prisma } from "../../../lib/prisma";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import type { ActionResult } from "../../../types/tender";

export interface UploadTicket {
  path: string;
  token: string;
}

const createUploadTicketSchema = z.object({
  tenderId: tenderIdSchema,
  file: documentUploadSchema,
});

export type CreateUploadTicketInput = z.input<typeof createUploadTicketSchema>;

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
