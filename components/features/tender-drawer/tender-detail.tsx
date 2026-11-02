"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { StatusBadge } from "../../shared/status-badge";
import { formatDate, isExpired } from "../../../lib/format";
import type { TenderDetailDTO } from "../../../lib/queries/tenders";
import type { CategoryOption } from "../../../types/tender";
import { DocumentList } from "./document-list";
import { DocumentUpload } from "./document-upload";
import { TenderFormDialog } from "../tenders/tender-form-dialog";
import { ConfirmDialog } from "../../shared/confirm-dialog";
import { Button } from "../../ui/button";

interface TenderDetailProps {
  tender: TenderDetailDTO;
  categories: CategoryOption[];
  onDelete: () => Promise<void>;
}

export function TenderDetail({ tender, categories, onDelete }: TenderDetailProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    setDeleteOpen(false);
  }

  return (
    <div className="space-y-6 px-6 pb-6">
      <div className="flex gap-2">
        <TenderFormDialog
          categories={categories}
          tender={tender}
          triggerLabel="Ubah tender"
        />
        <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 aria-hidden="true" />
          Hapus tender
        </Button>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {tender.referenceCode}
        </p>
        <div className="mt-2">
          <StatusBadge
            status={tender.status}
            expired={isExpired(tender.deadlineAt, tender.status)}
          />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Instansi</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {tender.organization ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Kategori</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {tender.category?.name ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Deadline</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {formatDate(tender.deadlineAt)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Dipublikasikan</dt>
          <dd className="mt-1 font-medium text-zinc-950">
            {formatDate(tender.publishedAt)}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-semibold text-zinc-950">Deskripsi</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
          {tender.description?.trim() || "-"}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-950">
          Dokumen ({tender.documents.length})
        </h3>
        <DocumentList tenderId={tender.id} documents={tender.documents} />
        <DocumentUpload tenderId={tender.id} />
      </div>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus tender?"
        description={`Tender "${tender.title}" beserta dokumen terkait akan dihapus permanen.`}
        confirmLabel="Hapus tender"
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
