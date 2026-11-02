// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./use-debounced-value";

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates only after 300 ms", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "awal" } },
    );

    rerender({ value: "jalan" });
    expect(result.current).toBe("awal");

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("awal");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("jalan");
  });
});
