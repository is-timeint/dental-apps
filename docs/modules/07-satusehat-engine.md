# Modul 07: SATUSEHAT Interoperability Engine

## 1. Regulasi & Kepatuhan Kemenkes RI
Sesuai Permenkes No. 24 Tahun 2022 tentang Rekam Medis Elektronik, setiap fasilitas pelayanan kesehatan gigi wajib terintegrasi dengan platform nasional SATUSEHAT milik Kementerian Kesehatan RI menggunakan standar HL7 FHIR R4.

---

## 2. Resource FHIR Gigi yang Dikelola
1. **`Encounter`:** Kunjungan konsultasi / rawat jalan gigi (tiba di klinik, masuk chair-side, checkout kasir).
2. **`Condition`:** Diagnosa karies, pulpitis, gingivitis, maloklusi menggunakan kode ICD-10 (contoh: `K02.1` Karies Dentin, `K04.0` Pulpitis Akut, `K05.3` Periodontitis Kronis) dan SNOMED CT.
3. **`Observation`:** Tanda-tanda vital (Tekanan Darah, Nadi, Suhu) dan kedalaman saku periodontal (OHI-S / Perio Probing).
4. **`Procedure`:** Tindakan penambalan, pembersihan karang gigi (scaling), PSA, odontektomi, atau pemasangan bracket orto (ICD-9-CM, contoh: `23.2` Restorasi gigi dengan tumpatan, `96.54` Scaling gigi).
5. **`MedicationRequest` & `MedicationDispense`:** Resep digital terhubung kode KFA Kemenkes RI.
