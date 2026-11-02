"use client";

import { useQuery } from "@tanstack/react-query";
import type { ActionResult, TenderDetailDTO } from "@/types/tender";

export class TenderNotFoundError extends Error {
  constructor() {
    super("Tender tidak ditemukan.");
    this.name = "TenderNotFoundError";
  }
}

export async function fetchTenderDetail(
  id: string,
): Promise<TenderDetailDTO> {
  const response = await fetch(`/api/tenders/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new TenderNotFoundError();
    }
    throw new Error(`Gagal memuat detail tender (${response.status})`);
  }

  const result = (await response.json()) as ActionResult<TenderDetailDTO>;
  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.data;
}

export function useTenderDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: ["tender-detail", id],
    queryFn: () => fetchTenderDetail(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
    gcTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof TenderNotFoundError) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
