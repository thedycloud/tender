import { TenderTable } from "@/components/features/tenders/tender-table";
import { Pagination } from "@/components/shared/pagination";
import { getTenders } from "@/lib/queries/tenders";
import { buildTenderUrl } from "@/lib/tender-url";
import { parseTenderQuery } from "@/schemas/tender-query";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const instant = false;

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const rawParams = await searchParams;
  const query = parseTenderQuery(rawParams);
  const result = await getTenders({
    q: query.q || undefined,
    status: query.status === "ALL" ? undefined : query.status,
    category: query.category,
    sort: query.sort,
    page: query.page,
  });

  return (
    <div>
      <TenderTable tenders={result.items} />
      <div className="border-t px-4 py-4">
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          buildHref={(page) =>
            buildTenderUrl("/dashboard", rawParams, { page })
          }
        />
      </div>
    </div>
  );
}
