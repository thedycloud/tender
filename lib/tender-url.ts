export interface TenderUrlPatch {
  q?: string | null;
  status?: string | null;
  category?: string | null;
  sort?: string | null;
  page?: number | null;
  tender?: string | null;
}

export function buildTenderUrl(
  pathname = "/dashboard",
  current: Record<string, string | string[] | undefined> = {},
  patch: TenderUrlPatch = {},
): string {
  const params = new URLSearchParams();

  for (const key of ["q", "status", "category", "sort", "page", "tender"] as const) {
    const patchValue = patch[key];
    const value =
      patchValue === undefined
        ? current[key]
        : patchValue === null
          ? undefined
          : String(patchValue);
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue !== undefined && firstValue !== "") {
      params.set(key, firstValue);
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
