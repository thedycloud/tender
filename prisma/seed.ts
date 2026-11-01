import { PrismaClient, TenderStatus } from "@prisma/client";

const prisma = new PrismaClient();

const organizations = [
  "Kementerian Pekerjaan Umum",
  "Kementerian Pendidikan",
  "Pemerintah Provinsi Jawa Barat",
  "Pemerintah Kota Bandung",
  "PT Infrastruktur Indonesia",
  "PT Pelabuhan Nusantara",
  "PT Energi Nasional",
  "PT Teknologi Pemerintah",
];

const statuses: TenderStatus[] = [
  TenderStatus.DRAFT,
  TenderStatus.OPEN,
  TenderStatus.CLOSING_SOON,
  TenderStatus.CLOSED,
  TenderStatus.CANCELLED,
];

async function main() {
  const totalSeeds = 520;
  const referenceCodes = Array.from(
    { length: totalSeeds },
    (_, index) => `T-${String(index + 1).padStart(4, "0")}`,
  );

  const existing = await prisma.tender.findMany({
    where: { referenceCode: { in: referenceCodes } },
    select: { referenceCode: true },
  });
  const existingReferenceCodes = new Set(
    existing.map(({ referenceCode }) => referenceCode),
  );

  for (let index = 0; index < totalSeeds; index += 1) {
    const number = index + 1;
    const deadlineAt = new Date();
    deadlineAt.setUTCDate(deadlineAt.getUTCDate() + (number % 90) + 1);
    const title =
      number % 5 === 0
        ? `Tender Proyek Jembatan Infrastruktur ${number}`
        : `Tender Proyek Infrastruktur ${number}`;

    await prisma.tender.upsert({
      where: { referenceCode: `T-${String(number).padStart(4, "0")}` },
      create: {
        title,
        referenceCode: `T-${String(number).padStart(4, "0")}`,
        description: `Dokumentasi lelang untuk proyek tender nomor ${number}.`,
        organization: organizations[index % organizations.length],
        status: statuses[index % statuses.length],
        deadlineAt,
        publishedAt: number % 3 === 0 ? new Date("2026-01-01T00:00:00.000Z") : null,
      },
      update: {
        title,
        description: `Dokumentasi lelang untuk proyek tender nomor ${number}.`,
        organization: organizations[index % organizations.length],
        status: statuses[index % statuses.length],
        deadlineAt,
        publishedAt: number % 3 === 0 ? new Date("2026-01-01T00:00:00.000Z") : null,
      },
    });
  }

  const newlyAdded = referenceCodes.filter(
    (referenceCode) => !existingReferenceCodes.has(referenceCode),
  ).length;
  const totalTender = await prisma.tender.count();

  console.log(`Tender baru ditambahkan: ${newlyAdded} dari ${totalSeeds}`);
  console.log(`Total tender di DB: ${totalTender}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal dijalankan.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
