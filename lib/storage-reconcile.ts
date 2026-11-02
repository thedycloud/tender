export interface StorageObject {
  id?: string | null;
  name: string;
}

export function findOrphanStoragePaths(
  storagePaths: Iterable<string>,
  databasePaths: Iterable<string>,
): string[] {
  const database = new Set(databasePaths);

  return [...new Set(storagePaths)]
    .filter((path) => !database.has(path))
    .sort((a, b) => a.localeCompare(b));
}
