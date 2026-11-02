"use client";

import { useRef, useState } from "react";
import { documentFileSchema } from "../schemas/document";
import { commitDocument, createUploadTicket } from "../app/dashboard/actions/document";

export type DocumentUploadStatus = "idle" | "uploading" | "success" | "error";

export function useDocumentUpload(tenderId: string) {
  const [status, setStatus] = useState<DocumentUploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  function cancel() {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setStatus("idle");
    setProgress(0);
    setError("Upload dibatalkan.");
  }

  function reset() {
    setStatus("idle");
    setProgress(0);
    setError(null);
  }

  async function upload(file: File): Promise<boolean> {
    const metadata = documentFileSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!metadata.success) {
      const message = metadata.error.issues[0]?.message ?? "Dokumen tidak valid.";
      setStatus("error");
      setError(message);
      return false;
    }

    setStatus("uploading");
    setProgress(0);
    setError(null);

    const ticket = await createUploadTicket({
      tenderId,
      file: { name: file.name, size: file.size, type: file.type },
    });
    if (!ticket.ok) {
      setStatus("error");
      setError(ticket.error);
      return false;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", ticket.data.signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Gagal mengunggah dokumen ke penyimpanan."));
          }
        };
        xhr.onerror = () => reject(new Error("Gagal mengunggah dokumen ke penyimpanan."));
        xhr.onabort = () => reject(new Error("Upload dibatalkan."));
        xhr.send(file);
      });
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Gagal mengunggah dokumen.";
      setStatus("error");
      setError(message);
      return false;
    } finally {
      xhrRef.current = null;
    }

    const committed = await commitDocument({
      tenderId,
      path: ticket.data.path,
      fileName: file.name,
    });
    if (!committed.ok) {
      setStatus("error");
      setError(committed.error);
      return false;
    }

    setProgress(100);
    setStatus("success");
    return true;
  }

  return { status, progress, error, upload, cancel, reset };
}
