# Modul 06: Local Edge Agent (Auto X-Ray Ingestion)

## 1. Ringkasan Teknis Radiologi Gigi
Modul Local Edge Agent adalah service latar belakang (daemon) ringan yang diinstal pada PC workstation radiologi lokal di klinik (terhubung dengan sensor RVG intraoral, OPG panoramik, atau CBCT 3D).

---

## 2. Alur Kerja Watcher Folder
1. Sensor X-ray lokal menyimpan file citra ke folder output (format `.dcm`, `.tif`, `.png`, `.jpg`).
2. Daemon mendeteksi kemunculan file baru via filesystem watcher (inotify / ReadDirectoryChangesW).
3. Daemon mengekstrak metadata DICOM (Patient ID, Study Date, Modality) atau memetakan file ke sesi dental chair yang sedang aktif pada jam tersebut.
4. Citra dienkripsi secara lokal (AES-256) dan diunggah ke Object Storage (AWS S3/MinIO) dengan enkripsi at-rest.
5. Pre-Signed URL dengan masa berlaku 15 menit diterbitkan ke frontend dokter untuk ditampilkan langsung pada kanvas Odontogram EMR.
