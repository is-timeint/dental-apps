# Modul 01: Live Floor & Chair Operations

## 1. Ringkasan Klinis & Operasional
Modul Live Floor menyediakan representasi visual real-time dari seluruh dental unit (kursi periksa) di klinik. Memungkinkan tim front desk, perawat, dan dokter memantau status operasional secara instan tanpa perlu komunikasi verbal yang mengganggu kenyamanan pasien.

---

## 2. State Machine Dental Chair
Setiap dental chair beroperasi dalam siklus hidup (*lifecycle*) ketat:
1. **`AVAILABLE` (Hijau Muda/Teal Dim):** Kursi siap digunakan untuk pasien baru.
2. **`IN_TREATMENT` (Deep Forest Teal + Breathing Pulse):** Pasien sedang dalam tindakan medis. Timer durasi berjalan aktif.
3. **`DISINFECTION` (Amber/Yellow Flash):** Tindakan selesai, kursi sedang dibersihkan dan disterilkan dengan standar PPI gigi (3-5 menit).
4. **`MAINTENANCE` (Slate Grey):** Kursi atau kompresor/suction sedang mengalami kendala teknis dan tidak dapat menerima pasien.

---

## 3. UI/UX Interaction Standards
- **Breathing Border Animation:** Dental chair dengan status `IN_TREATMENT` menampilkan efek animasi napas halus (`box-shadow: 0 0 15px rgba(15, 118, 110, 0.35)`) dengan interval 3 detik untuk menarik perhatian perifer tanpa silau.
- **Elapsed Timer:** Menampilkan waktu berjalan sejak tindakan dimulai (`MM:SS`). Jika melebihi perkiraan durasi tindakan (>45 menit), warna timer bertransisi ke amber lembut.
- **Quick Chair Action:** Tap pada kartu kursi membuka bottom sheet drawer untuk update status, panggil asisten, atau langsung loncat ke Odontogram pasien terkait.

---

## 4. Keamanan & Multi-Tenancy
- Filter `clinic_id` pada setiap koneksi WebSocket / Server-Sent Events (SSE).
- Event `chair_status_changed` hanya memancarkan `chair_id`, `status`, dan `anonymized_ticket_code` (misal: `A-012`), tanpa memancarkan nama lengkap atau rekam medis pasien di saluran publik.
