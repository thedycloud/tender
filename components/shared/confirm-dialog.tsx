"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <div className="mt-4 flex justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" disabled={pending}>Batal</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" variant="destructive" disabled={pending} onClick={onConfirm}>
              {pending ? "Menghapus..." : confirmLabel}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
