# Modul 03: Dental Lab Hub & Schedule Interlock

## 1. Ringkasan Klinis & Operasional
Modul Dental Lab Hub mengelola siklus pesanan pekerjaan prostodontik dan ortodontik ke lab dental eksternal (crown, bridge, veneer, inlay/onlay, aligner, dan rangka gigi tiruan). Modul ini mengunci kalender kunjungan pasien agar janji temu kontrol pasang tidak dapat dijadwalkan sebelum pekerjaan lab diterima dan lolos QC oleh tim klinik.

---

## 2. Status Lifecycle Order Lab (SPK Digital)
1. **`IMPRESSION_TAKEN` (Pencetakan / Scan 3D Selesai):** Dokter mengambil cetakan fisik alginat/silikon atau scan intraoral 3D (STL/PLY).
2. **`SENT_TO_VENDOR` (Dikirim ke Lab):** Kurir membawa model fisik atau file 3D diunggah ke vendor lab via portal terintegrasi.
3. **`IN_FABRICATION` (Proses Fabrikasi):** Vendor sedang mengerjakan milling/sintering/porcelain build-up. Estimasi tanggal selesai tercatat.
4. **`RECEIVED_QC_PASSED` (Diterima & Lolos QC):** Model tiba di klinik, diperiksa kecocokan margin, shade guide (VITA Classical/3D-Master), dan tidak ada distorsi.
5. **`SEATED_COMPLETED` (Terpasang pada Pasien):** Restorasi dipasang, dicek oklusi dan artikulasi dengan articulating paper, lalu disemen permanen.

---

## 3. Aturan Schedule Interlock (Anti-Insiden)
- Sistem kalender klinik secara otomatis memblokir pembuatan janji temu kontrol pemasangan jika status order lab belum berstatus `RECEIVED_QC_PASSED`.
- Jika resepsionis mencoba melakukan override, sistem mewajibkan otorisasi supervisor (`ROLE_CLINIC_MANAGER`) dan mencatat alasan darurat ke tabel audit.
