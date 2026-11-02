"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ErrorState } from "../../shared/error-state";
import { EmptyState } from "../../shared/empty-state";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import { useUrlState } from "../../../hooks/use-url-state";
import {
  TenderNotFoundError,
  useTenderDetail,
} from "../../../hooks/use-tender-detail";
import { tenderIdSchema } from "../../../schemas/tender-id";
import { TenderDetail } from "./tender-detail";
import { captureTenderFocus, restoreTenderFocus } from "../../../lib/focus";
import { deleteTender } from "../../../app/dashboard/actions/tender";
import type { CategoryOption } from "../../../types/tender";

export function TenderDrawer({ categories = [] }: { categories?: CategoryOption[] }) {
  const searchParams = useSearchParams();
  const urlState = useUrlState();
  const router = useRouter();
  const queryClient = useQueryClient();
  const rawId = searchParams.get("tender");
  const parsedId = tenderIdSchema.safeParse(rawId);
  const tenderId = parsedId.success ? parsedId.data : null;
  const detail = useTenderDetail(tenderId);
  const previousTenderId = useRef<string | null>(null);

  useEffect(() => {
    if (tenderId && tenderId !== previousTenderId.current) {
      captureTenderFocus(tenderId);
    }
    if (previousTenderId.current && previousTenderId.current !== tenderId) {
      restoreTenderFocus(previousTenderId.current);
    }
    previousTenderId.current = tenderId;
  }, [tenderId]);

  function closeDrawer() {
    if (tenderId) {
      restoreTenderFocus(tenderId);
    }
    urlState.remove("tender", { mode: "replace", scroll: false });
  }

  async function deleteOpenedTender() {
    if (!tenderId) return;
    const result = await deleteTender(tenderId);
    if (!result.ok) return;
    await queryClient.invalidateQueries({ queryKey: ["tender-detail", tenderId] });
    closeDrawer();
    router.refresh();
  }

  if (!tenderId) {
    return null;
  }

  return (
    <Sheet open onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{detail.data?.title ?? "Detail tender"}</SheetTitle>
          <SheetDescription>
            Informasi lengkap tender dan dokumen.
          </SheetDescription>
        </SheetHeader>

        {detail.isLoading ? (
          <div className="space-y-4 px-6 pb-6" aria-label="Memuat detail tender">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {detail.isError ? (
          detail.error instanceof TenderNotFoundError ? (
            <div className="px-4 pb-4">
              <EmptyState
                variant="no-results"
                title="Tender tidak ditemukan"
                description="Tender yang Anda buka tidak tersedia."
                action={
                  <Button type="button" onClick={closeDrawer}>
                    Tutup
                  </Button>
                }
              />
            </div>
          ) : (
            <ErrorState
              className="mx-4 mb-4 min-h-48"
              title="Detail tender gagal dimuat"
              message="Periksa koneksi jaringan lalu coba lagi."
              onRetry={() => detail.refetch()}
            />
          )
        ) : null}

        {detail.data ? (
          <TenderDetail
            tender={detail.data}
            categories={categories}
            onDelete={deleteOpenedTender}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
