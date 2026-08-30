<div align="center">

# 🎓 TMJ Class Management System (CMS)
### Modern Multi-Class SaaS Platform for Academic & Cohort Management

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  Platform manajemen perkuliahan terpadu berbasis web untuk mahasiswa, ketua kelas, dosen, dan pengurus jurusan <b>Teknik Multimedia dan Jaringan (TMJ)</b>. Mendukung multi-kelas dari <b>Semester 1 s.d. 8</b> dengan arsitektur multi-tenant, first-time setup wizard, dan integrasi cloud Supabase.
</p>

[✨ Live Demo](https://tmj-cms.vercel.app) • [📖 Dokumentasi Skema](./supabase/schema.sql) • [🚀 Panduan Setup](#-panduan-instalasi--setup-lokal)

---

</div>

## 🌟 Fitur Utama

### 1. 🧙 First-Time Developer Setup Wizard (`/setup`)
- **Inisialisasi Cepat**: Saat pertama kali dijalankan, sistem secara otomatis memandu pembuatan akun **Master Developer (Superadmin)**.
- **Struktur Kelas Fleksibel**: Otomatisasi pembentukan kelas rombel awal untuk Semester 1 s.d. 8 (*misal: TMJ 1A, TMJ 2A, TMJ 3A, TMJ 4A, dst.*).
- **Clean Slate (Zero Dummy Data)**: Database bersih 100% tanpa data palsu, siap diisi kurikulum dan jadwal nyata oleh ketua kelas.

### 2. 👑 Master Developer Console (`/developer`)
- **🏫 Manajemen Rombel Kelas**: Tambah, edit, dan hapus kelas per semester; pantau rasio mahasiswa dan jumlah mata kuliah aktif.
- **👥 Manajemen Akun & Hak Akses**: Buat akun pengguna dengan autentikasi **Username / NIM**, atur penempatan kelas, dan reset password.
- **🔄 Instant Class Switcher**: Pengelola dapat beralih konteks dashboard kelas manapun secara instan melalui dropdown navigasi.
- **📊 Cloud Health & Supabase Monitor**: Pantau status koneksi real-time ke Supabase Cloud langsung dari panel kendali.

### 3. 🎯 4 Tingkat Peran Pengguna (Role-Based Access Control)
| Role | Lingkup Akses | Hak Akses & Kemampuan |
| :--- | :--- | :--- |
| 👑 **Developer** | Global (Seluruh Kelas & Semester) | Master Console (`/developer`), kelola seluruh rombel kelas, akun pengguna, dan konfigurasi sistem. |
| 🛡️ **Admin** | Jurusan / Multi-Class | Pengumuman tingkat prodi, kalender akademik terpusat, dan pemantauan kurikulum. |
| 🎓 **Ketua Kelas** | Kelas yang Dikelola | Kelola silabus matkul, jadwal sesi kuliah mingguan, upload materi modul, dan buat deadline tugas. |
| 👤 **Mahasiswa** | Anggota Kelas Terdaftar | Jadwal kuliah harian, unduh materi, checklist pengerjaan tugas mandiri, dan catatan markdown pribadi. |

### 4. 📚 Modul Akademik Lengkap
- **📅 Jadwal Perkuliahan Interaktif**: Tampilan jadwal per hari dengan informasi jam, ruang kelas, dosen pengampu, dan link meeting online.
- **📋 Kanban Deadline & Checklist Tugas**: Manajemen tugas dengan status *Belum Mulai*, *In Progress*, *Selesai*, dan *Terlambat* beserta sub-checklist mandiri mahasiswa.
- **📂 Pusat Modul & Materi Kuliah**: Pengarsipan modul PDF, slide presentasi, tautan Google Drive, dan video tutorial YouTube terorganisir per minggu pertemuan (Minggu 1-16).
- **📢 Broadcast Pengumuman**: Pengumuman penting dengan pinning darurat (*Pinned Urgent*) dan lampiran berkas resmi.
- **🗓️ Kalender Akademik**: Kalender visual untuk jadwal perkuliahan, UTS, UAS, seminar, dan hari libur nasional.
- **📝 Catatan Belajar Pribadi**: Editor catatan markdown terisolasi per akun mahasiswa dengan fitur pencarian dan tagging.

---

## 🏗️ Arsitektur Teknologi

```
tmj-cms/
├── src/
│   ├── app/                      # Next.js 15 App Router (15 Routes)
│   │   ├── (auth)/login/         # Form Autentikasi Username/NIM Aman
│   │   ├── developer/            # Master Developer Console (403 Protected)
│   │   ├── setup/                # First-Time Initialization Wizard
│   │   ├── courses/              # Manajemen Silabus & Mata Kuliah
│   │   ├── schedule/             # Jadwal Kuliah Mingguan
│   │   ├── assignments/          # Kanban Board Deadline & Submission
│   │   ├── materials/            # Pusat Berkas & Modul Perkuliahan
│   │   ├── announcements/        # Broadcast Informasi & Pinned News
│   │   ├── calendar/             # Kalender Akademik Terpadu
│   │   ├── notes/                # Catatan Markdown Pribadi
│   │   └── settings/             # Profil Pengguna & Preferensi
│   ├── components/               # Clean Minimalist UI Components
│   ├── lib/
│   │   ├── storage.ts            # Reactive Multi-Class Scoped Data Layer
│   │   ├── supabase.ts           # Supabase Cloud Client SDK
│   │   └── supabase-service.ts   # Real-Time Cloud CRUD & Bucket Storage
│   └── types/                    # Strong TypeScript Definitions
└── supabase/
    └── schema.sql                # Production DDL Script (10 Tables, RLS, Storage)
```

---

## ⚡ Panduan Instalasi & Setup Lokal

### 1. Clone Repository
```bash
git clone https://github.com/PanduAsmara/Class-Management-System.git
cd Class-Management-System
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables (Opsional untuk Supabase)
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**. Sistem akan langsung mengarahkan Anda ke **Setup Wizard (`/setup`)** untuk membuat akun Developer Master dan kelas awal.

---

## 🗄️ Setup Database Supabase Cloud (1 Menit)

1. Buat project baru di **[supabase.com](https://supabase.com)**.
2. Buka menu **SQL Editor** di dashboard Supabase.
3. Salin seluruh isi berkas [`supabase/schema.sql`](./supabase/schema.sql) dan klik tombol **Run**.
4. Seluruh 10 tabel multi-tenant, Row Level Security (RLS), dan Storage Bucket (`materials`, `assignments`, `avatars`) akan aktif secara otomatis.

---

## 🚀 Panduan Deployment ke Vercel

1. Buka **[vercel.com](https://vercel.com)** dan hubungkan repository GitHub ini.
2. Pada pengaturan **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Klik **Deploy**. Website Anda siap digunakan dalam kurun waktu kurang dari 1 menit!

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT License**. Lihat file `LICENSE` untuk informasi lebih lanjut.

---

<div align="center">
  Dibuat dengan ❤️ untuk kemajuan civitas akademika <b>Teknik Multimedia dan Jaringan (TMJ)</b>.
</div>
