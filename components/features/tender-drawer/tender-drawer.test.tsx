// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tenderFixture } from "../../../test/fixtures";

const remove = vi.fn();
let tenderParam: string | null = "tender-1";
const detailState = vi.hoisted(() => ({
  NotFoundError: class TenderNotFoundError extends Error {},
  current: {
    data: null as typeof tenderFixture | null,
    error: null as Error | null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(
    tenderParam ? `?tender=${tenderParam}` : "",
  ),
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("../../../app/dashboard/actions/tender", () => ({
  deleteTender: vi.fn(),
}));

vi.mock("../../../hooks/use-url-state", () => ({
  useUrlState: () => ({ remove }),
}));

vi.mock("../../../hooks/use-tender-detail", () => ({
  TenderNotFoundError: detailState.NotFoundError,
  useTenderDetail: () => detailState.current,
}));

vi.mock("../../ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock("../../shared/error-state", () => ({
  ErrorState: ({ title, onRetry }: { title: string; onRetry?: () => void }) => (
    <div role="alert">
      <span>{title}</span>
      {onRetry ? <button onClick={onRetry}>Coba lagi</button> : null}
    </div>
  ),
}));

vi.mock("../../shared/empty-state", () => ({
  EmptyState: ({
    title,
    action,
  }: {
    title?: string;
    action?: React.ReactNode;
  }) => (
    <div>
      <span>{title}</span>
      {action}
    </div>
  ),
}));

vi.mock("../../ui/button", () => ({
  Button: ({ children, onClick }: React.ComponentProps<"button">) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../../ui/skeleton", () => ({
  Skeleton: () => <div aria-label="Memuat detail tender" />,
}));

vi.mock("./tender-detail", () => ({
  TenderDetail: ({ tender }: { tender: typeof tenderFixture }) => (
    <div>Dokumen ({tender.documents.length}) · Belum ada dokumen</div>
  ),
}));

import { TenderDrawer } from "./tender-drawer";

describe("TenderDrawer", () => {
  beforeEach(() => {
    tenderParam = "tender-1";
    remove.mockClear();
    detailState.current = {
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
  });

  afterEach(cleanup);

  it("opens a drawer and displays loaded detail", () => {
    detailState.current.data = tenderFixture;
    render(<TenderDrawer />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(tenderFixture.title)).toBeInTheDocument();
    expect(screen.getByText("Dokumen (0) · Belum ada dokumen")).toBeInTheDocument();
  });

  it("shows not-found state", () => {
    detailState.current.isError = true;
    detailState.current.error = new detailState.NotFoundError();
    render(<TenderDrawer />);

    expect(screen.getByText("Tender tidak ditemukan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(remove).toHaveBeenCalledWith("tender", {
      mode: "replace",
      scroll: false,
    });
  });

  it("does not open for an invalid ID", () => {
    tenderParam = "../x";
    const { container } = render(<TenderDrawer />);
    expect(container.firstChild).toBeNull();
  });
});
