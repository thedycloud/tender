"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Progress } from "../../ui/progress";
import { useDocumentUpload } from "../../../hooks/use-document-upload";

interface DocumentUploadProps {
  tenderId: string;
}

export function DocumentUpload({ tenderId }: DocumentUploadProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const upload = useDocumentUpload(tenderId);
  const uploading = upload.status === "uploading";

  async function processFile(file: File) {
    const success = await upload.upload(file);
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ["tender-detail", tenderId] });
    }
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div
        className={`rounded-md border border-dashed p-4 text-center ${dragging ? "border-blue-500 bg-blue-50" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file && !uploading) void processFile(file);
        }}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void processFile(file);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload /> Pilih file
        </Button>
        <p className="mt-2 text-xs text-zinc-500">PDF, DOCX, atau XLSX · maksimal 10 MB</p>
      </div>

      {uploading ? (
        <div className="space-y-2">
          <Progress value={upload.progress} aria-label={`Progres upload ${upload.progress}%`} />
          <div className="flex items-center justify-between text-xs">
            <span>{upload.progress}%</span>
            <Button type="button" size="sm" variant="outline" onClick={upload.cancel}>Batalkan</Button>
          </div>
        </div>
      ) : null}

      {upload.status === "error" && upload.error ? (
        <p className="text-sm text-red-600" role="alert">{upload.error}</p>
      ) : null}
      {upload.status === "success" ? (
        <p className="text-sm text-emerald-700" role="status">Dokumen berhasil diunggah.</p>
      ) : null}
    </div>
  );
}
