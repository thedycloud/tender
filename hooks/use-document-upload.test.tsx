// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  createUploadTicket: vi.fn(),
  commitDocument: vi.fn(),
}));

vi.mock("../app/dashboard/actions/document", () => actions);

import { useDocumentUpload } from "./use-document-upload";

describe("useDocumentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid DOCX without creating a network upload", async () => {
    const { result } = renderHook(() => useDocumentUpload("tender-1"));
    let success = false;
    await act(async () => {
      success = await result.current.upload(
        new File(["bad"], "laporan.exe", { type: "application/octet-stream" }),
      );
    });

    expect(success).toBe(false);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeTruthy();
    expect(actions.createUploadTicket).not.toHaveBeenCalled();
  });
});
