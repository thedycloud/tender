import { TenderTable } from "@/components/features/tenders/tender-table";
import { DashboardHeader } from "@/components/features/tenders/dashboard-header";
import { TenderEmpty } from "@/components/features/tenders/tender-empty";
import { SearchInput } from "@/components/shared/search-input";
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
      <DashboardHeader total={result.total} />
      <div className="border-b px-4 py-3 sm:px-6">
        <SearchInput initialQuery={query.q} />
      </div>
      {result.items.length === 0 ? (
        <TenderEmpty />
      ) : (
        <TenderTable items={result.items} query={query} />
      )}
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
