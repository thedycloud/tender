# Quickstart

## Menjalankan aplikasi

```powershell
bun install
bun prisma:generate
bun prisma:validate
bun dev
```

Buka `http://localhost:3000/dashboard`.

## Variabel environment

Butuh `DATABASE_URL`, `DIRECT_URL`, serta konfigurasi Supabase Storage server:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (default: `tender-documents`)

Credential tidak boleh disimpan ke Git atau dicetak ke log.

## Seed dan benchmark

```powershell
bun prisma/seed.ts
bun run performance:tenders
```

Seed membuat hingga 520 tender dengan kode `T-0001` sampai `T-0520`.

Hasil benchmark lokal dengan database berisi 520 tender:

- Daftar halaman 20 record: rata-rata 544 ms untuk lima kali pengukuran
- Pencarian judul `Jembatan`: rata-rata 299 ms untuk lima kali pengukuran

## Checklist keyboard P1

- Gunakan `Ctrl+K` atau `Cmd+K` untuk memfokuskan pencarian tanpa membuka bilah alamat browser.
- Tekan `Enter` pada hasil pencarian untuk menerapkan pencarian segera.
- Tekan `Escape` pada kolom pencarian untuk mengosongkan pencarian.
- Gunakan `Tab` untuk mencapai status, kategori, tombol tambah, kolom tabel, atau kartu mobile.
- Buka tender dengan `Enter` atau `Spasi` pada baris/kartu.
- Dalam drawer, gunakan `Tab` dan `Shift+Tab` untuk berpindah antar kontrol; fokus tetap terjebak dalam drawer.
- Tutup drawer dengan `Escape`, tombol Tutup, atau klik area gelap; fokus kembali ke baris/kartu yang semula.
- Pada dialog form, gunakan `Tab` untuk melewati semua field, dan `Escape` untuk menutup jika didukung komponen dialog.
- Pada dialog konfirmasi hapus, fokus berada pada dialog; konfirmasi hanya dijalankan setelah menekan tombol konfirmasi.
