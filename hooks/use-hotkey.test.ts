// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHotkey } from "./use-hotkey";

describe("useHotkey", () => {
  it("handles Command/Ctrl K and prevents default", () => {
    const callback = vi.fn();
    renderHook(() => useHotkey(["meta+k", "ctrl+k"], callback));

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not handle the hotkey when disabled", () => {
    const callback = vi.fn();
    renderHook(() =>
      useHotkey("Escape", callback, { enabled: false }),
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(callback).not.toHaveBeenCalled();
  });
});
