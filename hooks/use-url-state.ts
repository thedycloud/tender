"use client";

import { useCallback, useMemo } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  patchUrlParams,
  type PatchUrlParamsOptions,
} from "../lib/url-params";

export interface UseUrlStateOptions extends PatchUrlParamsOptions {
  mode?: "push" | "replace";
  scroll?: boolean;
}

export interface UrlStateController {
  get: (key: string, defaultValue?: string | null) => string | null;
  set: (
    key: string,
    value: string | number | null | undefined,
    options?: UseUrlStateOptions,
  ) => void;
  remove: (key: string, options?: UseUrlStateOptions) => void;
  push: (
    patch: Record<string, string | number | null | undefined>,
    options?: UseUrlStateOptions,
  ) => void;
  replace: (
    patch: Record<string, string | number | null | undefined>,
    options?: UseUrlStateOptions,
  ) => void;
  buildHref: (
    patch: Record<string, string | number | null | undefined>,
    options?: UseUrlStateOptions,
  ) => string;
}

export type UrlStateTuple<T extends string = string> = readonly [
  T,
  (
    value: string | number | null | undefined,
    options?: UseUrlStateOptions,
  ) => void,
];

function useUrlStateNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const navigate = useCallback(
    (
      patch: Record<string, string | number | null | undefined>,
      options: UseUrlStateOptions = {},
    ) => {
      const params = patchUrlParams(current, patch, {
        resetPage: options.resetPage,
      });
      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if ((options.mode ?? "push") === "replace") {
        if (options.scroll === undefined) {
          router.replace(href);
        } else {
          router.replace(href, { scroll: options.scroll });
        }
      } else {
        if (options.scroll === undefined) {
          router.push(href);
        } else {
          router.push(href, { scroll: options.scroll });
        }
      }
    },
    [current, pathname, router],
  );

  const buildHref = useCallback(
    (
      patch: Record<string, string | number | null | undefined>,
      options: UseUrlStateOptions = {},
    ) => {
      const params = patchUrlParams(current, patch, {
        resetPage: options.resetPage,
      });
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [current, pathname],
  );

  return { router, pathname, current, navigate, buildHref };
}

export function useUrlState(): UrlStateController;
export function useUrlState<T extends string>(
  key: string,
  defaultValue: T,
  options?: UseUrlStateOptions,
): UrlStateTuple<T>;
export function useUrlState<T extends string = string>(
  key?: string,
  defaultValue: T | "" = "",
  options: UseUrlStateOptions = {},
): UrlStateController | UrlStateTuple<T> {
  const { current, navigate, buildHref } = useUrlStateNavigation();

  const get = useCallback(
    (name: string, fallback: string | null = null) =>
      current.get(name) ?? fallback,
    [current],
  );

  const set = useCallback(
    (
      name: string,
      value: string | number | null | undefined,
      setOptions: UseUrlStateOptions = {},
    ) => {
      navigate({ [name]: value }, {
        ...options,
        ...setOptions,
        resetPage:
          setOptions.resetPage ??
          options.resetPage ??
          name !== "page",
      });
    },
    [navigate, options],
  );

  const remove = useCallback(
    (name: string, removeOptions: UseUrlStateOptions = {}) => {
      set(name, null, removeOptions);
    },
    [set],
  );

  const push = useCallback(
    (
      patch: Record<string, string | number | null | undefined>,
      pushOptions: UseUrlStateOptions = {},
    ) => navigate(patch, { ...pushOptions, mode: "push" }),
    [navigate],
  );

  const replace = useCallback(
    (
      patch: Record<string, string | number | null | undefined>,
      replaceOptions: UseUrlStateOptions = {},
    ) => navigate(patch, { ...replaceOptions, mode: "replace" }),
    [navigate],
  );

  if (key === undefined) {
    return { get, set, remove, push, replace, buildHref };
  }

  const value = (current.get(key) ?? defaultValue) as T;
  const setValue = (
    nextValue: string | number | null | undefined,
    setOptions: UseUrlStateOptions = {},
  ) => {
    set(key, nextValue, setOptions);
  };

  return [value, setValue] as const;
}
