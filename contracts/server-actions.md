# Tender Server Actions

## createTender

Membuat tender baru.

- Input: schema form tender
- Output: `TenderActionResult<{ id: string }>`
- Revalidasi: `/dashboard`
- Error khusus: kode tender duplikat dan kategori tidak ditemukan

## updateTender

Memperbarui tender berdasarkan ID.

- Input: `tenderId`, schema form tender
- Output: `TenderActionResult<{ id: string }>`
- Revalidasi: `/dashboard`
- Error khusus: ID tidak valid, kategori tidak ditemukan, kode duplikat, dan tender tidak ditemukan

## deleteTender

Menghapus tender beserta dokumen Storage dan record database.

- Input: `tenderId`
- Output: `TenderActionResult<{ id: string }>`
- Urutan: validasi ID -> cari tender -> hapus objek Storage -> hapus record tender
- Record database tidak dihapus jika penghapusan Storage gagal selain status 404
- File Storage yang hilang (`404`) tetap dianggap aman untuk dilanjutkan
