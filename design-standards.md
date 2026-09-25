# UI/UX, Motion Physics & Micro-Interaction Standards
## Next-Gen Dental Practice Management System (PMS)

| Dokumen | Spesifikasi |
| :--- | :--- |
| **Kode Dokumen** | STD-DES-001 |
| **Versi** | 2.0.0 (Tactile Micro-Interactions & Fluid Motion Blueprint) |
| **Cakupan** | Standarisasi Halaman, Modal, Drawer, Gestur Sentuh, Rolling Ticker, & Motion Physics |
| **Target Framework** | Next.js 19, Tailwind CSS, Shadcn UI, Framer Motion, Vaul |

---

## 1. Prinsip Interaksi & Standar Motion Fisika

Untuk mengeliminasi *cognitive fatigue* (kejenuhan mental) dokter gigi dan perawat saat menginput ratusan data klinis per hari, seluruh animasi web wajib memiliki **umpan balik spasial, bobot inersia nyata, dan kepuasan sentuhan (*tactile satisfaction*)**.

Aplikasi menolak animasi linier berbasis waktu (`ease-in-out` berdurasi statis). Seluruh pergerakan elemen wajib menggunakan **Damped Spring Physics**:

### 1.1 Token Fisika Gerak (Motion Constants)

| Token Fisika | Stiffness | Damping | Mass | Durasi Persepsi | Penggunaan Komponen |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `spring-standard` | `350` | `32` | `0.8` | `220ms – 280ms` | Transisi tab klinis, buka-tutup drawer, navigasi halaman. |
| `spring-snappy` | `460` | `28` | `0.5` | `140ms – 180ms` | Filter chips, dropdown menu, tooltips, switch toggle. |
| `spring-tactile` | `520` | `24` | `0.4` | `100ms – 140ms` | Klik permukaan gigi odontogram, button scale dip, checklist. |
| `spring-bouncy` | `280` | `18` | `1.0` | `320ms – 380ms` | Swipe-card antrean pasien, notifikasi toast sukses, badge alert. |

### 1.2 Velocity-Aware Inertial Tracking (Responsivitas Kecepatan Geser)
* Seluruh komponen yang dapat ditarik (*draggable*) wajib membaca kecepatan (*velocity*) gestur tangan pengguna.
* Jika kecepatan geser jari $>500\text{ px/detik}$, komponen otomatis menyelesaikan transisi (*flick-to-dismiss* atau *flick-to-snap*) tanpa mewajibkan pengguna menarik hingga separuh layar.
* **Rubber-Band Resistance:** Tarikan yang melebihi batas container menerapkan tahanan elastis logaritmik (`dragElastic={0.15}`) dan membal kembali secara organik saat dilepaskan.

---

## 2. Standar Transisi Tab: Direction-Aware Sliding & Staggered Reveal

Perpindahan tab klinis (*Odontogram $\rightarrow$ Perio Chart $\rightarrow$ Treatment Plan $\rightarrow$ Rontgen $\rightarrow$ Billing*) wajib mendeteksi arah navigasi dan menggunakan indikator kapsul magnetik (*magnetic sliding pill*).

### 2.1 Spesifikasi Gerak Tab
* **Maju (Index Baru > Index Lama):** Konten baru masuk dari kanan ($+32\text{px} \rightarrow 0$), konten lama keluar ke kiri ($0 \rightarrow -32\text{px}$) dengan perubahan opacity $0 \leftrightarrow 1$.
* **Mundur (Index Baru < Index Lama):** Konten baru masuk dari kiri ($-32\text{px} \rightarrow 0$), konten lama keluar ke kanan ($0 \rightarrow +32\text{px}$).
* **Staggered Children:** Elemen kartu di dalam tab masuk bertahap dengan jeda *stagger* 35ms antar kartu untuk efek aliran konten yang hidup.
* **Indikator Tab Aktif:** Kapsul latar putih menggunakan `layoutId="activeTabPill"` meluncur mulus di bawah teks tab.

### 2.2 Template Komponen Tab Standar (React + Framer Motion)

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
  badgeCount?: number;
}

interface StandardSlidingTabsProps {
  tabs: TabItem[];
  defaultTab?: number;
  onChange?: (index: number) => void;
  children: (activeIndex: number) => React.ReactNode;
}

export const StandardSlidingTabs: React.FC<StandardSlidingTabsProps> = ({
  tabs,
  defaultTab = 0,
  onChange,
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [direction, setDirection] = useState(0);

  const handleSelect = (idx: number) => {
    if (idx === activeTab) return;
    setDirection(idx > activeTab ? 1 : -1);
    setActiveTab(idx);
    onChange?.(idx);
    if ('vibrate' in navigator) navigator.vibrate(8); // Subtle selection tick
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Magnetic Sliding Pill Tab Bar */}
      <div className="flex p-1 bg-surface-subtle border border-border-subtle rounded-2xl w-fit">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(idx)}
              className={`relative px-4 py-2 text-xs font-semibold tracking-wide transition-colors z-10 flex items-center gap-1.5 ${
                isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-brand-subtle text-brand-primary font-bold">
                  {tab.badgeCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-surface-card rounded-xl shadow-subtle border border-border-subtle/80 z-[-1]"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Realistic Direction-Aware Sliding Body */}
      <div className="relative overflow-hidden w-full min-h-[360px]">
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 32 : -32,
                opacity: 0,
                scale: 0.99,
              }),
              center: {
                x: 0,
                opacity: 1,
                scale: 1,
              },
              exit: (dir: number) => ({
                x: dir > 0 ? -32 : 32,
                opacity: 0,
                scale: 0.99,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 32,
              mass: 0.8,
            }}
            className="w-full h-full"
          >
            {children(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
```

---

## 3. Odontogram Tactile Micro-Interactions (Ink Absorption & Scale Dip)

Dokter gigi melakukan sentuhan puluhan kali per pasien pada permukaan gigi. Untuk memberikan kepastian registrasi sentuhan (*tactile confirmation*) dan mencegah kebosanan:

### 3.1 Spesifikasi Kompresi Mikro Pegas (Tactile Scale Dip)
* Saat bidang gigi (Mesial, Distal, Occlusal, Buccal, Lingual) disentuh:
  * Permukaan mengalami kompresi mikro ke dalam: `scale: 0.94` selama sentuhan aktif.
  * Saat dilepas (*release*), memantul cepat (*spring rebound*): `scale: 1.04` $\rightarrow$ `1.0` dengan token `spring-tactile`.
  * Dibarengi haptic getaran 12ms (`navigator.vibrate(12)`).

### 3.2 Efek Serapan Tinta Klinis (Liquid Ink Fill Effect)
* Warna diagnosis (contoh: Karies `#DC2626`, Tambalan `#2563EB`) tidak berganti secara kaku (0ms *hard-switch*).
* Warna memancar dari titik sentuhan jari dengan efek ekspansi radial mikro (*subtle scale-up fill* berdurasi 140ms), memberikan ilusi cairan bahan tambal atau pewarna karies yang meresap presisi ke permukaan enamel gigi.

### 3.3 Morphing Antar-Mode Gigi Dewasa $\leftrightarrow$ Gigi Anak (`layoutId`)
* Perpindahan antara kanvas 32 Gigi Permanen dan 20 Gigi Susu dilarang merusak kontinuitas visual (*no screen blink/refresh*).
* Elemen gigi yang berkorespondensi bertransisi secara mulus menggunakan shared layout animation (`layoutId="tooth-[fdiNumber]"`), bergeser ke posisi busur gigi anak yang lebih ringkas.

```tsx
// Cuplikan Bidang Gigi Interaktif dengan Framer Motion
import { motion } from 'framer-motion';

export const OdontogramSurface: React.FC<{
  surfaceId: string;
  fillColor: string;
  onApplyCondition: () => void;
}> = ({ surfaceId, fillColor, onApplyCondition }) => {
  return (
    <motion.path
      whileHover={{ scale: 1.06, filter: 'brightness(1.08)' }}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        onApplyCondition();
        if ('vibrate' in navigator) navigator.vibrate(12);
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className="cursor-pointer transition-colors duration-150"
      style={{ fill: fillColor }}
    />
  );
};
```

---

## 4. Micro-Interactions Data & Operasional (Anti-Boredom & Flow State)

### 4.1 Rolling Digits (Number Ticker) pada Billing & Odontogram Counter
Mencegah kelelahan membaca angka statis yang berganti mendadak:
* Setiap kali total tagihan kasir bertambah atau jumlah gigi terdiagnosa berubah, angka bergulir vertikal (*slot-machine smooth easing*).

```tsx
// Template Rolling Number Ticker
import React from 'react';
import { motion } from 'framer-motion';

export const RollingNumberTicker: React.FC<{ value: number; prefix?: string }> = ({
  value,
  prefix = 'Rp ',
}) => {
  const formatted = value.toLocaleString('id-ID');
  
  return (
    <div className="flex items-center text-xl font-bold font-mono tracking-tight text-text-primary overflow-hidden h-7">
      <span>{prefix}</span>
      <div className="flex overflow-hidden">
        {formatted.split('').map((char, index) => {
          if (isNaN(Number(char))) {
            return <span key={index} className="w-2 text-center">{char}</span>;
          }
          const num = Number(char);
          return (
            <div key={index} className="relative w-3.5 h-7 overflow-hidden">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: -num * 28 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 flex flex-col"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <span key={digit} className="h-7 flex items-center justify-center">
                    {digit}
                  </span>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### 4.2 Kartu Antrean Interaktif (Swipe-to-Action with Resistance)
Pasien di ruang tunggu dapat dipindahkan dengan gestur geser jari alami di tablet resepsionis/perawat:
* **Geser Kanan (Swipe Right):** Panggil pasien ke Dental Chair aktif (kartu sedikit miring $+4^\circ$, latar belakang kartu mengekspos warna *Teal Brand* dengan ikon kursi gigi membesar elastis).
* **Geser Kiri (Swipe Left):** Tunda / Pending antrean (kartu miring $-4^\circ$, latar oranye *subtle*).
* **Tahanan Elastis:** Memanfaatkan `drag="x"`, `dragConstraints={{ left: -120, right: 120 }}`, dan `dragElastic={0.2}`.

### 4.3 Breathing Status Pulse (Dental Chair Operasional)
Memberikan informasi sekilas mata (*peripheral vision cue*) tanpa mengganggu fokus:
* Kursi berstatus **In-Treatment** memiliki indikator cincin berdenyut halus (*subtle breathing ring* berdurasi 3.2s) pada denah lantai operasional:
  ```css
  @keyframes clinical-breathe {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.35); opacity: 0.15; }
  }
  .breathing-pulse {
    animation: clinical-breathe 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  ```

### 4.4 Checklist Perawatan Bertahap (Micro-Celebration)
* Saat dokter atau perawat menyelesaikan langkah endodontik (contoh: *Working Length Check*, *Obturasi Selesai*) atau checklist sterilisasi autoklaf:
* Icon checkbox bertransformasi dengan **SVG Path Drawing Animation** (garis centang tergambar elastis dari pangkal ke ujung dalam 180ms) diiringi haptic getaran ganda (*double-tap tick*).

---

## 5. Standar Modal, Dialog, dan Bottom Sheet

Untuk menjamin ergonomi tablet dan desktop, aplikasi membedakan penggunaan Dialog Modal dan Bottom Sheet Drawer secara proporsional:

### 5.1 Matriks Komponen per Form Factor

| Form Factor | Tindakan Singkat (< 3 Input) | Formulir Panjang & Detail Klinis |
| :--- | :--- | :--- |
| **Desktop / Web** | Centered Modal Dialog (`max-w-[480px]`) | Centered Modal Dialog (`max-w-[760px]`) |
| **Tablet Landscape** | Centered Modal Dialog (`max-w-[500px]`) | **Side Sheet / Right Drawer** (Slide dari kanan dengan lebar 480–620px) |
| **Mobile / Tablet Portrait** | Bottom Sheet Drawer (`Vaul`) | Bottom Sheet Drawer 90% Height (`Vaul`) |

### 5.2 Standar Transisi Dialog Desktop (Scale-Fade Spring)
* **Animasi Buka:** `opacity: 0 -> 1`, `scale: 0.96 -> 1.0` dengan durasi 180ms (`spring-snappy`).
* **Backdrop:** Latar semi-transparan `rgba(9, 13, 22, 0.45)` dengan efek `backdrop-blur-sm` (4px blur).
* **Penutupan Cepat:** Tombol Esc keyboard, klik area backdrop luar, atau tombol silang di pojok kanan atas.

### 5.3 Standar Bottom Sheet (Sentuhan Alami iOS via Vaul)
* Wajib memiliki tuas seret (*drag handle*) berukuran $36 \times 4\text{ px}$ membulat di bagian atas.
* Mendukung interaksi seret ke bawah (*drag-down to dismiss*) dengan inersia lemparan jari.
* Latar belakang body utama otomatis mengecil halus (`scale: 0.98`) dan membulat saat drawer terbuka penuh.

---

## 6. Standar Halaman, Ergonomi Sentuh & Bento Grid

### 6.1 Layout Dashboard & Modul Operasional (Bento Grid)
* **Jarak Antar Kartu (Gap):** Standar `gap-4` (16px) pada tablet, `gap-6` (24px) pada desktop.
* **Radius Sudut Kartu:** Standar `rounded-2xl` (16px).
* **Ketebalan Garis Batas:** `border` tipis 1px solid (`border-border-subtle`). Dilarang memakai border tebal di atas 1px pada kartu konten.
* **Tinggi Viewport Tetap:** Seluruh container utama wajib menggunakan `height: 100dvh` dengan scroll internal di dalam panel, bukan window scroll yang membuat top bar ikut terdorong.

### 6.2 Standar Ukuran Elemen Sentuh (Ergonomi Klinis)
* **Target Sentuh Minimum:** **$48 \times 48\text{ px}$** untuk tombol tindakan chair-side, checklist perawat, dan elemen odontogram.
* **Tombol Aksi Utama (Primary CTA):** Tinggi minimum $44\text{ px}$, teks semi-bold 13px/14px, radius `rounded-xl` (12px).
* **Input Formulir:** Tinggi $40\text{ px}$, padding horizontal 12px, font 13px.

---

## 7. Standar Umpan Balik Taktil (Haptic Feedback System)

Gunakan modul utilitas getaran mikro berikut pada tablet iPad/Android saat terjadi interaksi kritis di ruang tindakan:

```typescript
export const haptic = {
  // Dipanggil saat klik tombol tab, permukaan gigi, atau checklist asisten
  selection: () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
  },
  // Dipanggil saat dokter menggores odontogram atau kuas batch aktif
  brushTick: () => {
    if ('vibrate' in navigator) navigator.vibrate(6);
  },
  // Dipanggil saat transaksi kasir berhasil, odontogram disimpan, atau SPK lab terkirim
  success: () => {
    if ('vibrate' in navigator) navigator.vibrate([12, 40, 18]);
  },
  // Dipanggil saat checklist selesai (micro-celebration)
  complete: () => {
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 25]);
  },
  // Dipanggil saat jadwal terbentur (interlock lab) atau validasi form gagal
  warning: () => {
    if ('vibrate' in navigator) navigator.vibrate([35, 50, 35]);
  },
  // Dipanggil saat terjadi bahaya medis kritis (alergi/hipertensi berat)
  criticalAlert: () => {
    if ('vibrate' in navigator) navigator.vibrate([60, 40, 60, 40, 80]);
  },
};
```
