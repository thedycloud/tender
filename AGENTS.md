<!-- BEGIN:nextjs-agent-rules -->

# AGENTS.md — Vantedge Bid (Tender Document Management Portal)

Dokumen ini adalah panduan operasional agen AI dan standar rekayasa untuk pengembangan proyek **Vantedge Bid** (Mini Technical Challenge: Dashboard UI & Manajemen Dokumen Tender Lelang).

---

## 1. ARSITEKTUR & TECH STACK

Proyek ini dirancang sebagai aplikasi *Full-stack Modern Web Application* dalam satu repositori (Next.js Monolith):

* **Framework & Core:** Next.js (App Router, Server Components & Client Components), TypeScript (Strict Mode).
* **Package Manager & Runtime:** Bun / pnpm.
* **Database & ORM:** PostgreSQL (Supabase) + **Prisma ORM** (untuk manajemen skema database, migrasi, dan type-safe database queries).
* **Styling & UI Library:** Tailwind CSS, Shadcn UI (Radix UI primitives), Lucide React (Icons).
* **State Management & Data Fetching:** TanStack React Query (client-side data sync), Server Actions / API Routes (backend mutations).
* **Form & Validation:** React Hook Form + Zod.
* **Testing:** Vitest & React Testing Library (untuk unit/component testing).

---

## 2. STRUKTUR DIREKTORI PROYEK

Ikuti konvensi direktori berikut untuk menjaga skalabilitas kode:

```text
vantedge-bid/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── app/
│   ├── api/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── shared/
│   └── features/
├── hooks/
├── lib/            # cn(), prisma.ts (singleton)
├── schemas/
├── types/
└── public/

3. ATURAN SPEC-DRIVEN DEVELOPMENT (SDD)
Setiap pengembangan fitur, perbaikan bug, atau penambahan komponen wajib mengikuti siklus di bawah ini:

Specify (Spesifikasi): Definisikan kebutuhan fungsional dan non-fungsional secara tertulis (misalnya: skema relasi database di Prisma, kriteria filter status, struktur kolom tabel).

Plan (Perencanaan): Rancang model skema database di Prisma, struktur komponen frontend, kontrak tipe TypeScript, dan operasi API/Server Actions.

Tasks (Daftar Tugas): Pecah pekerjaan menjadi task kecil (contoh: Task 1: Buat Prisma Schema Tender & Dokumen, Task 2: Setup Prisma Client singleton, Task 3: Implementasi UI Table).

Implement (Implementasi): Tulis kode secara modular, terstruktur, dan clean code. Jangan pernah membungkus hasil dalam file zip (artifak). Berikan instruksi langkah-demi-langkah atau potongan kode modular agar dapat diimplementasikan secara manual ke dalam repository.

Converge (Validasi): Pastikan tidak ada TypeScript errors, linting warnings, dan semua query Prisma serta komponen interaktif berjalan sesuai spesifikasi.

4. STANDAR KODE & IMPLEMENTASI
Strict Typing: Hindari penggunaan tipe any. Manfaatkan Prisma generated types (Prisma.TenderGetPayload<...>) untuk memastikan keamanan tipe dari database hingga UI.

Prisma Client Singleton: Pastikan inisialisasi Prisma Client menggunakan pola singleton di src/lib/prisma.ts agar tidak terjadi exhausted connection pool saat proses Hot Reloading di Next.js development mode.

Error & Edge States: Pastikan setiap halaman/tabel memiliki penanganan untuk Loading State (Skeleton), Empty State, dan Error Handling pada level API/Server Actions.

Responsive & Accessibility: Desain harus responsif dan mendukung navigasi keyboard (⌘K untuk search, ARIA attributes pada komponen interaktif).

<!-- END:nextjs-agent-rules -->
