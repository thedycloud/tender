"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4">
      <ErrorState
        title="Daftar tender gagal dimuat"
        message="Data tidak dapat dimuat. Silakan coba lagi."
        onRetry={reset}
      />
    </div>
  );
}
