import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  buildHref,
  className,
}: PaginationProps) {
  return (
    <nav
      aria-label="Paginasi tender"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-zinc-600" aria-live="polite">
        Halaman {page} dari {totalPages} · {total} tender
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
          {page > 1 ? (
            <Link href={buildHref(page - 1)} aria-label="Halaman sebelumnya">
              <ChevronLeft aria-hidden="true" />
              Sebelumnya
            </Link>
          ) : (
            <>
              <ChevronLeft aria-hidden="true" />
              Sebelumnya
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          asChild={page < totalPages}
        >
          {page < totalPages ? (
            <Link href={buildHref(page + 1)} aria-label="Halaman berikutnya">
              Berikutnya
              <ChevronRight aria-hidden="true" />
            </Link>
          ) : (
            <>
              Berikutnya
              <ChevronRight aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </nav>
  );
}
