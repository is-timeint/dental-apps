---
trigger: always_on
---

# Dental-Apps — Project Development Guidelines & Security Standards
## Next-Gen Dental Practice Management System (PMS)

Dokumen ini adalah standar kualitas dan keamanan mutlak yang **wajib dipatuhi secara otomatis** untuk seluruh pengembangan, penambahan fitur, refactoring, dan perbaikan bug di repositori **Dental-Apps** (`/Users/luky.septyan/Documents/PV Docs/Dental-Apps`).

---

## 1. Security-First Architecture & Medico-Legal Compliance (CRITICAL)

Seluruh layer aplikasi (Backend API, Next.js Server Actions, Database/Supabase RLS, File Storage, Frontend, Auth) wajib menerapkan standar keamanan data medis tingkat tinggi (*HIPAA-adjacent, UU PDP, & Permenkes Rekam Medis Elektronik*):

### 1.1 OWASP API Security Top 10 + Standar Klinis
- **BOLA (Broken Object Level Authorization) / IDOR:** Setiap query/mutasi data rekam medis, odontogram, rontgen, dan tagihan WAJIB memvalidasi kepemilikan data pengguna dan klinik (`patient_id` dan `clinic_id`). Dilarang mempercayai ID dari parameter URL/client tanpa validasi sesi aktif.
- **BFLA (Broken Function Level Authorization) & RBAC Klinis Ketat:**
  - Enforce pemisahan peran yang tegas: `SuperAdmin`, `ClinicOwner`, `Dentist` (Dokter Gigi), `DentalNurse` (Perawat), `Receptionist` (Resepsionis), `Cashier` (Kasir).
  - Hak akses penulisan diagnosis, odontogram, dan resep obat **diisolasi mutlak hanya untuk peran `Dentist`**.
  - Dilarang hanya menyembunyikan tombol di frontend; validasi izin wajib dieksekusi di server/RLS database.
- **BOPLA (Broken Object Property Level Authorization) & Anti-Mass Assignment:**
  - Semua payload wajib divalidasi dengan runtime schema Zod yang ketat (`.strict()`).
  - Tolak atribut liar (seperti `role`, `clinic_id`, `status_pembayaran`, atau `discount_percent`) yang disisipkan oleh attacker pada request create/update.
- **Injection Prevention:** Gunakan parameterized queries / ORM (Supabase/Prisma/PostgreSQL). Dilarang keras merangkai string unvalidated input ke dalam query SQL atau command sistem.
- **Data Exposure & Secret Leakage:** Larang keras mengembalikan stack trace, library traceback, DB internals, token rahasia, atau field PII pasien yang tidak dibutuhkan ke response API client.

### 1.2 Multi-Tenancy & Clinical Data Isolation
- Setiap tabel yang menyimpan data operasional (`patients`, `medical_records`, `odontograms`, `appointments`, `invoices`, `inventories`) **wajib memiliki kolom `clinic_id`**.
- Penegakan **Supabase Row-Level Security (RLS)** wajib aktif di setiap tabel. Akses data antar-cabang/antar-klinik terisolasi penuh; staf Klinik Cabang A tidak boleh memiliki celah membaca data Klinik Cabang B.

### 1.3 Keamanan Berkas Medis (Rontgen, Foto Intraoral, DICOM)
- **Private Storage Bucket:** Seluruh berkas citra medis pasien wajib disimpan di bucket penyimpanan bertipe **Private** (bukan Public).
- **Time-Limited Signed URLs:** Akses citra rontgen atau foto klinis hanya boleh melalui *Signed URL* berbatas waktu pendek (**TTL maksimal 15 menit**).
- **MIME & Magic Bytes Validation:** Validasi berkas upload wajib memeriksa *Magic Bytes* (header biner asli), bukan hanya ekstensi file.
- **EXIF Metadata Stripping:** Otomatis bersihkan metadata EXIF (terutama koordinat GPS dan identitas perangkat) saat berkas diunggah demi melindungi privasi pasien.
- **Ekstensi Terlarang:** Larang keras upload format yang dapat mengeksekusi script (SVG tanpa sanitasi ekstrem, HTML, berkas executable `.exe`/`.sh`/`.php`/`.js`).

### 1.4 Perlindungan PHI / PII & Kebijakan Zero-Logging
- **Zero-Logging Data Medis:** Dilarang keras mencatat Protected Health Information (PHI) seperti NIK, nomor rekam medis, nama lengkap, riwayat penyakit menular (HIV/Hepatitis), foto rontgen, dan diagnosa ke log server publik atau monitoring eksternal (Sentry, Datadog, console log).
- **Data Masking di UI Sekunder:** Masking data sensitif pada tampilan non-rekam medis (misal NIK: `3172********0001`, Nomor Telepon: `0812****7890`).

### 1.5 Next.js App Router & Server Actions Hardening
- **Server Action Auth Guard:** Setiap Server Action yang melakukan mutasi data wajib memvalidasi sesi pengguna (`supabase.auth.getUser()`) dan hak akses peran pada baris paling pertama di dalam fungsi.
- **Isolasi Rahasia Server:** `SUPABASE_SERVICE_ROLE_KEY` dan secret API lainnya dilarang keras diberi prefix `NEXT_PUBLIC_` atau diimpor ke file/komponen bertanda `'use client'`.
- **SSRF & Webhook Protection:** Validasi ketat URL tujuan pada integrasi pihak ketiga (WhatsApp gateway, SatuSehat Kemenkes, Payment Gateway). Blokir alamat internal/loopback (`127.0.0.1`, `localhost`, `169.254.169.254`).

### 1.6 Rate Limiting, Brute Force & Anti-Scraping
- Terapkan rate limit ketat pada endpoint autentikasi: login, OTP WhatsApp/SMS, reset password, dan endpoint ekspor data pasien massal (`/api/patients/export`).
- Terapkan exponential backoff dan mekanisme lockout sementara setelah percobaan login berulang yang gagal.

### 1.7 Concurrency Control & Database Locking (Race Condition Prevention)
- **Dental Chair & Dentist Scheduling:** Gunakan database transaction dengan *pessimistic locking* (`SELECT ... FOR UPDATE`) untuk proses booking kursi gigi dan jadwal dokter guna mencegah *double-booking* akibat klik simultan.
- **Billing & Kasir:** Transaksi pembayaran, penggunaan deposit pasien, dan potongan kupon/diskon wajib dibungkus dalam serializable transaction untuk mencegah celah *double-spend* atau duplikasi kwitansi.

### 1.8 Immutable Medico-Legal Audit Trail
- **Larangan Hard-Delete:** Sesuai undang-undang rekam medis elektronik, catatan medis klinis (SOAP, odontogram, resep, riwayat alergi) **DILARANG DI-HARD DELETE**. Gunakan mekanisme *soft-delete* dengan retensi hukum medis atau *append-only versioning*.
- **Pencatatan Jejak Audit:** Setiap perubahan atau penghapusan data medis wajib mencatat riwayat audit tak terhapuskan (*immutable audit log*): `timestamp`, `user_id`, `role`, `ip_address`, `action`, `previous_state`, `new_state`.

### 1.9 Keamanan Sesi Terminal Klinik (Shared Operatory Environment)
- **Auto-Lock Inactivity Timeout:** Sistem wajib menerapkan auto-lock layar setelah **15 menit tanpa aktivitas** untuk melindungi data pasien di komputer meja periksa yang ditinggal dokter/perawat.
- **Secure Cookie Flags:** Cookie sesi wajib menggunakan atribut: `HttpOnly`, `Secure`, `SameSite=Strict`, dan berawalan prefix `__Host-` pada environment produksi.

---

## 2. Industry Best Practices (Full Stack, Flow, Logic & UI/UX)

- **Zero-Bug Standard & Comprehensive E2E Impact Analysis (MANDATORY):**
  - Setiap kali ada update kode, perbaikan bug, atau penambahan fitur, asisten WAJIB melakukan penelusuran menyeluruh (*root-cause tracing & downstream impact analysis*) ke SELURUH layer: Database/Supabase RLS, Service layer, Caching/SessionStorage/LocalStorage, Global state, UI components, Layouts, Odontogram canvas, Tab navigation, hingga Route guards.
  - DILARANG KERAS hanya mengupdate satu bagian dan membiarkan file terkait lainnya menampilkan data usang, broken type, atau bug sampingan.
- **Zero Stale Cache:**
  - Cache client-side (`sessionStorage`, `localStorage`, memory) dilarang menahan data usang (*stale state*).
  - Terapkan TTL yang terukur, mekanisme revalidasi aktif, sinkronisasi lintas-tab (`storage` event), dan Supabase Realtime synchronization agar perubahan status gigi, antrean, atau tagihan langsung terefleksi seketika di seluruh klien klinik.
- **Code Quality & Architecture:**
  - Clean Architecture & pemisahan peran modular: logika bisnis di `/lib/services/`, utilitas di `/lib/utils/`, komponen visual di `/components/`.
  - Prinsip DRY, SOLID, comprehensive error handling, dan robust typed error handling.
- **Logic & Flow:** Deterministic state machines, graceful degradation, comprehensive edge-case handling.
- **UI/UX Standards:**
  - Sediakan loading skeleton yang proporsional, genuine empty states, dan banner notifikasi ramah pengguna (Sonner toast).
  - Layout fitur terstruktur rapi menggunakan komponen Tabs standar dengan *magnetic pill* (`StandardSlidingTabs`).
- **Dokumentasi Modular Terpisah per Modul (`docs/modules/` - MANDATORY):**
  - Dokumentasi teknis detail setiap modul **WAJIB dibuat terpisah per file** di bawah direktori `docs/modules/<nomor>-<nama-modul>.md` (contoh: `01-live-floor.md`, `02-odontogram-emr.md`, `05-billing-pos.md`, dll.) dengan indeks dan matriks relasi di `docs/README.md`.
  - **DILARANG KERAS menyatukan seluruh dokumentasi teknis mendalam ke dalam 1 file raksasa**, guna menjaga efisiensi token LLM, presisi node Graphify, dan modularitas pemeliharaan.
  - Setiap file dokumentasi modul wajib memiliki 5 seksi seragam: (1) Overview & Aktor RBAC, (2) Business Logic & State Machine, (3) Data Contracts & Zod Schemas, (4) Security & RBAC Guards (BOLA/BFLA), dan (5) Komponen UI & Motion Interactions.
  - Setiap kali ada modifikasi alur klinis, database schema, atau arsitektur, asisten wajib langsung memperbarui file modul terkait di `docs/modules/`.

---

## 3. Larangan Mutlak Data Dummy & Hardcoded (Strict Anti-Mock Policy)

- **No Mock/Dummy Data in Production Flows:** Dilarang keras menampilkan dataset mock, array dummy hardcoded, data pasien palsu, atau static mock response pada alur aktif UI dan API (Odontogram, Rekam Medis, Janji Temu, Billing, Farmasi).
- **Real Dynamic Integration:** Seluruh data yang ditampilkan wajib berasal dari backend service nyata, database Supabase, atau telemetri sensor/alat gigi.
- **State Handling:** Jika data belum ada atau sedang dimuat, tampilkan *genuine empty state* yang informatif atau *loading skeleton*—jangan pernah menyisipkan fallback dummy fiktif. Simbol placeholder `—` (dash) hanya boleh dipakai untuk data yang memang bersifat opsional/kosong.

---

## 4. Isolasi Semantik Medis & Standar Desain Dental (MANDATORY)

Setiap implementasi visual wajib tunduk pada [color-palette.md](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/color-palette.md) dan [design-standards.md](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/design-standards.md):

1. **Pemisahan Semantik Medis (Medical Semantic Isolation):**
   - Warna diagnosis klinis gigi (karies `#DC2626`, tumpatan komposit `#2563EB`, saluran akar `#D97706`, kalkulus `#CA8A04`) **DILARANG KERAS** dipakai sebagai warna tombol umum, badge status non-medis, atau aksen UI dekoratif. Warna tersebut khusus dicadangkan untuk odontogram dan rekam medis pasien guna menghindari kesalahan diagnosis visual oleh dokter.
2. **Palet Identitas Klinik Butik Modern:**
   - Gunakan kanvas netral hangat anti-silau *Soft Bone* (`#F8F9FA`), identitas brand *Deep Forest Teal* (`#0F766E`), dan aksen tombol tindakan *Vibrant Mint* (`#14B8A6`). Hindari warna biru rumah sakit dingin peninggalan era usang.
   - Sediakan *Operatory Dim Mode* (`#090D16`) yang dirancang khusus untuk ruang tindakan dokter gigi agar tidak menyilaukan mata saat mengoperasikan lampu UV curing dan membaca rontgen.
3. **Standar Motion Fisika (Damped Spring Physics):**
   - Seluruh animasi transisi wajib mematuhi parameter fisika pegas teredam: *Spring Stiffness* `350`, *Damping* `32`, *Mass* `0.8`, dan *Durasi* `220ms–280ms`.
   - Navigasi tab klinis wajib menggunakan *Direction-Aware Sliding* dengan indikator kapsul magnetik (`layoutId="activeTabPill"`).

---

## 5. Integrasi Sinergis 5 Ekosistem Skill (STRICT ENFORCEMENT)

Setiap modifikasi kode di repositori Dental-Apps wajib mempekerjakan 5 ekosistem skill terpasang secara harmonis sesuai [skill_orchestration.md](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/skill_orchestration.md):

- **Defensive Security Gate (`Claude-BugHunter`):** Selalu jalankan audit proaktif keluarga `hunt-*` (`hunt-idor`, `hunt-auth-bypass`, `hunt-nextjs`, `hunt-file-upload`) sebagai gerbang pertama sebelum kode dianggap selesai.
- **Arsitektur & Minimalisme Kode (`ponytail`):** Jalankan tangga minimalis (stdlib > native web platform > dependensi terpasang > kode seminimal mungkin). Terapkan YAGNI, tolak abstraksi prematur, dan bereskan akar masalah pada shared utility. Persona cerewet/sinis dinonaktifkan total.
- **Standar UI & Aksesibilitas (`ui-ux-pro-max`):** Jaga konsistensi token warna, rasio kontras WCAG AA (minimal 4.5:1), touch target klinik minimum 44×44px, responsivitas tablet/desktop, dan feedback visual interaktif.
- **Estetika Butik Anti-Template (`frontend-design`):** Berikan arahan estetika berkarakter, tipografi elegan (Inter/Outfit), dan tata letak berwibawa khas klinik spesialis; tolak tampilan generic template AI.
- **Komunikasi Terse & Eksekusi Bedah (`caveman`):** Kendalikan format output eksternal agar ringkas, hemat token, berbasis fakta teknis, dipadukan dengan alur `investigate-first` dan perbaikan sempit `surgical-patch`.

---

## 6. Protokol Komunikasi & Format Respon (STRICT)

- **Lapisan Logika Internal (Internal Reasoning - Ponytail):**
  - Gunakan standar senior Ponytail untuk meninjau efisiensi kode, pencegahan edge case, dan penolakan overengineering.
  - Dilarang mengadopsi persona percakapan sinis, monolog panjang, atau keluhan bertele-tele.
- **Lapisan Output Eksternal (External Formatting - Caveman - HIGHEST PRIORITY):**
  - Seluruh teks balasan wajib tunduk pada format *smart caveman*: padat, to-the-point, hemat token, tanpa filler, basa-basi, atau salam pembuka/penutup.
  - Pola baku: `[Komponen/Entitas] [Tindakan] [Alasan teknis/keamanan]. [Langkah berikutnya/Diff].`
  - **Integritas Teknis Mutlak:** Blok kode, diff patch, command CLI, alert keamanan, dan terminologi medis gigi (SOAP, FDI tooth numbering, Odontogram) **DILARANG KERAS DIPOTONG ATAU DIRINGKAS SECARA KELIRU**.
  - **Bahasa:** Bahasa Indonesia dengan tingkat densitas informasi maksimal.

---

## 7. Sinkronisasi Knowledge Graph (Graphify Protocol)

- **Wajib Update Graphify Setiap Ada Perubahan Kode Nyata:**
  Setiap kali ada penambahan fitur, bugfix, refactoring, atau perubahan kode di proyek ini, asisten WAJIB menjalankan command:
  ```bash
  graphify update .
  ```
  di root direktori proyek (`/Users/luky.septyan/Documents/PV Docs/Dental-Apps`).
- **Tujuan:** Menjaga representasi AST, graph dependensi, komunitas arsitektur, dan relasi simbol di `graphify-out/` selalu sinkron dan akurat.

---

## 8. Verifikasi Selesai Sebelum Klaim Berhasil (Rigorous Verification Gate)

- Dilarang menyatakan suatu tugas perbaikan atau fitur "selesai" tanpa menjalankan perintah verifikasi riil di terminal:
  ```bash
  npm run build # atau tsc --noEmit && npm run lint
  ```
- Jika perintah verifikasi menghasilkan error atau peringatan tipe TypeScript, asisten wajib langsung memperbaikinya (*self-heal*) sebelum menyerahkan laporan akhir ke pengguna.