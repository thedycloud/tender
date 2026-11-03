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
        "flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-zinc-500" aria-live="polite">
        Menampilkan {Math.min(total, ((page - 1) * 12) + 1)}–{Math.min(total, page * 12)} dari {total} dokumen
      </p>
      <div className="flex items-center gap-1.5">
        <Button className="h-9 px-2.5 text-xs" variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
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
        {[...new Set([1, page, Math.min(page + 1, totalPages)].filter((value) => value >= 1 && value <= totalPages))].slice(0, 3).map((value) => (
          <Button
            key={value}
            variant={value === page ? "default" : "outline"}
            size="sm"
            className="size-9 p-0 text-xs"
            asChild={value !== page}
          >
            {value !== page ? <Link href={buildHref(value)} aria-label={`Halaman ${value}`}>{value}</Link> : <>{value}</>}
          </Button>
        ))}
        <Button
          className="h-9 px-2.5 text-xs"
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
