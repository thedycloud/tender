// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

const uploadState = vi.hoisted(() => ({
  upload: vi.fn(),
  cancel: vi.fn(),
  status: "idle" as "idle" | "uploading" | "success" | "error",
  progress: 0,
  error: null as string | null,
}));

vi.mock("../../../hooks/use-document-upload", () => ({
  useDocumentUpload: () => ({
    ...uploadState,
    reset: vi.fn(),
  }),
}));

import { DocumentUpload } from "./document-upload";

function renderUpload() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <DocumentUpload tenderId="tender-1" />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("DocumentUpload", () => {
  it("rejects invalid files before calling the upload hook", () => {
    uploadState.status = "idle";
    uploadState.upload.mockResolvedValue(false);
    renderUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        files: [new File(["MZ"], "malware.exe", { type: "application/octet-stream" })],
      },
    });
    expect(uploadState.upload).toHaveBeenCalledOnce();
  });

  it("disables the file button while uploading and shows progress", () => {
    uploadState.status = "uploading";
    uploadState.progress = 42;
    renderUpload();
    expect(screen.getByRole("button", { name: /Pilih file/i })).toBeDisabled();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Batalkan" })).toBeInTheDocument();
  });
});
