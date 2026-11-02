import { describe, expect, it } from "vitest";
import { tenderFormSchema, tenderSchema } from "./tender";

const validTender = {
  code: "TNDR-2026-001",
  title: "Pengadaan Jasa Pemeliharaan Jalan",
  organization: "Dinas Pekerjaan Umum",
  categoryId: "infrastruktur",
  hps: 2_500_000_000,
  deadlineAt: "2026-12-31T23:59:59.000Z",
  status: "OPEN",
};

describe("tender form schema", () => {
  it("accepts valid form data", () => {
    const result = tenderFormSchema.safeParse(validTender);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.referenceCode).toBe("TNDR-2026-001");
      expect(result.data.hps).toBe(2_500_000_000);
    }
  });

  it("exports tenderSchema as the form schema alias", () => {
    expect(tenderSchema.safeParse(validTender).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = tenderFormSchema.safeParse({
      ...validTender,
      title: "",
      organization: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a negative HPS", () => {
    const result = tenderFormSchema.safeParse({
      ...validTender,
      hps: -1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("HPS tidak boleh negatif"),
        ),
      ).toBe(true);
    }
  });

  it("rejects an invalid deadline", () => {
    const result = tenderFormSchema.safeParse({
      ...validTender,
      deadlineAt: "bukan-tanggal",
    });

    expect(result.success).toBe(false);
  });

  it("supports referenceCode, category, agency, and deadline aliases", () => {
    const result = tenderFormSchema.safeParse({
      referenceCode: "TNDR-2026-002",
      title: "Pengadaan Perangkat Jaringan",
      agency: "Dinas Komunikasi",
      category: "teknologi",
      hps: "1500000000",
      deadline: "2026-12-31",
      status: "CLOSING_SOON",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hps).toBe(1_500_000_000);
      expect(result.data.organization).toBe("Dinas Komunikasi");
    }
  });

  it("rejects an unknown status", () => {
    const result = tenderFormSchema.safeParse({
      ...validTender,
      status: "NGAWUR",
    });

    expect(result.success).toBe(false);
  });
});
