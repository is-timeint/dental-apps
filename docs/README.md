# Indeks Dokumentasi Modular Dental-Apps (PMS/EDR)

Arsitektur dokumentasi teknis berskala enterprise untuk sistem Dental Practice Management System (PMS) dan Electronic Dental Record (EDR). Setiap modul didokumentasikan dalam file terpisah di direktori `docs/modules/` untuk menjamin isolasi logika, kemudahan audit regulasi (Permenkes 24/2022, UU PDP 27/2022), dan presisi knowledge graph.

---

## Matriks Modul & Relasi Sistem

| No | Modul | File Dokumentasi | Fokus Klinis & Teknis | Relasi Kunci |
|---|---|---|---|---|
| 01 | Live Floor & Chair Operations | [`01-live-floor.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/01-live-floor.md) | Visualisasi 4-8 dental chair, status real-time, timer tindakan | Modul 02, 05, 13 |
| 02 | Clinical Workspace & Odontogram 2.0 | [`02-odontogram-emr.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/02-odontogram-emr.md) | FDI 2-digit, 5-surface vector tooth, riwayat restorasi, EDR | Modul 01, 04, 06, 07, 12 |
| 03 | Dental Lab Hub & Schedule Interlock | [`03-dental-lab-hub.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/03-dental-lab-hub.md) | Tracking order crown/veneer/aligner, calendar interlock | Modul 02, 05, 08 |
| 04 | Inventaris & Smart BMHP | [`04-inventaris-bmhp.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/04-inventaris-bmhp.md) | Procedure-based Bill of Materials, auto-deduction, batch expiry | Modul 02, 05, 09 |
| 05 | Billing, POS & Commission Engine | [`05-billing-pos.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/05-billing-pos.md) | Split-bill, komisi dokter progresif, QRIS, e-Invoice | Modul 01, 02, 04, 10, 15 |
| 06 | Local Edge Agent (X-Ray Ingestion) | [`06-local-edge-agent.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/06-local-edge-agent.md) | File watcher DICOM/JPEG lokal intraoral/panoramic, S3 upload | Modul 02, 07 |
| 07 | SATUSEHAT Interoperability Engine | [`07-satusehat-engine.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/07-satusehat-engine.md) | FHIR Bundle R4 (Encounter, Condition, Observation, Procedure) | Modul 02, 11, 14 |
| 08 | Automated WhatsApp CRM & Recall | [`08-whatsapp-crm.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/08-whatsapp-crm.md) | Reminder otomatis H-1, recall pasca cabut/scaling, OTP | Modul 01, 03, 05 |
| 09 | Multi-Branch Logistics & Transfer | [`09-multibranch-logistics.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/09-multibranch-logistics.md) | Mutasi stok antar cabang klinik, PO konsolidasi pusat | Modul 04, 05 |
| 10 | TPA & Corporate Insurance Claim | [`10-insurance-tpa.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/10-insurance-tpa.md) | Split coverage TPA (AdMedika/Reliance), co-payment kalkulator | Modul 05, 15 |
| 11 | e-Prescription & Kamus Farmasi (KFA) | [`11-e-prescription-kfa.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/11-e-prescription-kfa.md) | Resep digital terhubung KFA Kemenkes, cek alergi & interaksi | Modul 02, 07, 14 |
| 12 | Periodontal Charting & OHI-S | [`12-periodontal-charting.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/12-periodontal-charting.md) | 6-point probing depth, Bleeding on Probing (BOP), Furcation | Modul 02, 07 |
| 13 | Queue TV Display & Audio Calling | [`13-queue-tv-display.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/13-queue-tv-display.md) | Layar display ruang tunggu, Web Speech API audio paging | Modul 01, 14 |
| 14 | Clinical Safety Interlock & Triage | [`14-clinical-safety-interlock.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/14-clinical-safety-interlock.md) | Hard-stop anestesi jika tensi >160/100, alert alergi obat | Modul 01, 02, 11 |
| 15 | Rekonsiliasi Kasir & Shift Mgmt | [`15-cashier-reconciliation.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/15-cashier-reconciliation.md) | Blind drop cash drawer, selisih shift, dual-supervisor approval | Modul 05, 10 |
| 16 | Bridging BPJS Kesehatan P-Care | [`16-bpjs-pcare-bridging.md`](file:///Users/luky.septyan/Documents/PV%20Docs/Dental-Apps/docs/modules/16-bpjs-pcare-bridging.md) | Enkripsi HMAC-SHA256, klaim kapitasi/non-kapitasi gigi | Modul 02, 05, 07 |

---

## Standar Keamanan & Kepatuhan Antar Modul
1. **Multi-Tenancy Isolation:** Setiap query data wajib menyertakan filter `clinic_id`.
2. **Zero-PHI Logging:** Dilarang mencatat NIK, nama lengkap pasien, atau diagnosis pada server logs.
3. **Signed URLs:** Akses citra medis X-ray (DICOM/JPEG) wajib menggunakan AWS S3/MinIO Pre-Signed URL dengan masa berlaku maksimal 15 menit.
4. **Audit Trail Immutability:** Setiap perubahan status odontogram, resep, atau pembayaran tercatat dalam tabel append-only `audit_logs`.
