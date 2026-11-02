"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { TENDER_DOCUMENT_BUCKET } from "../../../lib/storage";
import { tenderFormSchema, type TenderFormInput } from "../../../schemas/tender";
import { tenderIdSchema } from "../../../schemas/tender-id";

export interface TenderActionData {
  id: string;
}

export interface TenderActionFieldErrors {
  referenceCode?: string[];
  title?: string[];
  organization?: string[];
  categoryId?: string[];
  hps?: string[];
  deadlineAt?: string[];
  status?: string[];
  description?: string[];
}

export interface TenderActionError {
  error: string;
  fieldErrors?: TenderActionFieldErrors;
}

export type TenderActionResult<T = TenderActionData> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: TenderActionFieldErrors };

function duplicateCodeError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2002";
  }
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function mapFieldErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): TenderActionFieldErrors {
  const result: TenderActionFieldErrors = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key in result || key === "root") continue;
    if (
      key === "referenceCode" ||
      key === "title" ||
      key === "organization" ||
      key === "categoryId" ||
      key === "hps" ||
      key === "deadlineAt" ||
      key === "status" ||
      key === "description"
    ) {
      result[key] = [issue.message];
    }
  }
  return result;
}

export async function createTender(
  input: TenderFormInput,
): Promise<TenderActionResult> {
  const parsed = tenderFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Data tender tidak valid.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });
    if (!category) {
      return {
        ok: false,
        error: "Kategori tidak valid.",
        fieldErrors: { categoryId: ["Kategori tidak ditemukan"] },
      };
    }

    const tender = await prisma.tender.create({
      data: {
        referenceCode: parsed.data.referenceCode,
        title: parsed.data.title,
        organization: parsed.data.organization,
        categoryId: parsed.data.categoryId,
        status: parsed.data.status,
        deadlineAt: new Date(parsed.data.deadlineAt),
        description: parsed.data.description,
      },
      select: { id: true },
    });
    revalidatePath("/dashboard");
    return { ok: true, data: tender };
  } catch (error) {
    if (duplicateCodeError(error)) {
      return {
        ok: false,
        error: "Kode tender sudah digunakan.",
        fieldErrors: { referenceCode: ["Kode tender sudah digunakan"] },
      };
    }
    console.error("Gagal membuat tender:", error);
    return { ok: false, error: "Gagal membuat tender." };
  }
}

export async function updateTender(
  tenderId: string,
  input: TenderFormInput,
): Promise<TenderActionResult> {
  const parsedId = tenderIdSchema.safeParse(tenderId);
  if (!parsedId.success) {
    return { ok: false, error: "ID tender tidak valid." };
  }

  const parsed = tenderFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Data tender tidak valid.",
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true },
    });
    if (!category) {
      return {
        ok: false,
        error: "Kategori tidak valid.",
        fieldErrors: { categoryId: ["Kategori tidak ditemukan"] },
      };
    }

    const tender = await prisma.tender.update({
      where: { id: parsedId.data },
      data: {
        referenceCode: parsed.data.referenceCode,
        title: parsed.data.title,
        organization: parsed.data.organization,
        categoryId: parsed.data.categoryId,
        status: parsed.data.status,
        deadlineAt: new Date(parsed.data.deadlineAt),
        description: parsed.data.description,
      },
      select: { id: true },
    });
    revalidatePath("/dashboard");
    return { ok: true, data: tender };
  } catch (error) {
    if (duplicateCodeError(error)) {
      return {
        ok: false,
        error: "Kode tender sudah digunakan.",
        fieldErrors: { referenceCode: ["Kode tender sudah digunakan"] },
      };
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2025"
    ) {
      return { ok: false, error: "Tender tidak ditemukan." };
    }
    console.error("Gagal memperbarui tender:", error);
    return { ok: false, error: "Gagal memperbarui tender." };
  }
}

export async function deleteTender(
  tenderId: string,
): Promise<TenderActionResult> {
  const parsedId = tenderIdSchema.safeParse(tenderId);
  if (!parsedId.success) {
    return { ok: false, error: "ID tender tidak valid." };
  }

  try {
    const tender = await prisma.tender.findUnique({
      where: { id: parsedId.data },
      select: {
        id: true,
        documents: { select: { fileUrl: true } },
      },
    });
    if (!tender) {
      return { ok: false, error: "Tender tidak ditemukan." };
    }

    const paths = tender.documents
      .map((document) => document.fileUrl)
      .filter((path) => path.length > 0);
    if (paths.length > 0) {
      const { error } = await supabaseAdmin.storage
        .from(TENDER_DOCUMENT_BUCKET)
        .remove(paths);
      if (error) {
        const status = Number(
          (error as { statusCode?: string | number }).statusCode,
        );
        const missing =
          status === 404 || error.message.toLowerCase().includes("not found");
        if (!missing) {
          return { ok: false, error: "Gagal menghapus dokumen tender." };
        }
      }
    }

    await prisma.tender.delete({
      where: { id: tender.id },
      select: { id: true },
    });
    revalidatePath("/dashboard");
    return { ok: true, data: { id: tender.id } };
  } catch (error) {
    console.error("Gagal menghapus tender:", error);
    return { ok: false, error: "Gagal menghapus tender." };
  }
}
