import { describe, expect, it } from "vitest";
import {
  buildUrlParams,
  deleteUrlParam,
  getUrlParam,
  patchUrlParams,
  setUrlParam,
} from "./url-params";

describe("URL params utilities", () => {
  it("gets and sets the first parameter value", () => {
    expect(getUrlParam("?q=jalan&page=3", "q")).toBe("jalan");
    expect(setUrlParam("?q=jalan&page=3", "q", "jembatan").toString())
      .toBe("q=jembatan&page=3");
  });

  it("deletes a parameter", () => {
    expect(deleteUrlParam("?q=jalan&page=3", "q").toString()).toBe("page=3");
  });

  it("resets page when a filter changes", () => {
    expect(
      buildUrlParams("?status=OPEN&page=3", { status: "CLOSED" }),
    ).toBe("status=CLOSED");
  });

  it("can keep page when explicitly requested", () => {
    expect(
      patchUrlParams("?status=OPEN&page=3", { status: "CLOSED" }, { resetPage: false }).toString(),
    ).toBe("status=CLOSED&page=3");
  });
});
