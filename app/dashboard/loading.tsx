import { DashboardHeader } from "@/components/features/tenders/dashboard-header";
import { TenderListSkeleton } from "@/components/features/tenders/tender-list-skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <DashboardHeader total={0} />
      <TenderListSkeleton />
    </div>
  );
}
