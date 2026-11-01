import { describe, expect, it } from "vitest";
import {
  getNextTenderSort,
  getTenderSortDirection,
  parseTenderSort,
} from "./tender-sort";

describe("tender sort", () => {
  it("starts title sorting ascending", () => {
    expect(getNextTenderSort(null)).toBe("title_asc");
  });

  it("cycles ascending to descending", () => {
    expect(getNextTenderSort("title_asc")).toBe("title_desc");
    expect(getTenderSortDirection("title_desc")).toBe("desc");
  });

  it("returns to default sorting after descending", () => {
    expect(getNextTenderSort("title_desc")).toBeNull();
  });

  it("only parses title sort directions", () => {
    expect(parseTenderSort("title_asc")).toBe("title_asc");
    expect(parseTenderSort("newest")).toBeNull();
    expect(parseTenderSort("invalid")).toBeNull();
  });
});
