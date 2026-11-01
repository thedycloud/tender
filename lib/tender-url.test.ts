import { describe, expect, it } from "vitest";
import { buildTenderUrl } from "./tender-url";

describe("buildTenderUrl", () => {
  it("builds a dashboard URL with the requested page", () => {
    expect(buildTenderUrl("/dashboard", { status: "OPEN" }, { page: 2 })).toBe(
      "/dashboard?status=OPEN&page=2",
    );
  });

  it("keeps existing filters when changing pages", () => {
    expect(
      buildTenderUrl(
        "/dashboard",
        { q: "jalan", status: "OPEN", page: "1" },
        { page: 3 },
      ),
    ).toBe("/dashboard?q=jalan&status=OPEN&page=3");
  });

  it("removes a parameter when patch value is null", () => {
    expect(
      buildTenderUrl("/dashboard", { q: "jembatan", page: "2" }, { q: null }),
    ).toBe("/dashboard?page=2");
  });

  it("uses only the first repeated parameter", () => {
    expect(
      buildTenderUrl("/dashboard", { q: ["first", "second"], page: ["2", "9"] }),
    ).toBe("/dashboard?q=first&page=2");
  });
});
