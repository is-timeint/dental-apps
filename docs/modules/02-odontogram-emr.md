# Modul 02: Clinical Workspace & Odontogram 2.0 (Core EMR)

## 1. Ringkasan Klinis & Regulasi
Odontogram 2.0 adalah inti pencatatan rekam medis gigi digital yang mengadopsi standar penomoran gigi internasional **FDI Two-Digit** (11–48 untuk gigi permanen dewasa dan 51–85 untuk gigi sulung anak), sesuai pedoman Departemen Kesehatan RI dan Konsil Kedokteran Indonesia (KKI).

---

## 2. Anatomi 5-Permukaan Vektor Gigi (Vector Tooth Model)
Setiap elemen gigi dimodelkan sebagai representasi SVG 5-permukaan mandiri:
1. **O (Occlusal / Incisal):** Permukaan kunyah / tepi potong (Pusat trapesium).
2. **M (Mesial):** Permukaan menghadap garis tengah lengkung gigi (Sisi kiri/kanan tergantung kuadran).
3. **D (Distal):** Permukaan menjauhi garis tengah lengkung gigi.
4. **B / V (Buccal / Vestibular / Labial):** Permukaan menghadap pipi atau bibir (Sisi luar).
5. **L / P (Lingual / Palatal):** Permukaan menghadap lidah (rahang bawah) atau langit-langit (rahang atas) (Sisi dalam).

---

## 3. Micro-Interaction: Ink Absorption Effect
Ketika dokter gigi atau perawat memilih kondisi (misal: *Caries* `#EF4444` atau *Restored Composite* `#059669`) dan mengetuk salah satu permukaan gigi:
- **Physical Scale-Dip:** Elemen gigi sedikit menyusut (`scale(0.94)`) dalam 120ms dengan damped spring `stiffness: 420, damping: 24`.
- **Ink Absorption:** Warna tidak muncul seketika secara kaku, melainkan meresap dari pusat koordinat sentuhan (`radial-mask` ekspansi 0% ke 100% dalam 220ms).
- **Haptic Feedback:** Memicu haptic light tap `vibrate(10ms)` pada perangkat tablet touchscreen.

---

## 4. Keamanan Medis & Audit Immutability
- **Data Model:** Setiap mutasi permukaan gigi disimpan dalam tabel append-only `odontogram_surface_history`.
- **No Direct Update:** Odontogram tidak melakukan overwrite langsung pada kondisi historis; kondisi saat ini adalah hasil agregasi snapshot tanggal pemeriksaan.
- **SatuSehat FHIR Export:** Setiap anomali gigi dipetakan ke terminologi SNOMED CT / ICD-10 untuk integrasi otomatis ke `Condition` resource SATUSEHAT.
