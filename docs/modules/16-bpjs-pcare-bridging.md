# Modul 16: Bridging BPJS Kesehatan P-Care Gigi (Add-On Extension)

## 1. Ringkasan Integrasi BPJS FKTP
Modul Bridging BPJS Kesehatan P-Care memungkinkan klinik gigi yang bekerjasama dengan BPJS Kesehatan mencatat kunjungan kepesertaan, nomor rujukan faskes tingkat 1 (FKTP), dan klaim tindakan gigi kapitasi maupun non-kapitasi secara langsung tanpa *double entry*.

---

## 2. Kriptografi & Protokol Autentikasi BPJS
- Autentikasi header request menggunakan enkripsi `HMAC-SHA256` dengan `X-Cons-ID`, `X-Timestamp`, dan `X-Signature`.
- Payload response terenkripsi didekripsi menggunakan algoritma `AES-256-CBC` dengan key kombinasi `cons_id + secret_key + timestamp`.
- Tindakan gigi kapitasi yang dicover (Scaling 1x setahun dengan indikasi medis, pencabutan gigi sulung/tetap, tumpatan komposit/GIC, obat pereda nyeri/antibiotik dasar).
