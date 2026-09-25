# Color Palette & Semantic Tokens
## Next-Gen Dental Practice Management System (PMS)

| Dokumen | Spesifikasi |
| :--- | :--- |
| **Kode Dokumen** | STD-COL-001 |
| **Versi** | 2.0.0 (High-Focus & Anti-Eye Strain Blueprint) |
| **Filosofi** | High-Focus Chromatic Balance, Anti-Glare Canvas, Operatory Dim Mode, Strict Medical Quarantine |
| **Aksesibilitas** | Standar Kontras WCAG 2.1 Level AA (Minimum 4.5:1 untuk teks normal, 3:1 untuk kontrol UI) |

---

## 1. Aturan Distribusi Kroma & Fokus Visual (Rasio 60-30-10)

Untuk menjaga ketajaman konsentrasi (*focus flow*) dan mengeliminasi kelelahan mata dokter gigi akibat paparan lampu operasi intensif:

* **60% Bidang Tenang (Dominant Canvas):**
  * Latar belakang netral hangat bebas silau (*Soft Bone* `#F8F9FA` pada mode terang, atau *Deep Obsidian* `#090D16` pada mode operatori).
  * Mencegah spasme pupil mata saat pandangan berpindah dari mulut pasien ke layar tablet.
* **30% Kontur Struktural (Structural Surface & Typography):**
  * Kartu Bento putih murni (`#FFFFFF`), garis tepi tipis (`#E2E8F0`), dan tipografi arang pekat (*Deep Charcoal* `#0F172A`).
  * Memberikan kejelasan hierarki data klinis tanpa membebani daya akomodasi lensa mata.
* **10% Aksen Aksi Aktif (High-Focus Focal Accent):**
  * *Deep Forest Teal* (`#0F766E`) dan *Vibrant Mint* (`#14B8A6`).
  * Mengarahkan pandangan mata secara instan hanya ke titik aksi krusial (tombol CTA, kursi gigi aktif, dan status siap tindakan).

---

## 2. Token Warna Antarmuka (UI System Tokens)

### 2.1 Mode Terang (Light Mode - Meja Kasir, Administrasi & Konsultasi)

| Token CSS / Tailwind | Nilai Hex | Peran & Tempat Penggunaan |
| :--- | :--- | :--- |
| `canvas-background` | `#F8F9FA` | Latar belakang seluruh halaman aplikasi (*Soft Bone* anti-glare). |
| `surface-card` | `#FFFFFF` | Latar modul kartu Bento, dialog modal, panel odontogram. |
| `surface-subtle` | `#F1F3F5` | Latar belakang bar tab, input form non-aktif, baris selang-seling tabel. |
| `border-subtle` | `#E2E8F0` | Garis tepi kartu 1px, pembatas list, garis separator. |
| `border-strong` | `#CBD5E1` | Garis tepi input aktif, divider utama antar-panel. |
| `text-primary` | `#0F172A` | Teks judul utama, data odontogram aktif, nominal biaya (*Deep Charcoal*). |
| `text-secondary` | `#475569` | Label form, deskripsi catatan SOAP, teks tombol sekunder. |
| `text-muted` | `#94A3B8` | Placeholder input, tanggal kadaluarsa, teks non-aktif. |

### 2.2 Warna Brand, Fokus & Interaksi
Warna brand menggunakan spektrum *Teal* yang secara biologis menyeimbangkan kelelahan mata setelah menatap jaringan rongga mulut:

| Token CSS / Tailwind | Nilai Hex | Peran & Tempat Penggunaan |
| :--- | :--- | :--- |
| `brand-primary` | `#0F766E` | Warna identitas utama (*Deep Forest Teal*), active nav menu, header aksen. |
| `brand-hover` | `#0D9488` | State hover tombol primer dan kartu terpilih. |
| `brand-accent` | `#14B8A6` | Tombol aksi utama (CTA), indikator kursi aktif terisi (*Vibrant Mint*). |
| `brand-subtle` | `#CCFBF1` | Background badge status sukses, highlight teks brand, chip aktif. |
| `brand-warm` | `#F1EFE9` | Aksen netral hangat untuk tombol filter dan tab bar sekunder. |

### 2.3 Operatory Dim Mode (Mode Khusus Ruang Tindakan Dokter Gigi)
Mode gelap anti-silau yang dirancang untuk ruang tindakan saat dokter mengoperasikan lampu UV curing dan membaca rontgen gigi:

| Token CSS / Tailwind | Nilai Hex | Peran & Tempat Penggunaan |
| :--- | :--- | :--- |
| `dark-canvas` | `#090D16` | Latar belakang dasar (*Deep Obsidian Slate*). |
| `dark-surface` | `#111827` | Latar belakang kartu tindakan dan canvas odontogram. |
| `dark-surface-elevated`| `#1E293B` | Floating action palette, modal dialog, dropdown menu. |
| `dark-border` | `#334155` | Garis tepi modul pada mode gelap. |
| `dark-text-primary` | `#F8FAFC` | Teks judul dan data aktif (*Off-White* anti-halation). |
| `dark-text-secondary` | `#94A3B8` | Label form dan deskripsi sekunder pada mode gelap. |

---

## 3. Karantina Warna Medis (Clinical Chromatic Quarantine)

Warna-warna di bawah ini **DIKARANTINA SECARA MUTLAK** hanya untuk visualisasi kondisi gigi, odontogram, dan kartu tahapan medis (*Episode of Care*). 

> [!CAUTION]
> **DILARANG KERAS** menggunakan warna karies (`#EF4444`) atau endodontik (`#D97706`) pada tombol antarmuka umum (seperti tombol hapus, batal, atau badge kasir). Karantina ini menjamin dokter memiliki refleks instan bahwa setiap kemunculan warna merah/amber di layar selalu menandakan patologi gigi pasien.

| Kondisi / Tindakan | Token Tailwind | Nilai Hex | Representasi Visual Odontogram |
| :--- | :--- | :--- | :--- |
| **Karies / Gigi Berlubang** | `dental-caries` | `#EF4444` | Merah koral tegas pada permukaan gigi terdampak. |
| **Tambalan Komposit Selesai** | `dental-restored` | `#059669` | Hijau zamrud solid menandakan restorasi optimal. |
| **Perawatan Saluran Akar (PSA)**| `dental-endo` | `#D97706` | Oranye amber pada kamar pulpa & saluran akar. |
| **Pekerjaan Lab (Crown/Gigi Tiruan)**| `dental-lab` | `#7C3AED` | Ungu royal pada mahkota gigi terpasang. |
| **Sisa Akar (Radix)** | `dental-radix` | `#B91C1C` | Merah tua pekat dengan arsiran silang. |
| **Gigi Hilang (Missing)** | `dental-missing` | `#64748B` | Abu-abu slate semi-transparan (opacity 40%). |
| **Kalkulus / Karang Gigi** | `dental-calculus`| `#EAB308` | Kuning mustard pada garis servikal/leher gigi. |

---

## 4. Status Operasional & Sistem Notifikasi

| Tipe Status | Token Latar | Token Teks/Ikon | Contoh Penggunaan Kasus |
| :--- | :--- | :--- | :--- |
| **Sukses / Ready** | `#DCFCE7` | `#15803D` | SPK Lab sudah diterima di klinik; Sync SATUSEHAT sukses. |
| **Peringatan / Alert**| `#FEF3C7` | `#B45309` | Bahan BMHP mendekati stok minimum; DP pasien menipis. |
| **Kritis / Bahaya** | `#FEE2E2` | `#B91C1C` | Alergi obat berat; Jadwal terbentur status lab (*Interlock*). |
| **Informasi Netral** | `#E0F2FE` | `#0369A1` | Pasien sedang berada di ruang rontgen (*Quick Handoff*). |

---

## 5. File Konfigurasi Siap Pakai: `tailwind.config.ts`

Salin konfigurasi ini langsung ke dalam root proyek frontend untuk mengaktifkan seluruh token secara otomatis:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F8F9FA',
          subtle: '#F1F3F5',
          dark: '#090D16',
        },
        surface: {
          card: '#FFFFFF',
          subtle: '#F1F3F5',
          elevated: '#FFFFFF',
          dark: '#111827',
          'dark-elevated': '#1E293B',
        },
        border: {
          subtle: '#E2E8F0',
          strong: '#CBD5E1',
          dark: '#334155',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          'dark-primary': '#F8FAFC',
          'dark-secondary': '#94A3B8',
        },
        brand: {
          primary: '#0F766E',
          hover: '#0D9488',
          accent: '#14B8A6',
          subtle: '#CCFBF1',
          warm: '#F1EFE9',
        },
        dental: {
          caries: '#EF4444',
          restored: '#059669',
          endo: '#D97706',
          lab: '#7C3AED',
          radix: '#B91C1C',
          missing: '#64748B',
          calculus: '#EAB308',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        elevated: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
```