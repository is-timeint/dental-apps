# Rule: Micro-Interactions, Motion Physics & Tactile Standards

Dokumen aturan wajib (MANDATORY RULE) untuk standarisasi interaksi kinetik, fisika pegas (*damped spring*), dan umpan balik haptik pada Dental-Apps PMS/EDR sesuai spesifikasi [design-standards.md](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/design-standards.md).

---

## 1. Damped Spring Physics (No Linear Animations)
Dilarang menggunakan animasi statis linier (`transition: all 0.3s ease`). Seluruh pergerakan komponen wajib menggunakan token fisika pegas dari [src/lib/motion.ts](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/src/lib/motion.ts):

| Token Fisika | Stiffness | Damping | Mass | Kasus Penggunaan Wajib |
| :--- | :--- | :--- | :--- | :--- |
| `DAMPED_SPRINGS.gentle` | `350` | `32` | `0.8` | Transisi antar tab, buka-tutup drawer, kartu kursi Live Floor hover. |
| `DAMPED_SPRINGS.snappy` | `460` | `28` | `0.5` | Dropdown menu, chip filter, tooltip, dan switch toggle. |
| `DAMPED_SPRINGS.tactile` | `520` | `24` | `0.4` | Klik permukaan gigi odontogram, scale-dip tombol aksi, checklist. |
| `DAMPED_SPRINGS.bouncy` | `280` | `18` | `1.0` | Swipe antrean pasien, notifikasi toast sukses, breathing pulse alert. |

---

## 2. Standar Micro-Interaction per Komponen Utama

### 2.1 Odontogram 2.0 (Vector 5-Surface Tooth)
- **Physical Scale-Dip:** Setiap ketukan pada permukaan gigi memicu penekanan fisik `whileTap={{ scale: 0.94 }}` dengan `DAMPED_SPRINGS.tactile`.
- **Ink Absorption Feedback:** Warna bahan tambalan / karies tidak muncul mendadak secara kaku, melainkan meresap halus dengan efek ripple ekspansi 300ms dari pusat koordinat sentuhan.
- **Haptic Pulse:** Wajib memicu `triggerHapticFeedback('light')` saat kuas menyentuh permukaan email gigi.

### 2.2 Direction-Aware Sliding Tabs
- Perpindahan tab wajib membaca arah indeks:
  - Maju (Index baru > lama): Masuk dari kanan ($+32\text{px} \rightarrow 0$), keluar ke kiri.
  - Mundur (Index baru < lama): Masuk dari kiri ($-32\text{px} \rightarrow 0$), keluar ke kanan.
- Indikator tab aktif menggunakan kapsul magnetik `layoutId="activeTabPill"` yang meluncur mulus.

### 2.3 Velocity-Aware Swipeable Queue Cards
- Kartu antrean pasien mendukung drag horizontal dengan rotasi inersia real-time:
  - `drag="x" dragConstraints={{ left: -120, right: 120 }} dragElastic={0.2}`
  - Nilai x dihubungkan ke sudut rotasi `-4deg` s/d `+4deg` dan opacity `0.6` s/d `1.0`.
- Geser kanan $>100\text{px}$: Pasien langsung dimasukkan ke Dental Chair aktif (`triggerHapticFeedback('success')`).
- Geser kiri $<-100\text{px}$: Sistem menyiarkan panggilan suara audio ke TV ruang tunggu (`triggerHapticFeedback('medium')`).

### 2.4 Rolling Number Ticker
- Nominal rupiah pendapatan klinik dan jumlah tindakan selesai wajib ditampilkan menggunakan [src/components/ui/rolling-ticker.tsx](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/src/components/ui/rolling-ticker.tsx).
- Setiap digit angka bergulir vertikal independen dengan pegas halus `stiffness: 320, damping: 30` tanpa pergeseran horizontal karakter titik (`.`).

### 2.5 Live Floor Breathing Pulse
- Dental Chair dengan status `IN_TREATMENT` menampilkan efek animasi napas lembut (*breathing pulse*) pada border atas dan bayangan kartu (`box-shadow: 0 0 15px rgba(15, 118, 110, 0.35)`) dengan interval 3 detik.

---

## 3. Touch Engine Lockdown (Kenyamanan Touchscreen Tablet)
Pada [src/app/globals.css](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/src/app/globals.css), aturan berikut wajib aktif:
- `overscroll-behavior-y: none`: Mencegah pull-to-refresh browser yang merusak konsentrasi saat dokter menggambar odontogram.
- `user-select: none`: Menghindari blok seleksi teks biru yang mengganggu saat mengetuk gigi secara cepat.
- `touch-action: manipulation`: Menghilangkan delay 300ms double-tap zoom pada tablet iPad/Android.
