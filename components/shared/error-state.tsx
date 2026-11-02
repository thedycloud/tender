import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Terjadi kesalahan",
  message = "Data tidak dapat dimuat. Silakan coba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center text-red-950",
        className,
      )}
    >
      <AlertCircle aria-hidden="true" className="mb-4 size-6 text-red-600" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
