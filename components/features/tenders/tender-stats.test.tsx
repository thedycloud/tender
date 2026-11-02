// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TenderStatsCards } from "./tender-stats";

afterEach(cleanup);

describe("TenderStatsCards", () => {
  it("renders total, status, and deadline statistics", () => {
    render(
      <TenderStatsCards
        stats={{
          total: 520,
          byStatus: {
            DRAFT: 10,
            OPEN: 300,
            CLOSING_SOON: 40,
            CLOSED: 150,
            CANCELLED: 20,
          },
          dueSoon: 12,
        }}
      />,
    );

    expect(screen.getByText("Total tender").nextElementSibling).toHaveTextContent("520");
    expect(screen.getByText("Sedang dibuka").nextElementSibling).toHaveTextContent("300");
    expect(screen.getByText("Segera tutup").nextElementSibling).toHaveTextContent("40");
    expect(screen.getByText("Deadline segera").nextElementSibling).toHaveTextContent("12");
  });
});
