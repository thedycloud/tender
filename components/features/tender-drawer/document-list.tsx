"use client";

import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteDocument, getDownloadUrl } from "../../../app/dashboard/actions/document";
import { Button } from "../../ui/button";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { formatDate } from "../../../lib/format";
import type { TenderDocumentDTO } from "../../../lib/queries/tenders";

interface DocumentListProps {
  tenderId: string;
  documents: TenderDocumentDTO[];
}

function formatSize(bytes: number | null) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({ tenderId, documents }: DocumentListProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<TenderDocumentDTO | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(document: TenderDocumentDTO) {
    setError(null);
    const result = await getDownloadUrl(document.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  async function removeSelected() {
    if (!selected) return;
    setPending(true);
    setError(null);
    const result = await deleteDocument(selected.id);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSelected(null);
    await queryClient.invalidateQueries({ queryKey: ["tender-detail", tenderId] });
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-zinc-600">Belum ada dokumen</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {documents.map((document) => (
        <div key={document.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{document.fileName}</p>
            <p className="text-xs text-zinc-500">
              {formatSize(document.fileSize)} · {formatDate(document.createdAt)}
            </p>
          </div>
          <Button type="button" size="icon" variant="ghost" aria-label={`Unduh ${document.fileName}`} onClick={() => download(document)}>
            <Download />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label={`Hapus ${document.fileName}`} onClick={() => setSelected(document)}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <ConfirmDialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Hapus dokumen?"
        description={selected ? `Dokumen "${selected.fileName}" akan dihapus permanen.` : ""}
        pending={pending}
        onConfirm={removeSelected}
      />
    </div>
  );
}
