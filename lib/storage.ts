export const TENDER_DOCUMENT_BUCKET = "tender-documents";

export function sanitizeFileName(fileName: string): string {
  const normalized = fileName.normalize("NFKD");
  const withoutMarks = normalized.replace(/[\u0300-\u036f]/g, "");
  const sanitized = withoutMarks
    .replace(/\0/g, "")
    .replace(/[\u0001-\u001F\u007F]/g, "")
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\.\./g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.\s_-]+|[.\s_-]+$/g, "")
    .toLowerCase();

  return sanitized || "document";
}

export function buildTenderDocumentPath(
  tenderId: string,
  fileName: string,
  uuid: string = crypto.randomUUID(),
): string {
  const safeTenderId = sanitizeStorageSegment(tenderId, "tender");
  const safeUuid = sanitizeStorageSegment(uuid, "document");
  const safeFileName = sanitizeFileName(fileName);

  if (safeFileName.length === 0) {
    throw new Error("Nama file tidak valid");
  }

  return `tenders/${safeTenderId}/${safeUuid}-${safeFileName}`;
}

export function sanitizeStorageSegment(
  segment: string,
  fallback = "item",
): string {
  if (
    typeof segment !== "string" ||
    segment.trim().length === 0 ||
    segment.includes("\0") ||
    segment.includes("/") ||
    segment.includes("\\") ||
    segment.includes("..")
  ) {
    return fallback;
  }

  const normalized = sanitizeFileName(segment);
  if (
    normalized === "" ||
    normalized === "." ||
    normalized === ".." ||
    normalized.includes("/") ||
    normalized.includes("\\")
  ) {
    return fallback;
  }

  return normalized;
}

export function assertSafeStoragePath(path: string): void {
  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/");

  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new Error("Path penyimpanan tidak aman");
  }
}
