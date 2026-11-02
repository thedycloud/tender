interface DashboardHeaderProps {
  total: number;
}

export function DashboardHeader({ total }: DashboardHeaderProps) {
  return (
    <div className="border-b px-4 py-5 sm:px-6">
      <p
        id="dashboard-page-title"
        tabIndex={-1}
        className="text-sm font-medium text-zinc-950 outline-none"
      >
        Daftar Tender
      </p>
      <p className="mt-1 text-sm text-zinc-600">
        {total} tender tersedia
      </p>
    </div>
  );
}
