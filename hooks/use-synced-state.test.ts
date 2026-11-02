// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSyncedState } from "./use-synced-state";

describe("useSyncedState", () => {
  it("syncs with an updated external value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useSyncedState(value),
      { initialProps: { value: "OPEN" } },
    );

    expect(result.current[0]).toBe("OPEN");

    act(() => {
      result.current[1]("CLOSED");
    });
    expect(result.current[0]).toBe("CLOSED");

    rerender({ value: "DRAFT" });
    expect(result.current[0]).toBe("DRAFT");
  });
});
