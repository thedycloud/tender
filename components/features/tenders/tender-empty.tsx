import { EmptyState } from "@/components/shared/empty-state";

export function TenderEmpty() {
  return (
    <div className="p-4">
      <EmptyState
        variant="initial"
        title="Belum ada tender"
        description="Belum ada tender yang tersedia untuk ditampilkan."
      />
    </div>
  );
}
