import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function measure(name: string, operation: () => Promise<number>) {
  const samples: number[] = [];
  let total = 0;

  for (let index = 0; index < 5; index += 1) {
    const startedAt = performance.now();
    total = await operation();
    samples.push(performance.now() - startedAt);
  }

  const average = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
  console.log(`${name}: ${total} record, rata-rata ${average.toFixed(2)} ms`);
}

async function main() {
  await measure("Daftar halaman", async () =>
    (
      await prisma.tender.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, title: true },
      })
    ).length,
  );

  await measure("Pencarian jembatan", async () =>
    (
      await prisma.tender.findMany({
        where: { title: { contains: "Jembatan", mode: "insensitive" } },
        take: 20,
        select: { id: true, title: true },
      })
    ).length,
  );

  console.log(`Total tender: ${await prisma.tender.count()}`);
}

main()
  .catch((error: unknown) => {
    console.error("Benchmark gagal dijalankan.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
