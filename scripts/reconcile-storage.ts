import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";
import { TENDER_DOCUMENT_BUCKET } from "../lib/storage";
import { findOrphanStoragePaths } from "../lib/storage-reconcile";

const dryRun = process.argv.includes("--dry-run");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib tersedia untuk rekonsiliasi.",
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
const storage = supabaseAdmin.storage.from(TENDER_DOCUMENT_BUCKET);

async function listFiles(prefix: string): Promise<string[]> {
  const files: string[] = [];
  const batchSize = 100;

  for (let offset = 0; ; offset += batchSize) {
    const { data, error } = await storage.list(prefix, {
      limit: batchSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Gagal membaca Storage pada "${prefix}": ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id === null) {
        files.push(...await listFiles(path));
      } else {
        files.push(path);
      }
    }

    if (data.length < batchSize) {
      break;
    }
  }

  return files;
}

async function main(): Promise<void> {
  try {
    const storagePaths = await listFiles("tenders");
    const records = await prisma.document.findMany({
      select: { fileUrl: true },
    });
    const orphanPaths = findOrphanStoragePaths(
      storagePaths,
      records.map((record) => record.fileUrl),
    );

    if (orphanPaths.length === 0) {
      console.log("Tidak ada objek yatim di Storage.");
      return;
    }

    for (const path of orphanPaths) {
      console.log(`${dryRun ? "[DRY-RUN]" : "[YATIM]"} ${path}`);
    }

    if (!dryRun) {
      const { error } = await storage.remove(orphanPaths);
      if (error) {
        throw new Error(`Gagal menghapus objek yatim: ${error.message}`);
      }
      console.log(`Menghapus ${orphanPaths.length} objek yatim.`);
    } else {
      console.log(`Ditemukan ${orphanPaths.length} objek yatim.`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
