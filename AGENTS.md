<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SMDP Portal - Project Context & Guidelines

Dokumen ini berfungsi sebagai entry-point utama bagi Agen AI untuk memahami seluruh lingkup proyek SMDP Portal secara cepat tanpa melakukan indexing repository dari nol.

---

## 1. Ringkasan Project & Domain Bisnis

**Sistem Manajemen Dokumen Pegawai (SMDP) Portal** adalah aplikasi internal pengelolaan berkas administrasi dan kualifikasi profesi bagi seluruh pegawai (staf medis, keperawatan, administrasi, dsb). 
Domain bisnis utama meliputi:
- **Kepatuhan Berkas Mandatori (Compliance):** Memantau agar seluruh pegawai mengunggah dokumen wajib sesuai profesi masing-masing (e.g. STR Medis bagi Dokter).
- **Verifikasi Kelayakan Berkas:** Alur kerja persetujuan (`APPROVED`) atau penolakan (`REJECTED`) berkas kepegawaian oleh HR Admin atau Staff.
- **Pensiun Pegawai (Retirement):** Pemantauan batas usia pensiun pegawai (58 tahun) berbasis tanggal lahir pegawai.
- **Audit Keamanan:** Pelacakan log aktivitas bernilai keamanan tinggi via log audit trail (`SecurityLog`).

---

## 2. Tech Stack & Teknologi Utama

- **Core Framework:** Next.js (version 16) dengan React 19 (menggunakan App Router & TypeScript).
- **ORM & Database:** Prisma ORM dengan PostgreSQL.
- **Autentikasi:** NextAuth.js (menggunakan Credentials Provider & JWT Session).
- **Validasi Data:** Zod schema.
- **UI Components:** Vanilla CSS + Tailwind CSS v4, Lucide React, Shadcn UI Components, FullCalendar, Recharts.
- **Data Fetching:** Native fetch API (tidak menggunakan React/TanStack Query).

---

## 3. Struktur Folder Utama (Folder Structure)

```
smdp_v1/
├── prisma/                    # Schema database Prisma & script seed data
├── docs/                      # Dokumentasi teknis lengkap (Arsitektur, DB, API, dll)
├── src/
│   ├── app/                   # Routing Next.js & API Endpoints
│   │   ├── (dashboard)/       # Layout terpadu dan rute halaman flat terproteksi
│   │   └── api/               # Endpoint REST API internal
│   ├── components/            # Shared components global (Sidebar, Navbar, UI Shadcn)
│   ├── features/              # Feature modules terisolasi (bisnis logika, hooks, views)
│   ├── lib/                   # Config & utility global (prisma, auth, validations)
│   ├── services/              # Service Layer database (query Prisma)
│   └── proxy.ts               # Custom middleware router protection
```

---

## 4. Gambaran Arsitektur (Architecture Overview)

Aplikasi ini menggunakan **Feature-Based Architecture**. Rute halaman di `src/app/` bertindak sebagai controller tipis (thin controller) yang bertugas melakukan server-side authorization (`requireRole`), lalu merender main view dari folder `src/features/`. Logic UI didelegasikan ke custom React hooks di dalam folder fitur, sementara query database dipisahkan secara murni di dalam layer `src/services/`.

---

## 5. Status Implementasi Saat Ini

- **Autentikasi & Multi-role:** Selesai. Mendukung relasi multi-role Many-to-Many (`UserRole`).
- **Dashboard Terpadu:** Selesai. Penyatuan rute dashboard ke `/dashboard` dengan rendering dinamis per role (HR_ADMIN, STAFF, EMPLOYEE).
- **Manajemen Pegawai & Kategori:** Selesai. CRUD pegawai, pengelolaan master data pangkat/posisi, ekspor/impor CSV.
- **Verifikasi Berkas:** Selesai. Modul review dokumen lengkap dengan pratinjau inline, status, dan riwayat verifikasi.
- **Audit Trail:** Selesai. Pencatatan event penting sistem ke log keamanan database.

---

## 6. Instruksi Kerja Agen AI (AI Working Instructions)

1. **Gunakan Dokumentasi:** Selalu jadikan file di dalam `docs/` sebagai sumber informasi utama (source of truth).
2. **Jangan Lakukan Indexing Ulang:** Hindari membaca seluruh file repository secara manual kecuali jika dokumentasi hilang atau Anda butuh detail implementasi tertentu.
3. **Patuhi Halaman Terproteksi:** Seluruh halaman administratif baru wajib mengimplementasikan `requireRole` di server-side.
4. **Patuhi Standar Coding:**
   - Gunakan camelCase untuk variabel/fungsi, PascalCase untuk komponen UI.
   - Logic interaktif diletakkan di custom hooks di folder fitur.
   - Operasi database diletakkan di `src/services/`.
5. **Perbarui Dokumentasi:** Jika Anda merilis fitur baru atau mengubah schema database, segera update berkas terkait di `docs/` dan perbarui `docs/progress.md`.

---

## 7. File yang Wajib Dibaca Sebelum Bekerja

- **Arsitektur:** [docs/architecture.md](file:///d:/Real%20Work/Website/Temp/sdmp_v1/docs/architecture.md)
- **Aturan Bisnis:** [docs/business-rules.md](file:///d:/Real%20Work/Website/Temp/sdmp_v1/docs/business-rules.md)
- **Database Schema:** [docs/database.md](file:///d:/Real%20Work/Website/Temp/sdmp_v1/docs/database.md)
- **Panduan Coding:** [docs/coding-standard.md](file:///d:/Real%20Work/Website/Temp/sdmp_v1/docs/coding-standard.md)
