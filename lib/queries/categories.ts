import { prisma } from "@/lib/prisma";
import type { CategoryOption } from "@/types/tender";

export async function getCategories(): Promise<CategoryOption[]> {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
