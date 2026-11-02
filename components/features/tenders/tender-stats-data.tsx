import { getTenderStats } from "../../../lib/queries/tenders";
import { TenderStatsCards } from "./tender-stats";

export async function TenderStats() {
  const stats = await getTenderStats();
  return <TenderStatsCards stats={stats} />;
}
