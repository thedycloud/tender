// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { tenderListFixture } from "../../../test/fixtures";
import { TenderTable } from "./tender-table";
import { TooltipProvider } from "../../ui/tooltip";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(cleanup);

describe("TenderTable", () => {
  const query = {
    q: "",
    status: "ALL" as const,
    category: undefined,
    sort: "newest" as const,
    page: 1,
  };

  it("renders a tender in the desktop and mobile representations", () => {
    render(
      <TooltipProvider>
        <TenderTable items={[tenderListFixture]} query={query} />
      </TooltipProvider>,
    );

    expect(screen.getAllByText(tenderListFixture.title).length).toBeGreaterThan(0);
    expect(screen.getAllByText(tenderListFixture.referenceCode).length).toBeGreaterThan(0);
  });

  it("shows the initial empty state when the database has no results", () => {
    render(<TenderTable items={[]} query={query} />);

    expect(screen.getByText("Belum ada tender")).toBeInTheDocument();
  });

  it("shows the filtered empty state when active filters have no results", () => {
    render(
      <TenderTable
        items={[]}
        query={{ ...query, q: "zzzz", status: "CANCELLED" }}
      />,
    );

    expect(screen.getByText("Tidak ada hasil ditemukan")).toBeInTheDocument();
  });
});
