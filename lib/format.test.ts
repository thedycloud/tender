import { describe, expect, it } from "vitest";
import { formatDate, isExpired } from "./format";

describe("formatDate", () => {
  it("formats a valid date in Indonesian", () => {
    expect(formatDate(new Date("2026-12-31T12:00:00.000Z"))).toBe(
      "31 Des 2026",
    );
  });

  it("formats an ISO string", () => {
    expect(formatDate("2026-01-05T08:00:00.000Z")).toBe("05 Jan 2026");
  });

  it("returns a placeholder for missing or invalid dates", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bukan-tanggal")).toBe("-");
  });
});

describe("isExpired", () => {
  const now = new Date("2026-11-01T00:00:00.000Z");

  it("returns true when an active tender is past its deadline", () => {
    expect(isExpired("2026-10-31T23:00:00.000Z", "OPEN", now)).toBe(true);
  });

  it("returns false when the deadline is in the future", () => {
    expect(isExpired("2026-11-02T00:00:00.000Z", "CLOSING_SOON", now)).toBe(
      false,
    );
  });

  it("returns false for a tender with no deadline", () => {
    expect(isExpired(null, "OPEN", now)).toBe(false);
  });

  it("never marks a closed tender as expired", () => {
    expect(isExpired("2020-01-01T00:00:00.000Z", "CLOSED", now)).toBe(false);
  });

  it("never marks a cancelled tender as expired", () => {
    expect(isExpired("2020-01-01T00:00:00.000Z", "CANCELLED", now)).toBe(
      false,
    );
  });
});
