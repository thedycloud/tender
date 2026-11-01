import { describe, expect, it } from "vitest";
import {
  parseTenderQuery,
  tenderQuerySchema,
  type TenderQuery,
} from "./tender-query";

describe("tender query URL schema", () => {
  it("returns defaults for empty input", () => {
    expect(parseTenderQuery()).toEqual({
      q: "",
      status: "ALL",
      category: undefined,
      sort: "newest",
      page: 1,
      tender: undefined,
    });
  });

  it("parses valid query values", () => {
    const result = parseTenderQuery({
      q: "  jalan tol  ",
      status: "OPEN",
      category: "infrastruktur",
      sort: "deadline",
      page: "3",
      tender: "tender-123",
    });

    expect(result).toEqual({
      q: "jalan tol",
      status: "OPEN",
      category: "infrastruktur",
      sort: "deadline",
      page: 3,
      tender: "tender-123",
    });
  });

  it("falls back to defaults for page=-1", () => {
    expect(parseTenderQuery({ page: "-1" }).page).toBe(1);
  });

  it("falls back to ALL for an unknown status", () => {
    expect(parseTenderQuery({ status: "ngawur" }).status).toBe("ALL");
  });

  it("falls back to newest for an unknown sort", () => {
    expect(parseTenderQuery({ sort: "xx" }).sort).toBe("newest");
  });

  it("does not throw for invalid value types", () => {
    const result = tenderQuerySchema.safeParse({
      q: ["a", "b"],
      status: ["OPEN", "CLOSED"],
      category: 123,
      sort: null,
      page: "not-a-number",
      tender: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual<TenderQuery>({
        q: "a",
        status: "OPEN",
        category: undefined,
        sort: "newest",
        page: 1,
        tender: undefined,
      });
    }
  });

  it("uses the first value for repeated parameters", () => {
    expect(
      parseTenderQuery({
        q: ["first", "second"],
        page: ["2", "9"],
      }),
    ).toMatchObject({
      q: "first",
      page: 2,
    });
  });
});
