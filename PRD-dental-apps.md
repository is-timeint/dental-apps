# Product Requirement Document (PRD)
## Next-Gen Dental Practice Management System (PMS)

| Metadata | Spesifikasi |
| :--- | :--- |
| **Nama Dokumen** | PRD - Next-Gen Dental Practice Management System (Comprehensive Blueprint) |
| **Versi Dokumen** | 2.0.0 (Production-Ready Architecture) |
| **Target Platform** | Web PWA (Responsive Desktop, Tablet Landscape 3-Panel, Mobile Responsive) |
| **Klasifikasi Industri** | Dental Healthtech / Electronic Dental Record (EDR) / Practice Management System (PMS) |
| **Standar Regulasi** | Permenkes No. 24 Tahun 2022 (RME), UU No. 27 Tahun 2022 (UU PDP), HL7 FHIR (SATUSEHAT), ICD-10, ICD-9 CM, KFA Kemenkes, BPJS P-Care |

---

## 1. Executive Summary & Problem Statements

### 1.1 Latar Belakang
Aplikasi *Dental Practice Management System* (PMS) yang beredar di Indonesia saat ini (termasuk sistem internal klinik rantai besar) mayoritas merupakan adaptasi kaku dari sistem informasi rumah sakit (SIRS) atau klinik umum. Alur kerja klinik gigi memiliki kompleksitas unik yang tidak terakomodasi dengan baik:
* Anatomi visual gigi dengan 5 permukaan per elemen.
* Pemeriksaan jaringan periodontal (gusi).
* Ketergantungan pada dental lab eksternal untuk mahkota/aligner.
* Penggunaan Bahan Medis Habis Pakai (BMHP) berwujud pasta/cairan mikro.
* Tingginya risiko alergi obat anestesi dan penyakit sistemik pada tindakan bedah minor.

### 1.2 Masalah Utama Industri
1. **Odontogram Boros Klik & Lambat:** Dokter gigi harus mengklik berulang kali hanya untuk menandai satu kondisi gigi. Di tengah prosedur steril bersarung tangan (*gloves*), friksi ini membuat dokter enggan mencatat data klinis lengkap.
2. **Ketiadaan Pemeriksaan Periodontal Terintegrasi:** Sebagian besar sistem mengabaikan *periodontal charting* (saku gusi, perdarahan gusi, kegoyangan gigi) padahal ini standar baku diagnosa gigi.
3. **Selisih Stok Bahan (Phantom Stock):** BMHP seperti cairan etsa, resin komposit, dan bonding mustahil diukur dalam miligram atau tetes per pasien secara manual, menyebabkan audit stok bulanan selalu tekor.
4. **Perawatan Bertahap Terfragmentasi:** Prosedur medis multi-kunjungan (seperti Perawatan Saluran Akar/PSA dan ortodonsi) tercatat sebagai kunjungan tunggal terpisah tanpa rekap parameter teknis terpadu.
5. **Isolasi Alur Kerja Dental Lab:** Modul pemesanan mahkota gigi (*crown*) tidak terhubung ke kalender klinik, memicu insiden pasien sudah hadir kontrol namun cetakan lab belum dikirim vendor.
6. **Kerap Macet Akibat Integrasi API Pemerintah:** Sistem kasir kerap *freeze* saat transmisi data ke API SATUSEHAT Kemenkes RI mengalami keterlambatan jaringan.
7. **Ketergantungan Total pada Internet & Celah Konflik Data:** Aplikasi berbasis web murni mati total saat internet putus, sementara sistem sinkronisasi offline biasa rawan menimpa (*overwrite*) data diagnosa dokter.

### 1.3 Tujuan Produk (Objectives)
* Menghadirkan antarmuka sentuh berbasis web (*touch-first PWA*) dengan performa 60 FPS stabil pada tablet iPad/Android di meja periksa gigi (*chair-side*).
* Memangkas waktu pengisian rekam medis dan odontogram hingga di bawah 90 detik per pasien.
* Mengeliminasi insiden pasien hadir tanpa kesiapan alat lab hingga 0 kasus melalui mekanisme *Schedule Interlock*.
* Menjaga selisih stok BMHP di bawah 3% menggunakan metode otomatisasi formula tindakan (*Procedure-Based Bill of Materials*).
* Menyediakan fungsionalitas *offline-first* dengan resolusi konflik *Attribute-Level CRDT / Field Merge* sehingga data klinis dokter tidak pernah terhapus.
* Kepatuhan hukum medis 100% terhadap Permenkes No. 24/2022 (retensi 25 tahun, immutable audit trail) dan UU Perlindungan Data Pribadi (UU PDP).

---

## 2. User Persona, Access Control (RBAC) & Multi-Tenancy

### 2.1 Multi-Tenancy & Tenant Scoping Mutlak
Aplikasi dirancang dengan arsitektur **Multi-Clinic & Multi-Branch**:
* Seluruh data operasional dan rekam medis diisolasi ketat menggunakan pengenal unik klinik (`clinic_id`) dan cabang (`branch_id`).
* Penegakan isolasi dilakukan pada level database menggunakan **Supabase Row-Level Security (RLS)** dan guard di server service layer.
* Akses data antar-klinik/cabang terisolasi penuh guna mencegah kebocoran BOLA/IDOR; staf Klinik Cabang A tidak memiliki izin membaca data pasien Klinik Cabang B tanpa transfer berkas resmi.

### 2.2 Role-Based Access Control (RBAC) Klinis

| Role Code | Nama Peran | Tanggung Jawab Utama | Batasan Akses Kunci | Form Factor Utama |
| :--- | :--- | :--- | :--- | :--- |
| `ROLE_DENTIST` | Dokter Gigi (GP & Spesialis) | Diagnosa, input odontogram, perio charting, rencana perawatan, SOAP, e-preskripsi, rontgen. | Hak eksklusif menulis diagnosa medis, resep obat, dan odontogram. Dilarang mengubah tarif dasar klinik. | Tablet Landscape (Chair-side) |
| `ROLE_NURSE` | Perawat / Dental Assistant | Asistensi tindakan, dokumentasi verbal, input tanda vital/triage, persiapan alat, log autoklaf. | Akses input tanda vital, inventaris BMHP, dan dictation mode. Dilarang mengesahkan diagnosa/resep. | Tablet Landscape / Portrait |
| `ROLE_FRONTDESK` | Front Desk / Resepsionis | Registrasi pasien, antrean fisik, penjadwalan dental chair, penagihan kasir, pelacakan kurir lab. | Akses Live Floor, POS, registrasi. Dilarang mengedit catatan klinis dokter. | Desktop Web / Tablet Kasir |
| `ROLE_PHARMACIST` | Asisten Apoteker / Farmasi | Verifikasi resep digital, peracikan obat, penyerahan obat ke pasien, mutasi stok obat. | Akses modul e-Prescription & stok farmasi. Dilarang mengubah catatan tindakan medis. | Desktop / Tablet Farmasi |
| `ROLE_ADMIN` | Clinic Owner / Supervisor | Manajemen multi-cabang, otorisasi refund, audit stok opname, laporan komisi, log audit forensik. | Full Access ke laporan keuangan, audit trail, dan master settings. | Desktop / Laptop / Mobile |
| `ROLE_VENDOR_LAB` | Vendor Dental Lab | Memperbarui progres produksi mahkota/aligner, upload foto hasil, input resi kurir. | Akses portal eksternal terbatas (hanya pesanan lab terkait vendor bersangkutan). | Mobile Web / Smartphone |

---

## 3. Arsitektur Sistem & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (PWA Standalone)                              │
│ Next.js 19 (App Router) + React Compiler | Tailwind CSS + Shadcn UI | Vaul Drawer      │
│ State: Zustand | Data Fetch: TanStack Query v5 | Offline Engine: Dexie.js (IDB)        │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / WebSockets (WSS)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY & SERVICE LAYER (Next.js / Node.js)                 │
│ Next.js Server Actions + Fastify Microservices | TypeScript | Zod Strict Validation    │
│ Supabase Client & Server Auth | Row-Level Security (RLS) Enforcer                      │
└───────────────────┬───────────────────────┬────────────────────────────┬───────────────┘
                    │                       │                            │
                    ▼                       ▼                            ▼
┌──────────────────────────┐    ┌──────────────────────┐    ┌────────────────────────────┐
│   PostgreSQL 16+         │    │   Redis + BullMQ     │    │   Cloudflare R2 (S3-API)   │
│ - Relational Clinical Core│    │ - SATUSEHAT Worker   │    │ - Private Buckets Only     │
│ - Multi-Tenant (clinic_id)│    │ - WhatsApp CRM Bot   │    │ - Signed URLs (TTL ≤15 min)│
│ - Odontogram JSONB Snap  │    │ - Background Sync    │    │ - DICOM & 3D STL Storage   │
│ - Immutable Audit Logs   │    │ - Lab SLA Monitors   │    │ - Auto EXIF Stripping      │
└──────────────────────────┘    └──────────────────────┘    └────────────────────────────┘
                    ▲
                    │ Secure Ingestion (HTTPS API)
┌───────────────────┴────────────────────────────────────────────────────────────────────┐
│                           LOCAL EDGE AGENT (Klinik Fisik)                              │
│ Daemon Ringan (Go / Rust) di PC Ruang Radiologi                                        │
│ Fitur: Local Directory Watcher -> Automatic Metadata Matching -> Direct Encrypted Upload│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Frontend & Touch Engine
* **Framework:** Next.js 19 (App Router) dengan React Compiler bawaan (zero memo boilerplate).
* **State Management:** Zustand untuk UI state lokal & audio calling; TanStack Query v5 untuk revalidasi aktif server state.
* **Mesin Grafis Odontogram & Perio:** SVG Interaktif Termediasi (vektor HiDPI tajam, bebas lag, touch-friendly).
* **Pencitraan Medis & 3D:**
  * `Cornerstone.js`: Rendering citra radiologi 2D DICOM dengan kontrol window/leveling, invert, dan zoom.
  * `Three.js`: Visualisasi interaktif berkas 3D pemindai intraoral (`.STL` dan `.PLY`).

### 3.2 Backend & Data Layer
* **Basis Data:** PostgreSQL 16+ (Supabase) dengan schema multi-tenant ketat dan RLS.
* **Message Queue:** Redis dan BullMQ untuk eksekusi tugas latar belakang (SATUSEHAT, WhatsApp CRM, notifikasi kurir lab, BPJS P-Care sync).
* **Storage Provider:** Cloudflare R2 (S3-compatible) berstatus **Private**. Akses aset citra medis hanya melalui *Presigned Signed URLs* dengan batas waktu (TTL maksimal 15 menit). Metadata EXIF otomatis dibersihkan saat upload.

---

## 4. Standar UI/UX Native-Feel PWA

Aplikasi wajib memberikan pengalaman pengguna setara aplikasi native pada tablet iPad/Android:

### 4.1 CSS Touch Engine Lockdown
```css
html, body {
  overscroll-behavior-y: none;
  overflow: hidden;
  height: 100dvh; /* Dynamic Viewport: Menyesuaikan keyboard virtual */
}

/* Mematikan highlight seleksi teks pada komponen operasional */
.interactive-surface, .odontogram-tooth, button {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation; /* Menghapus jeda tap 300ms */
}

/* Mengizinkan seleksi teks hanya pada kolom input formulir */
input, textarea {
  user-select: text;
  -webkit-user-select: text;
}
```

### 4.2 Standar Komponen Sentuh & Motion Fisika
* **Ukuran Target Sentuh:** Semua elemen tombol klinis dan palet gigi wajib memiliki luas minimal **48×48 px** (toleransi minimum tablet operator).
* **Bottom Sheet over Modals:** Menggantikan popup modal konvensional dengan drawer bottom sheet (menggunakan library `vaul`) yang mendukung gestur seret (*swipe-down to dismiss*).
* **Umpan Balik Taptic (Haptic Feedback):** Memanfaatkan Web Vibration API (`navigator.vibrate(12)`) untuk getaran mikro halus saat dokter menyentuh permukaan gigi atau mengonfirmasi tindakan.
* **Motion Physics:** Tunduk pada parameter **Damped Spring Physics** (Stiffness `350`, Damping `32`, Mass `0.8`, Durasi `220ms–280ms`). Tab klinis wajib menggunakan *direction-aware sliding* dengan *magnetic pill* (`layoutId="activeTabPill"`).
* **Optimistic UI Updates:** Manipulasi status odontogram dan checklist tindakan direfleksikan seketika di layar (0 milidetik), sebelum respons server backend diterima.

---

## 5. Spesifikasi Kebutuhan Fungsional (FRD)

### 5.1 Modul 1: Live Floor & Chair Operations
* **Matriks Status Kursi Real-Time:** Menampilkan status kursi: *Available* (Hijau), *Seated* (Biru), *In-Treatment* (Kuning), *Sanitizing* (Oranye), *Out-of-Order* (Merah).
* **Waiting Room Integration:** Menggeser pasien dari antrean ruang tunggu langsung ke kursi tertentu (*Drag-and-Drop* atau *Quick Assign*).
* **Quick Handoff:** Fitur perpindahan pasien sementara (misal: Kursi 1 $\rightarrow$ Ruang Rontgen $\rightarrow$ Kursi 1) tanpa memutus sesi EMR aktif dokter.

### 5.2 Modul 2: Clinical Workspace & Odontogram 2.0 (Core EMR)
* **Odontogram Dewasa & Anak:**
  * 32 gigi permanen (FDI: 11–48) dan 20 gigi susu (FDI: 51–85).
  * 5 bidang sentuh per gigi: Mesial, Distal, Occlusal/Incisal, Buccal/Labial, Lingual/Palatal.
* **Smart Batch Brush & Macro Presets:**
  * Palet kuas cepat: Karies, Tambalan Komposit, Amalgam, Sisa Akar, Gigi Hilang, Porselen/Crown, Implan.
  * Tombol Makro: *"Scaling Full Mouth"* (otomatis menandai seluruh kuadran dengan diagnosis kalkulus dalam 1 tap).
* **Assistant / Dictation Mode:** Antarmuka pendamping di sisi kanan layar untuk asisten/perawat dengan tombol konfirmasi besar untuk mencatat instruksi verbal dokter saat sarung tangan basah/steril.
* **Episode of Care Engine (Perawatan Bertahap):**
  * Penyatuan kunjungan berkala ke dalam satu ID Tiket Kasus Induk (contoh: Kasus PSA Gigi 46).
  * Kartu pelacak endodontik: Panjang kerja (*working length* dalam mm), nomor jarum preparasi (*master apical file*), dan medikamen intrakanal.
* **Treatment Plan Quotation & Multi-Opsi:**
  * Dokter dapat menyusun opsi perawatan alternatif (Opsi A vs Opsi B) beserta estimasi biaya dan durasi kunjungan. Pasien menyetujui opsi pilihan sebelum tindakan dimulai.
* **Informed Consent Digital Berstandar Hukum (UU ITE):**
  * Penandatanganan dokumen persetujuan medis langsung di atas layar tablet dengan jari/stylus.
  * Sistem meng-embed tanda tangan, stempel waktu ISO, ID dokter, dan IP address ke dokumen PDF/A terenkripsi (*tamper-evident hash*).

### 5.3 Modul 3: Dental Lab Hub & Schedule Interlock
* **Pembuat SPK Digital:** Formulir pemesanan lab: Nomor elemen gigi, panduan warna (VITA Classical Shade A1–D4), tipe bahan (Zirconia, E-Max, Logam Porselen, Akrilik), batas waktu pengerjaan (*due date*), dan lampiran berkas `.STL`.
* **Papan Alur Kerja Kanban:** Kolom tahapan: *Draft $\rightarrow$ Sample Sent $\rightarrow$ In Production $\rightarrow$ Received at Clinic $\rightarrow$ Fitted $\rightarrow$ Revision*.
* **Schedule Interlock Engine:** Resepsionis/kasir secara sistematis **DIBLOKIR** untuk menjadwalkan kunjungan pasang mahkota/alat lab jika status pesanan di sistem belum bernilai *"Received at Clinic"*.

### 5.4 Modul 4: Inventaris & Smart BMHP (Procedure-Based BOM)
* **Procedure-Based Bill of Materials (BOM):** Formula otomatis depresiasi bahan per jenis tindakan (contoh: 1 Penambalan Komposit Kelas II otomatis memotong: 1 saliva ejector, 1 articulating paper, 1 microbrush, 0.05 syringe resin komposit, 0.1 mL asam etsa).
* **High-Value Item Lot Tracking:** Wajib memindai barcode/nomor lot dan batas kedaluwarsa untuk barang bernilai tinggi (implan gigi, membran tulang, bracket ortodonsi).
* **Variance Tolerance Setting:** Konfigurasi batas penyusutan wajar bulanan (5–10%) untuk bahan pasta/cairan pada audit stok opname.
* **Log Sterilisasi Autoklaf:** Pencatatan nomor batch mesin sterilisasi dan penempelan barcode pada kantong instrumen medis steril (*pouch*).

### 5.5 Modul 5: Enterprise Billing POS, Multi-Bucket Split & Commission Engine
* **Multi-Bucket Split Billing:** Pemisahan otomatis pos pendapatan ke dalam 5 akun buku besar (General Ledger):
  1. *Jasa Medis Tindakan Dokter* (Professional Fee).
  2. *Biaya Dental Lab Passthrough* (Crown, Aligner, Denture).
  3. *Konsumsi BMHP Khusus* (Implan, Bone Graft, Membran).
  4. *Farmasi & Resep Obat* (Antibiotik, Analgesik, Antiseptik).
  5. *Biaya Sarana & Administrasi Faskes* (Clinic Facility Fee).
* **Multi-Tender Payment Architecture:** Kemampuan membagi pembayaran tunggal ke beberapa instrumen sekaligus dalam 1 faktur:
  * *QRIS Dinamis:* Pembuatan QRIS realtime dengan nominal tepat (zero human-error) dan webhook auto-settlement.
  * *Mesin EDC Ganda:* Pencatatan Batch Number dan Approval Code untuk Debit & Kartu Kredit (BCA/Mandiri/BRI).
  * *Asuransi / TPA Co-Payment & Excess:* Integrasi pemisahan tanggungan asuransi korporat vs pembayaran ekses pasien seketika.
  * *Deposit Escrow Multi-Visit:* Penampungan dana muka (DP) tindakan ortodonsi/implan yang terkunci aman dan didebet proporsional per tahapan kunjungan.
* **Automated Doctor Commission & PPh 21 Calculation:**
  $$\text{Dasar Pengenaan Jasa} = \text{Tarif Tindakan} - \text{Biaya Dental Lab} - \text{Bahan Khusus}$$
  $$\text{Honor Bruto Dokter} = \text{Dasar Pengenaan Jasa} \times \text{Persentase Kontrak Komisi (e.g. 40--50\%)}$$
  $$\text{PPh 21 Dokter Gigi (Bukan Pegawai)} = 50\% \times \text{Honor Bruto} \times \text{Tarif Efektif Progresif (PPh 21 Tenaga Ahli)}$$
  $$\text{Honor Bersih Take-Home Pay} = \text{Honor Bruto} - \text{PPh 21}$$
* **Unit Economics & Margin Analisis per Tindakan (P&L Chair-Side):**
  * Dasbor visual menampilkan *Gross Margin Klinik* per elemen tindakan medis secara transparan:
    $$\text{Margin Bersih Klinik} = \text{Tarif Pasien} - (\text{Honor Dokter} + \text{Biaya Lab} + \text{Depresiasi BMHP BOM})$$
* **Faktur Pajak & Kwitansi Resmi Elektronik:** Penomoran faktur standar mediko-legal, QR verification hash anti-pemalsuan, dan opsi kirim invoice PDF resmi via WhatsApp pasien.

### 5.6 Modul 6: Local Edge Agent (Auto X-Ray Ingestion)
* **Folder Watcher:** Daemon latar belakang (Go/Rust) memantau folder ekspor lokal hasil tangkapan software radiologi (Vatech, Carestream, Dexis, Sirona).
* **Ekstraksi Metadata & Auto-Upload:** Mendeteksi berkas baru, mencocokkan Nomor Rekam Medis pasien aktif, membersihkan EXIF, lalu mengunggah file langsung ke Cloudflare R2 secara otomatis dalam <5 detik tanpa upload manual via browser.

### 5.7 Modul 7: SATUSEHAT Interoperability Engine
* **Pemetaan Resource FHIR:** Mentransformasikan rekam medis lokal ke format standar: `Patient`, `Encounter`, `Condition` (ICD-10), `Procedure` (ICD-9 CM), `MedicationRequest` (KFA), dan `Observation` (Tanda Vital).
* **Asynchronous Queue Worker:** Seluruh proses pengiriman payload dikelola di latar belakang oleh BullMQ & Redis. Kasir dan penutupan kunjungan dokter **zero-freeze** saat endpoint Kemenkes lambat.
* **Dasbor Log Transmisi:** Pemantauan status kirim data (*Sent, Pending, Failed*) dengan mekanisme *Exponential Backoff Auto-Retry*.

### 5.8 Modul 8: Automated WhatsApp CRM & Patient Recall Engine
* **Automated Appointment Reminder:** Pengiriman pengingat reservasi otomatis ke WhatsApp pasien pada H-1 dan H-3 jam sebelum jadwal tindakan dengan tombol interaktif (Konfirmasi Hadir / Reschedule).
* **Post-Op Care Automated Follow-up:** Pesan pemantauan otomatis pada H+1 pasca prosedur bedah (cabut gigi, impaksi, implan) berisi instruksi perawatan luka dan formulir keluhan rasa sakit (*pain scale*).
* **Automated 6-Month Hygiene Recall:** Sistem memindai riwayat kunjungan dan otomatis mengirimkan pesan pengingat pemeriksaan berkala dan scaling setiap 6 bulan sejak kunjungan terakhir.

### 5.9 Modul 9: Multi-Branch Logistics & Inter-Branch Stock Transfer
* **Surat Jalan Mutasi Antar-Cabang:** Alur transfer inventaris BMHP dari Gudang Pusat ke cabang, atau pinjam-meminjam bahan antar-klinik: *Draft Transfer $\rightarrow$ In-Transit $\rightarrow$ Received & Verified*.
* **Centralized Price Book vs Local Override:** Penetapan tarif tindakan dasar terpusat dari kantor pusat dengan fleksibilitas penyesuaian tarif lokal berbasis kluster cabang.

### 5.10 Modul 10: TPA & Corporate Insurance Claim Splitter
* **Co-Payment & Excess Calculator:** Pemisahan tagihan otomatis antara limit plafon asuransi (AdMedika, Reliance, dll.) dengan ekses biaya pribadi yang wajib dibayar tunai/QRIS oleh pasien di kasir.
* **Claim Document Generator:** Ekspor berkas klaim digital berisi rekap tindakan, kode diagnosa ICD-10, dan lampiran foto rontgen sebelum/sesudah tindakan dalam 1 berkas PDF terstandarisasi.

### 5.11 Modul 11: e-Prescription & Kamus Farmasi (KFA Kemenkes)
* **Pembuatan Resep Elektronik:** Dokter meresepkan obat langsung dari ruang periksa (antibiotik, analgesik, anti-inflamasi, obat kumur klorheksidin).
* **Master Obat Terstandar KFA:** Database obat terpetakan ke kode 9-digit Kamus Farmasi dan Alat Kesehatan (KFA) Kemenkes untuk bridging SATUSEHAT.
* **Drug Interaction & Allergy Alerts:** Peringatan otomatis seketika jika dokter meresepkan obat yang memicu reaksi silang terhadap riwayat alergi pasien (misal alergi penisilin terhadap amoxicillin).
* **Alur Dispensing & Verifikasi 7 Benar:** Antarmuka farmasi untuk telaah resep, konfirmasi peracikan (*Dispensed*), dan pencetakan etiket aturan pakai obat ber-QR Code.

### 5.12 Modul 12: Periodontal Charting & Oral Hygiene Index (Pemeriksaan Gusi)
* **6-Point Probing Depth (PPD) per Gigi:** Pencatatan kedalaman saku gusi pada 6 titik per elemen gigi: Mesio-buccal, Mid-buccal, Disto-buccal, Mesio-lingual, Mid-lingual, Disto-lingual.
* **Parameter Klinis Periodonsium:** Pencatatan *Bleeding on Probing* (BOP), *Gingival Recession*, *Furcation Involvement* (Kelas I–IV), dan *Tooth Mobility* (Derajat goyang 1–3).
* **Visualisasi Peta Gusi Terstandar:** Grafik kedalaman saku gusi interaktif dengan kode warna klinis (Hijau $\le 3\text{mm}$ sehat, Kuning $4\text{--}5\text{mm}$ gingivitis/periodontitis ringan, Merah $\ge 6\text{mm}$ periodontitis dalam).
* **Oral Hygiene Index Simplified (OHI-S):** Kalkulasi otomatis skor Debris Index (DI) dan Calculus Index (CI) untuk memantau kebersihan mulut berkala pasien.

### 5.13 Modul 13: Physical Queue TV Display & Audio Calling System
* **Layar TV Antrean Ruang Tunggu:** Tampilan antrean publik interaktif berbasis web (terhubung via WebSockets/Supabase Realtime) yang menampilkan nomor antrean sedang dipanggil dan estimasi waktu tunggu.
* **Sistem Panggilan Suara Otomatis (Text-to-Speech):** Panggilan suara jernih otomatis dalam Bahasa Indonesia dan English saat dokter atau perawat menekan tombol *"Panggil Pasien"* di tablet:
  > *"Nomor antrean A-12, Bapak Andi, silakan menuju Ruang Periksa Gigi 1."*
* **Multi-Loket & Multi-Poli Antrean:** Dukungan pemisahan antrean: Poli Gigi Umum, Poli Spesialis Bedah Mulut/Orto, dan Loket Kasir/Farmasi.

### 5.14 Modul 14: Clinical Safety Interlock & Triage Medis (Vital Signs)
* **Pemeriksaan Tanda Vital Wajib:** Pengukuran Tekanan Darah (Sistolik/Diastolik), Denyut Nadi, Laju Pernapasan, dan Skala Nyeri sebelum tindakan invasif.
* **Critical Medical Safety Interlocks (Hard-Stop Alerts):**
  * **Hipertensi Berat ($TD \ge 160/100\text{ mmHg}$):** Sistem mengunci opsi penggunaan anestesi lokal dengan vasokonstriktor (Epinefrin/Adrenalin) dan menampilkan rekomendasi anestesi murni (Mepivacaine 3%).
  * **Gangguan Koagulasi / Konsumsi Antikoagulan (Warfarin/Aspirin):** Peringatan bahaya perdarahan masif pada rencana pencabutan gigi/bedah impaksi.
  * **Trimester Pertama Kehamilan:** Peringatan otomatis pembatasan paparan sinar-X radiologi dan larangan obat kategori teratogenik.
  * **Alat Pacu Jantung (Cardiac Pacemaker):** Peringatan keras larangan penggunaan *ultrasonic scaler* magnetostriktif di dekat pasien.

### 5.15 Modul 15: Enterprise Rekonsiliasi Kasir, Blind Drop Shift & Anti-Fraud
* **Buka-Tutup Shift Kasir (Cash Drawer Management):** Pencatatan saldo kas kecil awal (*opening float*), riwayat serah-terima laci kas antar-kasir (Shift Pagi $\rightarrow$ Shift Sore).
* **Blind Drop Cash Reconciliation (Anti-Collusion):** Kasir wajib menghitung dan memasukkan uang fisik secara buta tanpa melihat angka total sistem terlebih dahulu. Sistem kemudian membandingkan dan mendeteksi:
  * *Variance Nol (Seimbang / Balanced).*
  * *Shortage (Selisih Kurang - Wajib Berita Acara Kasir).*
  * *Overage (Selisih Lebih).*
* **Otorisasi Void & Refund 2-Factor Approval:** Setiap pembatalan invoice atau refund dana DP pasien wajib memasukkan PIN otorisasi Supervisor / Clinic Owner dengan pencatatan alasan pembatalan ke immutable audit log.
* **Slip Setoran Bank (Cash Drop Bagging):** Pembuatan dokumen setoran uang tunai harian ke rekening operasional klinik dengan kode barcode kantong setoran (*tamper-evident cash bag*).

### 5.16 Modul 16: Bridging BPJS Kesehatan P-Care Gigi (Add-On Extension)
* **Validasi Peserta BPJS:** Pengecekan status keaktifan kepesertaan BPJS pasien menggunakan NIK/Nomor BPJS secara instan.
* **Pendaftaran Kunjungan P-Care:** Bridging pendaftaran faskes tingkat pertama (FKTP) langsung ke server BPJS Kesehatan.
* **Entri Tindakan Kapitasi & Non-Kapitasi:** Sinkronisasi kode diagnosa ICD-10 dan tindakan gigi (pencabutan gigi sulung, tumpatan GIC, scaling berkala) tanpa perlu input ganda (*double entry*) di aplikasi P-Care manual.

### 5.17 Modul 17: Medico-Legal Audit Trail & Forensik Akses Data (Permenkes 24/2022 & UU PDP)
* **Antarmuka Forensik Khusus (Audit Trail Viewer):** Dasbor investigasi mediko-legal terpadu untuk `ROLE_ADMIN` dan Komite Etik/Hukum Klinik.
* **Taksonomi Peristiwa Lengkap:**
  * `READ_EMR`: Pelacakan siapa saja staf yang membuka rekam medis pasien (termasuk deteksi unauthorized snooping pada profil pasien VIP/selebritas).
  * `UPDATE_ODONTOGRAM`: Pencatatan perubahan kondisi elemen gigi dengan visualisasi diff field (*sebelum vs sesudah*).
  * `PRESCRIBE_MEDICATION`: Riwayat peresepan dan pengubahan dosis obat.
  * `VOID_REFUND_INVOICE`: Riwayat pembatalan transaksi kasir beserta nama supervisor yang mengotorisasi.
  * `EXPORT_DATA`: Log setiap pencetakan fisik atau ekspor PDF/Excel rekam medis ke media eksternal.
* **Perekaman Konteks Forensik Lengkap:** Setiap log menyimpan timestamp UTC akurat, ID Klinik, User ID, Nama Staf, Peran RBAC, Alamat IP V4/V6, User-Agent browser, serta ringkasan perubahan JSON (`old_values` vs `new_values`).
* **Integritas Tak Terhapuskan (Immutable Append-Only):** Dilarang menyediakan fungsi edit atau hapus (*DELETE/UPDATE*) pada tabel audit log, dilindungi oleh database trigger PostgreSQL.

---

## 6. Spesifikasi Kebutuhan Non-Fungsional (NFR)

### 6.1 Performa & Interaktivitas
* **Frame Rate Antarmuka:** Interaksi kuas odontogram dan navigasi tab klinis pada tablet wajib berjalan konstan pada **60 FPS** (durasi pemrosesan render $<16\text{ ms}$).
* **Waktu Muat Aplikasi (Cold Start):** Halaman awal aplikasi harus terbuka dalam waktu $<1.5\text{ detik}$ pada koneksi 4G standar.

### 6.2 Resiliensi Jaringan & Offline-First
* **Kapasitas Penyimpanan Lokal:** Menggunakan IndexedDB via Dexie.js dengan alokasi hingga 500 MB (cukup untuk rekam medis dan odontogram pasien aktif 1 bulan).
* **Offline Operations:** Dokter dan perawat tetap dapat menginput catatan SOAP, merubah status permukaan gigi, dan membuat invoice saat internet terputus total.
* **Resolusi Konflik Lanjutan (Attribute-Level CRDT / Field Merge):**
  * DILARANG menggunakan Last-Write-Wins (LWW) sederhana pada rekam medis.
  * Jika dokter mengedit kondisi klinis gigi dan perawat mengedit checklist bahan BMHP secara offline, data keduanya digabungkan (*merged*) pada tingkat atribut field tanpa saling menimpa data diagnosa.

### 6.3 Keamanan, Kepatuhan Medis & Privasi (HIPAA & UU PDP)
* **Enkripsi Data:** Standar TLS 1.3 untuk data dalam transmisi (*data-in-transit*) dan enkripsi AES-256 untuk data tersimpan (*data-at-rest*), termasuk citra radiologi dan berkas 3D.
* **Private Storage & Short-Lived Signed URLs:** Seluruh berkas rontgen di Cloudflare R2 berstatus *private* dan hanya dapat diakses melalui URL berbatas waktu (TTL maksimal 15 menit).
* **Zero-Logging Data Medis (PHI):** Larangan mutlak mencatat NIK, nama lengkap, dan diagnosa gigi ke log server publik atau monitoring eksternal (Sentry/Datadog/console).
* **Immutable Audit Trail:** Log aktivitas permanen append-only tanpa akses hapus/ubah untuk mencatat riwayat pembacaan, pengubahan, pencetakan, dan ekspor rekam medis.
* **Retensi Rekam Medis (Permenkes 24/2022):** Rekam medis elektronik wajib disimpan sekurang-kurangnya **25 tahun** sejak tanggal kunjungan terakhir. Larangan *hard-delete* pada rekam medis aktif.
* **Auto-Lock Inactivity Timeout:** Layar aplikasi otomatis terkunci setelah **15 menit tanpa aktivitas** pada perangkat tablet/PC meja periksa.

---

## 7. Desain Skema Basis Data Inti (PostgreSQL & Multi-Tenant)

```sql
-- 1. Master Klinik & Cabang (Multi-Tenancy Core)
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_code VARCHAR(30) UNIQUE NOT NULL,
    clinic_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100), -- Nomor Izin Operasional Klinik
    address TEXT NOT NULL,
    phone_number VARCHAR(30),
    satusehat_organization_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    branch_name VARCHAR(150) NOT NULL,
    branch_code VARCHAR(30) NOT NULL,
    satusehat_location_id VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, branch_code)
);

-- 2. Master Pengguna & Staf Medis (RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    email VARCHAR(150) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL, -- ROLE_DENTIST, ROLE_NURSE, ROLE_FRONTDESK, dll.
    str_number VARCHAR(50), -- Nomor STR untuk Dokter Gigi
    sip_number VARCHAR(50), -- Nomor SIP untuk Dokter Gigi
    satusehat_practitioner_nik VARCHAR(16),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Pasien
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    medical_record_number VARCHAR(30) NOT NULL,
    nik VARCHAR(16),
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT,
    medical_alerts JSONB DEFAULT '[]'::jsonb, -- Alergi obat, penyakit sistemik, kehamilan
    satusehat_patient_id VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, medical_record_number)
);

-- 4. Kunjungan / Encounter Klinis
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    chair_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL, -- Scheduled, Checked-in, In-Treatment, Completed, Cancelled
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    vital_signs JSONB DEFAULT '{}'::jsonb, -- Blood pressure, pulse, respiration, pain scale
    satusehat_encounter_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Snapshot Odontogram Per Kunjungan
CREATE TABLE odontogram_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    tooth_data JSONB NOT NULL, -- Peta status 32 gigi permanen / 20 gigi susu (5 permukaan)
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Pemeriksaan Jaringan Gusi (Periodontal Charting)
CREATE TABLE periodontal_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    probing_depths JSONB NOT NULL, -- 6 titik PPD per elemen gigi (MB, B, DB, ML, L, DL)
    bleeding_on_probing JSONB DEFAULT '{}'::jsonb,
    furcation_involvement JSONB DEFAULT '{}'::jsonb,
    tooth_mobility JSONB DEFAULT '{}'::jsonb, -- Derajat goyang 1-3
    plaque_index_score NUMERIC(5, 2),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Katalog Prosedur & Tarif Tindakan Medis
CREATE TABLE procedures_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    procedure_code VARCHAR(30) NOT NULL, -- Kode internal / SKU tindakan
    icd9_cm_code VARCHAR(20), -- Kode ICD-9 CM untuk klaim / SATUSEHAT
    procedure_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Konservasi, Bedah Mulut, Perio, Orto, Prostho
    base_price NUMERIC(12, 2) NOT NULL,
    default_commission_percent NUMERIC(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, procedure_code)
);

-- 8. Rencana Perawatan & Kuotasi (Treatment Plans)
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    plan_title VARCHAR(150) NOT NULL,
    total_estimated_cost NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- Draft, Presented, Patient_Accepted, In_Progress, Completed
    patient_signature_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Tiket Perawatan Bertahap (Episode of Care)
CREATE TABLE episodes_of_care (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    treatment_plan_id UUID REFERENCES treatment_plans(id),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    case_type VARCHAR(50) NOT NULL, -- PSA, Orthodontic, Implant
    title VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL, -- Active, On-Hold, Completed
    clinical_metrics JSONB DEFAULT '{}'::jsonb, -- Working length, master apical file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Pesanan Dental Lab & Schedule Interlock
CREATE TABLE dental_lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL,
    tooth_element_number VARCHAR(10) NOT NULL,
    shade_guide VARCHAR(10) NOT NULL,
    restoration_type VARCHAR(50) NOT NULL, -- Zirconia, E-Max, PFM, Aligner
    stl_file_url TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL, -- Draft, In_Production, Received_At_Clinic, Fitted, Revision
    received_at_clinic_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Resep Obat Elektronik (e-Prescription)
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    dentist_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    prescription_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- Prescribed, Dispensed, Cancelled
    satusehat_medication_request_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(150) NOT NULL,
    kfa_code VARCHAR(20), -- Kode 9 digit KFA Kemenkes RI
    dosage VARCHAR(50) NOT NULL, -- contoh: 500 mg
    frequency VARCHAR(50) NOT NULL, -- contoh: 3x1 setelah makan
    quantity NUMERIC(6, 2) NOT NULL,
    instructions TEXT
);

-- 12. Kasir, Tagihan & Pembayaran (Billing & Payments)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    insurance_covered_amount NUMERIC(12, 2) DEFAULT 0.00,
    patient_paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL, -- Draft, Unpaid, Partially_Paid, Paid, Refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, invoice_number)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    payment_method VARCHAR(30) NOT NULL, -- Cash, QRIS, Debit_Card, Credit_Card, Deposit, Insurance
    amount NUMERIC(12, 2) NOT NULL,
    reference_number VARCHAR(100),
    processed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Resep Bahan Medis Habis Pakai (Procedure BOM)
CREATE TABLE procedure_bom_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    procedure_code VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    deduct_quantity NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Jejak Audit Tak Terhapuskan (Immutable Medico-Legal Audit Logs)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, SOFT_DELETE, PRINT, EXPORT
    ip_address VARCHAR(45) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Metrik Keberhasilan & KPI

| Kategori | Target Metrik | Tolok Ukur Evaluasi |
| :--- | :--- | :--- |
| **Efisiensi Dokter Gigi** | Durasi Input EMR | $<90\text{ detik}$ per pasien |
| **Responsivitas Antarmuka** | Odontogram Render Lag | $<16\text{ milidetik}$ (60 FPS stabil) |
| **Ketahanan Operasional** | Downtime Saat Offline | $0\text{ menit}$ (Operasi Terus Berjalan) |
| **Integritas Sinkronisasi** | Celah Data Timpa (LWW Loss) | $0\text{ insiden}$ (Attribute CRDT Merge) |
| **Akurasi Logistik Bahan** | Selisih BMHP Bulanan | $<3\%$ dari total konsumsi |
| **Integrasi Vendor Lab** | Insiden Pasien Hadir Tanpa Alat | $0\text{ kasus}$ (Schedule Interlock) |
| **Otomasi Citra Radiologi** | Waktu Unggah X-Ray | $<5\text{ detik}$ via Local Agent |
| **Kepatuhan Kemenkes** | Pengiriman SATUSEHAT | $>99.5\%$ payload sukses |
| **Keamanan Data Medis** | Kebocoran Data (BOLA/IDOR/Log) | $0\text{ kasus}$ (Zero-tolerance) |

---

## 9. Rencana Rilis & Roadmap Pengembangan

### FASE 1: Core Foundation & Multi-Tenancy (Bulan 1–2)
* Setup Next.js 19 App Router monorepo, Supabase PostgreSQL RLS dengan scoping `clinic_id`.
* Master data pasien (NIK, Nomor RM otomatis), hak akses RBAC, dan audit logging tak terhapuskan.
* Odontogram 2D SVG interaktif (32 gigi dewasa & 20 gigi susu, 5 permukaan, batch brush).
* Kalender reservasi berbasis Dental Chair & Dokter dengan database locking (`SELECT FOR UPDATE`).
* Modul Billing Kasir dasar, kalkulasi invoice, dan cetak struk PDF.

### FASE 2: PWA Tuning & Advanced Clinical EMR (Bulan 3–4)
* Optimasi PWA Standalone (Touch gestures, Taptic Engine feedback, layout anti-bounce).
* Pemeriksaan jaringan periodontal lengkap (6-Point PPD, BOP, OHI-S).
* Rencana perawatan bertahap (*Treatment Plan Options* & *Episode of Care* untuk PSA/Behel).
* Informed consent digital terenkripsi dengan stempel waktu dan tanda tangan layar sentuh.
* Inventaris BMHP berbasis formula tindakan medis (*Procedure BOM*).
* Dental Lab Hub dengan validasi reservasi otomatis (*Schedule Interlock*).
* Arsitektur Offline-First menggunakan Dexie.js dengan *Attribute-Level Conflict Resolution*.

### FASE 3: Farmasi, Integrasi Perangkat Keras & Regulasi (Bulan 5–6)
* Modul e-Prescription terhubung ke kamus KFA Kemenkes RI dan pengecekan interaksi obat.
* Local Edge Agent (daemon Go/Rust) untuk integrasi mesin rontgen lokal langsung ke Cloudflare R2 (Private Signed URLs).
* Penampil gambar radiologi DICOM 2D (Cornerstone.js) dan pemindai intraoral 3D `.STL` (Three.js).
* Layar antrean TV ruang tunggu (*Queue TV Display*) dan sistem panggilan suara otomatis (TTS).
* Integrasi asinkron API SATUSEHAT Kemenkes RI (Redis + BullMQ) dan bridging BPJS P-Care.
* Matriks kalkulasi bagi hasil/komisi otomatis dokter dan rekap shift kasir.
* Audit penetrasi keamanan (`Claude-BugHunter`), load testing, dan peluncuran resmi (*Production Release*).