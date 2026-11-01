import type { TenderStatus } from "@prisma/client";

export interface TenderStatusPresentation {
  label: string;
  variant: "secondary" | "success" | "warning" | "default" | "destructive";
}

export const TENDER_STATUS_PRESENTATION: Record<
  TenderStatus,
  TenderStatusPresentation
> = {
  DRAFT: {
    label: "Draf",
    variant: "secondary",
  },
  OPEN: {
    label: "Dibuka",
    variant: "success",
  },
  CLOSING_SOON: {
    label: "Segera Tutup",
    variant: "warning",
  },
  CLOSED: {
    label: "Ditutup",
    variant: "default",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "destructive",
  },
};
