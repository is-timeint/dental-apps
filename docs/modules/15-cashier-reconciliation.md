# Modul 15: Rekonsiliasi Kasir, Shift Management & Refund Workflow

## 1. Ringkasan Kasir & Pengendalian Kas
Modul Rekonsiliasi Kasir mengelola pergantian shift kasir (Shift Pagi & Shift Malam), perhitungan uang fisik di laci (*cash drawer*), dan prosedur pengembalian dana (*refund*) pasien jika terjadi pembatalan tindakan medis.

---

## 2. Mekanisme Blind Drop Reconciliation
1. Di akhir shift, kasir memasukkan jumlah lembaran dan koin fisik kas nyata tanpa melihat total akumulasi penjualan di layar (*Blind Drop*).
2. Sistem membandingkan angka fisik kasir dengan catatan transaksi invoice sistem.
3. Jika terdapat selisih (*variance*) lebih dari Rp 5.000, sistem mewajibkan pengisian catatan keterangan selisih dan persetujuan supervisor klinik (`ROLE_CLINIC_MANAGER`).
