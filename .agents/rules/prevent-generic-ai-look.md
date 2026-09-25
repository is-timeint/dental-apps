# Rule: Prevent Generic AI Look & Enforce Humanized Design

Dokumen aturan wajib (MANDATORY RULE) untuk seluruh AI Assistant dan pengembang dalam merancang dan memodifikasi antarmuka Dental-Apps (PMS/EDR). DILARANG membuat tampilan yang terlihat seperti "template AI generik / cookie-cutter".

---

## 1. Prinsip Canvas & Tata Letak Ruang Nyata
- **Maksimalisasi Lebar Kanvas (No Wasted Margins):**
  - DILARANG membatasi antarmuka ruang operasional dokter pada kontainer sempit buatan (misal `max-w-7xl mx-auto`) yang membuang 40% ruang monitor widescreen.
  - Gunakan layout kanvas penuh (`w-full min-h-screen` atau `h-screen overflow-hidden flex`) dengan panel split-pane dinamis yang ergonomis untuk dokter gigi dan perawat.
- **Kepadatan Informasi Fungsional (Purposeful Bento Density):**
  - Hindari kartu-kartu putih mengambang tanpa struktur logis.
  - Setiap panel harus memiliki fungsi klinis spesifik dengan pembatas tegas (`1px border-border-subtle`), padding proporsional (`p-3.5` hingga `p-5`), dan radius sudut konsisten (`rounded-2xl` s/d `rounded-3xl`).
- **Sidebar Navigasi Modul Lengkap (PRD Alignment):**
  - Dilarang mereduksi 16 modul PRD menjadi segelintir tab acak di tengah layar.
  - Wajib menyediakan navigasi modul lengkap yang terkelompokan logis (Operatori & Klinis, Lab & Logistik, Finansial & Kasir, Pasien & Integrasi).

---

## 2. Tipografi & Konten Medis Manusiawi
- **Konteks Klinis Riil (No Dummy/Robot Text):**
  - DILARANG menggunakan teks generik seperti "Card title", "Item description", atau nama dummy kartun.
  - Gunakan terminologi klinis kedokteran gigi Indonesia yang otentik: "Dokter DPJP", "Karies Profunda MO", "Obturasi Saluran Akar", "SOP PPI Kemenkes", "Probing Depth WHO", "Kamus KFA Kemenkes".
- **Zero-Bug Typography Formatting:**
  - Format angka mata uang dan kuantitas wajib terikat rapi tanpa spasi terputus (`Rp28.450.000`, bukan `Rp28 .450 .000`).
  - Tidak boleh ada pemenggalan kata kaku atau overflow yang memotong teks penting pada tombol aksi atau label kuas.

---

## 3. Disiplin Warna & Karantina Medis
- **Kepatuhan Rasio 60-30-10 ([color-palette.md](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/color-palette.md)):**
  - 60% Soft Bone (`#F8F9FA`): Latar belakang netral hangat anti-silau lampu dental chair.
  - 30% Pure Bento Surface (`#FFFFFF`): Permukaan modul bersih dengan kontur arang pekat (`#0F172A`).
  - 10% Deep Forest Teal (`#0F766E`) & Vibrant Mint (`#14B8A6`): Titik fokus aksi aktif dan status siap.
- **Karantina Warna Patologi Medis:**
  - Warna koral merah (`#EF4444`) dan oranye amber (`#D97706`) **DIKARANTINA HANYA** untuk patologi gigi (karies, alergi berat, endodontik, dan alert keselamatan kritis). Dilarang digunakan sebagai tombol UI umum.
- **Email Gigi Natural:**
  - Vektor odontogram menggunakan rona email natural (`#FAFAF7`), bukan warna abu-abu kusam atau putih kosong tanpa kedalaman.

---

## 4. Kehangatan Humanis & Ergonomi Pengguna
- **Shift & Identitas Tim:** Tampilkan profil dokter jaga aktif, spesialisasi, nama perawat asisten, dan cabang klinik secara personal.
- **Thoughtful Guidance:** Setiap kondisi kosong (*empty state*) atau panel yang belum dipilih harus menyajikan instruksi ramah dan jelas, bukan sekadar ruang kosong tanpa keterangan.
