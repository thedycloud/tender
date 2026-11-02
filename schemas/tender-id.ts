import { z } from "zod";

export const tenderIdSchema = z
  .string({ message: "ID tender tidak valid." })
  .trim()
  .min(1, "ID tender tidak valid.")
  .max(128, "ID tender tidak valid.")
  .regex(/^[A-Za-z0-9_-]+$/, "ID tender tidak valid.");

export function parseTenderId(value: unknown): string {
  return tenderIdSchema.parse(value);
}
