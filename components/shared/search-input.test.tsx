// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/dashboard");
    replace.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("loads an initial query from the URL", () => {
    render(<SearchInput initialQuery="semen" />);
    expect(screen.getByRole("searchbox")).toHaveValue("semen");
  });

  it("applies Enter immediately and clears with Escape", () => {
    render(<SearchInput />);
    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "jembatan" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(replace).toHaveBeenCalledWith("/dashboard?q=jembatan", {
      scroll: false,
    });

    fireEvent.keyDown(input, { key: "Escape" });
    expect(replace).toHaveBeenCalledWith("/dashboard", {
      scroll: false,
    });
  });

  it("prevents browser handling and focuses on Ctrl+K", () => {
    render(<SearchInput />);
    const input = screen.getByRole("searchbox");

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          cancelable: true,
        }),
      );
    });

    expect(document.activeElement).toBe(input);
    expect(input).toHaveValue("");
  });
});
