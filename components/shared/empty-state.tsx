import type { ReactNode } from "react";
import { Inbox, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  variant?: "initial" | "no-results";
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  variant = "initial",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = variant === "no-results" ? SearchX : Inbox;
  const defaultTitle =
    variant === "no-results" ? "Tidak ada hasil ditemukan" : "Belum ada tender";
  const defaultDescription =
    variant === "no-results"
      ? "Coba ubah kata kunci atau reset filter pencarian."
      : "Belum ada tender yang tersedia untuk ditampilkan.";

  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 rounded-full bg-zinc-100 p-3 text-zinc-600">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h3 className="text-base font-semibold text-zinc-950">{title ?? defaultTitle}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-600">
        {description ?? defaultDescription}
      </p>
      {action ? (
        <div className="mt-5">{action}</div>
      ) : null}
    </div>
  );
}
