// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tenderFixture } from "../test/fixtures";
import { useTenderDetail } from "./use-tender-detail";

describe("useTenderDetail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads detail data and reuses the 30-second cache after unmounting", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, data: tenderFixture }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 30_000 },
      },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const first = renderHook(() => useTenderDetail(tenderFixture.id), {
      wrapper,
    });

    await waitFor(() => {
      expect(first.result.current.isSuccess).toBe(true);
    });
    expect(first.result.current.data).toEqual(tenderFixture);
    first.unmount();

    const second = renderHook(() => useTenderDetail(tenderFixture.id), {
      wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(second.result.current.data).toEqual(tenderFixture);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    second.unmount();
  });
});
