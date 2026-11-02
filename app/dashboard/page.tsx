import { TenderTable } from "@/components/features/tenders/tender-table";
import { DashboardHeader } from "@/components/features/tenders/dashboard-header";
import {
  TenderEmpty,
  TenderNoResults,
} from "@/components/features/tenders/tender-empty";
import { TenderToolbar } from "@/components/features/tenders/tender-toolbar";
import { Pagination } from "@/components/shared/pagination";
import { getTenders } from "@/lib/queries/tenders";
import { getCategories } from "@/lib/queries/categories";
import { buildTenderUrl } from "@/lib/tender-url";
import { parseTenderQuery } from "@/schemas/tender-query";
import {
  buildTenderFilterSummary,
  hasActiveFilters,
} from "@/lib/tender-filters";
import { TenderDrawer } from "@/components/features/tender-drawer/tender-drawer";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const instant = false;

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const rawParams = await searchParams;
  const query = parseTenderQuery(rawParams);
  const categories = await getCategories();
  const validCategory = query.category
    ? categories.find(
        (category) =>
          category.slug.toLowerCase() === query.category?.toLowerCase(),
      )
    : undefined;
  const result = await getTenders({
    q: query.q || undefined,
    status: query.status === "ALL" ? undefined : query.status,
    category: validCategory?.slug,
    sort: query.sort,
    page: query.page,
  });
  const hasFilters = hasActiveFilters(query, validCategory);
  const filterSummary = buildTenderFilterSummary(query, validCategory);

  return (
    <div>
      <DashboardHeader total={result.total} />
      <TenderToolbar
        initialQuery={query.q}
        status={query.status}
        categorySlug={validCategory?.slug}
        categories={categories}
      />
      {result.items.length === 0 ? (
        hasFilters ? (
          <TenderNoResults description={filterSummary} />
        ) : (
          <TenderEmpty />
        )
      ) : (
        <TenderTable items={result.items} query={query} />
      )}
      {result.items.length > 0 ? (
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
      ) : null}
      <TenderDrawer />
    </div>
  );
}
