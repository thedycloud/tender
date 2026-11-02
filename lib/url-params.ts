export type UrlParamsInput =
  | string
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export interface PatchUrlParamsOptions {
  resetPage?: boolean;
}

function toUrlSearchParams(
  input: UrlParamsInput = {},
): URLSearchParams {
  if (typeof input === "string") {
    return new URLSearchParams(input.replace(/^\?/, ""));
  }
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input.toString());
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue !== undefined && firstValue !== "") {
      params.set(key, firstValue);
    }
  }
  return params;
}

export function getUrlParam(
  input: UrlParamsInput,
  key: string,
  defaultValue: string | null = null,
): string | null {
  return toUrlSearchParams(input).get(key) ?? defaultValue;
}

export function setUrlParam(
  input: UrlParamsInput,
  key: string,
  value: string | number | null | undefined,
): URLSearchParams {
  const params = toUrlSearchParams(input);
  if (value === null || value === undefined || String(value) === "") {
    params.delete(key);
  } else {
    params.set(key, String(value));
  }
  return params;
}

export function deleteUrlParam(
  input: UrlParamsInput,
  key: string,
): URLSearchParams {
  const params = toUrlSearchParams(input);
  params.delete(key);
  return params;
}

export function patchUrlParams(
  input: UrlParamsInput = {},
  patch: Record<string, string | number | null | undefined> = {},
  options: PatchUrlParamsOptions = {},
): URLSearchParams {
  const params = toUrlSearchParams(input);
  let changedFilter = false;

  for (const [key, value] of Object.entries(patch)) {
    if (key !== "page") {
      changedFilter = true;
    }
    if (value === null || value === undefined || String(value) === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }

  if (options.resetPage !== false && changedFilter) {
    params.delete("page");
  }

  return params;
}

export function buildUrlParams(
  input: UrlParamsInput = {},
  patch: Record<string, string | number | null | undefined> = {},
  options: PatchUrlParamsOptions = {},
): string {
  const params = patchUrlParams(input, patch, options);
  return params.toString();
}

export const updateUrlParams = patchUrlParams;
