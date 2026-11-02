interface DashboardHeaderProps {
  total: number;
}

export function DashboardHeader({ total }: DashboardHeaderProps) {
  return (
    <div className="border-b px-4 py-5 sm:px-6">
      <p className="text-sm font-medium text-zinc-950">Daftar Tender</p>
      <p className="mt-1 text-sm text-zinc-600">
        {total} tender tersedia
      </p>
    </div>
  );
}
