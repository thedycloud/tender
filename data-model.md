# Data model

## Category

Kategori tender yang digunakan untuk filter dan form.

- `id`: identifier unik
- `name`: nama kategori unik
- `slug`: slug unik untuk URL
- `tenders`, `documents`: relasi ke tender dan dokumen

## Tender

Record utama tender/lelang.

- `id`, `referenceCode`, `title`
- `description`, `organization`
- `categoryId` opsional dengan relasi ke `Category`
- `status`: `DRAFT`, `OPEN`, `CLOSING_SOON`, `CLOSED`, atau `CANCELLED`
- `deadlineAt`, `publishedAt`
- `documents`: relasi dokumen terkait
- `createdAt`, `updatedAt`

Index query utama: status, kategori, deadline, dan waktu dibuat.

## Document

Metadata dokumen di Supabase Storage.

- `id`, `name`, `fileName`
- `fileUrl` hanya dipakai server; tidak diekspos sebagai DTO detail
- `fileSize`, `mimeType`
- `status`: `DRAFT`, `REVIEW`, `APPROVED`, atau `REJECTED`
- Relasi opsional ke `Tender` dan `Category`

Penghapusan tender menghapus dokumen Storage terlebih dahulu, lalu record tender dan dokumen database melalui cascade.
