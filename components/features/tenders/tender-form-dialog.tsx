"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Plus, Pencil } from "lucide-react";
import {
  normalizedTenderFormSchema,
  type TenderFormInput,
} from "@/schemas/tender";
import { createTender, updateTender } from "@/app/dashboard/actions/tender";
import type { CategoryOption, TenderDetailDTO } from "@/types/tender";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TENDER_STATUS_PRESENTATION } from "@/lib/tender-status";
import { TENDER_STATUSES } from "@/schemas/tender";

interface TenderFormDialogProps {
  categories: CategoryOption[];
  tender?: TenderDetailDTO;
  triggerLabel?: string;
  iconOnly?: boolean;
}

export function TenderFormDialog({
  categories,
  tender,
  triggerLabel,
  iconOnly = false,
}: TenderFormDialogProps) {
  const router = useRouter();
  const { control, register, handleSubmit, reset, setError, formState } =
    useForm<TenderFormInput>({
      resolver: zodResolver(normalizedTenderFormSchema),
      defaultValues: tender
        ? {
            referenceCode: tender.referenceCode,
            title: tender.title,
            organization: tender.organization ?? "",
            categoryId: tender.categoryId ?? "",
            hps: 0,
            deadlineAt: tender.deadlineAt ?? "",
            status: tender.status,
            description: tender.description ?? "",
          }
        : {
            referenceCode: "",
            title: "",
            organization: "",
            categoryId: "",
            hps: 0,
            deadlineAt: "",
            status: "DRAFT",
            description: "",
          },
    });

  useEffect(() => {
    if (!tender) return;
    reset({
      referenceCode: tender.referenceCode,
      title: tender.title,
      organization: tender.organization ?? "",
      categoryId: tender.categoryId ?? "",
      hps: 0,
      deadlineAt: tender.deadlineAt?.slice(0, 16) ?? "",
      status: tender.status,
      description: tender.description ?? "",
    });
  }, [reset, tender]);

  async function onSubmit(values: TenderFormInput) {
    const result = tender
      ? await updateTender(tender.id, values)
      : await createTender(values);
    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof TenderFormInput, {
            type: "server",
            message: messages?.[0],
          });
        }
      } else {
        setError("root", { type: "server", message: result.error });
      }
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant={tender ? "outline" : "default"} size={iconOnly ? "icon" : "default"}>
          {tender ? <Pencil aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {!iconOnly ? <span>{triggerLabel ?? (tender ? "Ubah" : "Tambah tender")}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <h2 className="text-lg font-semibold">
          {tender ? "Ubah tender" : "Tambah tender"}
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Kode tender" error={formState.errors.referenceCode?.message}>
            <Input {...register("referenceCode")} />
          </Field>
          <Field label="Judul tender" error={formState.errors.title?.message}>
            <Input {...register("title")} />
          </Field>
          <Field label="Instansi" error={formState.errors.organization?.message}>
            <Input {...register("organization")} />
          </Field>
          <Field label="Kategori" error={formState.errors.categoryId?.message}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="HPS" error={formState.errors.hps?.message}>
            <Input type="number" {...register("hps", { valueAsNumber: false })} />
          </Field>
          <Field label="Deadline" error={formState.errors.deadlineAt?.message}>
            <Input type="datetime-local" {...register("deadlineAt")} />
          </Field>
          <Field label="Status" error={formState.errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TENDER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {TENDER_STATUS_PRESENTATION[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Deskripsi" error={formState.errors.description?.message}>
            <textarea className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" {...register("description")} />
          </Field>
          {formState.errors.root?.message ? (
            <p role="alert" className="text-sm text-red-600">{formState.errors.root.message}</p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Menyimpan..." : tender ? "Simpan perubahan" : "Tambah tender"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
