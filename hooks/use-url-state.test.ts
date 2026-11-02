// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/dashboard",
  useSearchParams: () =>
    new URLSearchParams(window.location.search || "?status=OPEN&page=3"),
}));

import { useUrlState } from "./use-url-state";

describe("useUrlState", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/dashboard?status=OPEN&page=3");
    replace.mockClear();
    push.mockClear();
  });

  it("uses replace mode without restoring page by default for filter page key", () => {
    const { result } = renderHook(() =>
      useUrlState("status", "ALL", { mode: "replace", resetPage: true }),
    );

    expect(result.current[0]).toBe("OPEN");
    act(() => {
      result.current[1]("CLOSED");
    });

    expect(replace).toHaveBeenCalledWith(
      "/dashboard?status=CLOSED",
    );
  });

  it("resets page when changing a filter", () => {
    const { result } = renderHook(() => useUrlState());

    act(() => {
      result.current.set("q", "jalan");
    });

    expect(push).toHaveBeenCalledWith(
      "/dashboard?status=OPEN&q=jalan",
    );
  });

  it("supports page changes without resetting the page itself", () => {
    const { result } = renderHook(() => useUrlState());

    act(() => {
      result.current.set("page", 4, { resetPage: false });
    });

    expect(push).toHaveBeenCalledWith(
      "/dashboard?status=OPEN&page=4",
    );
  });
});
