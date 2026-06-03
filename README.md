# 🖥️ Kiosk & Admin Dashboard Absensi Siswa Berbasis Deteksi Wajah (Frontend)

> **Dokumentasi Artefak Frontend — Tugas Besar Object-Oriented Analysis and Design (OOAD) Semester 6** > Sistem Absensi Mandiri Biometrik Wajah yang Dirancang Khusus untuk Siswa Sekolah Dasar (Usia 6–12 Tahun) Menggunakan Arsitektur *Single Page Application* (SPA) Berkinerja Tinggi.

---

## 📝 Deskripsi Proyek

Aplikasi *frontend* ini merupakan subsistem antarmuka pengguna (UI/UX) dari sistem absensi berbasis pengenalan wajah (*face recognition*). Mengingat target pengguna utama adalah siswa SD yang tidak membawa ponsel ke sekolah, sistem ini diimplementasikan dalam **Kiosk Mode** (berjalan satu layar penuh pada PC/Laptop lobi sekolah dengan perangkat kamera penangkap). 

Sistem ini memisahkan secara tegas urusan antarmuka (*Separation of Concerns*) dari *heavy computation* AI pada backend Python (Flask + DeepFace), memastikan interaksi layar berjalan instan, tanpa *reload* halaman, tahan banting, dan ramah anak.

---

## ✨ Fitur-Fitur Secara Rinci

### 1. Antarmuka Kiosk Siswa (Kid-Friendly Kiosk Interface)
* **Aksesibilitas Visual Kontras Tinggi:** Layout didesain dengan elemen grafis yang besar, tipografi tebal (*black font weight*), dan sudut melengkung ramah anak (*rounded-3xl*), mengurangi kebingungan navigasi bagi anak usia dini.
* **Live Camera Assist Grid:** Menyediakan *viewfinder* kamera dengan *dashed-frame overlay* sebagai panduan instan bagi siswa untuk memposisikan wajah mereka dengan benar di depan lensa webcam.
* **Native Text-to-Speech (TTS) Feedback:** Memanfaatkan *Web Speech API* langsung pada peramban (*browser native*). Server backend tidak perlu memproses atau mengirim berkas audio; frontend otomatis mengucapkan kalimat salam seperti:  
    > *"Selamat pagi, [Nama Siswa]. Selamat belajar!"* (Aksen resmi `id-ID`).
* **State Machine Timeout (Auto-Reset):** Ketika absensi berhasil (`success`) atau gagal (`failed`), sistem menampilkan kartu status berukuran satu layar penuh. State ini dilindungi oleh komponen pengatur waktu (*timeout*) yang otomatis mengembalikan layar ke mode siaga kamera dalam **3 detik** demi mengurai antrean lobi sekolah.
* **Simulasi Controller Internal:** Menyediakan tombol injeksi state khusus di bagian bawah layar Kiosk untuk kebutuhan pengujian kelompok tanpa harus menyalakan subsistem kamera dan AI backend (sangat krusial untuk kelancaran demonstrasi di hadapan Dosen Penguji).

### 2. Antarmuka Dashboard Admin & Guru (Teacher Monitoring Panel)
* **Bento-Grid Stat Widgets:** Ringkasan eksekutif kehadiran hari ini yang disajikan lewat kartu indikator warna (Hijau: Hadir Tepat Waktu, Kuning: Terlambat, Merah: Gagal Deteksi/Asing).
* **Smart Activity Polling System:** Tabel log aktivitas terbaru berjalan secara asinkronus tanpa mengganggu aktivitas komputasi utama. Data diperbarui otomatis setiap **5 detik** memanfaatkan siklus hidup kurator cache dari TanStack Query.
* **State Refetching & Synchronize Manual:** Menyediakan tombol pemaksa sinkronisasi (*manual refetch*) dengan indikator animasi *loading spin* yang responsif untuk memastikan data administrasi selalu mutakhir.

---

## 🛠️ Spesifikasi Modern Tech Stack

Aplikasi ini dibangun menggunakan ekosistem pengembangan web modern berbasis node kompilasi cepat:

1.  **Vue 3 (Composition API):** Menggunakan pola `<script setup>` untuk penulisan kode yang lebih bersih, pemisahan logika reaktif yang modular, serta pemanfaatan siklus hidup komponen (*lifecycle hooks*) yang optimal.
2.  **Vite.js:** Perangkat bundler dan pengembangan generasi terbaru dengan *Hot Module Replacement* (HMR) super cepat untuk efisiensi koding tim.
3.  **Tailwind CSS v3:** Kerangka kerja CSS berbasis *utility-first* untuk penulisan gaya tampilan terdistribusi tanpa mengotori berkas CSS global.
4.  **DaisyUI Component Library:** Plugin Tailwind CSS komersial yang menyediakan komponen UI siap pakai dengan struktur semantik semacam `.btn`, `.card`, dan `.table`, serta mendukung konfigurasi manajemen tema visual.
5.  **TanStack Vue Query (React Query for Vue):** Mengelola penanganan state server, sinkronisasi data API, eliminasi *memory leak* pada perangkat keras Kiosk, dan otomatisasi retensi cache data log.
6.  **Axios:** Klien HTTP berbasis *promise* untuk melakukan request data asinkronus menuju *endpoint Restful API* milik Flask.
7.  **Lucide Vue Next:** Paket ikon vektor berbasis SVG yang ringan, tajam, dan mudah dikustomisasi skalanya melalui utilitas kelas Tailwind.

---

## 📂 Dokumentasi Struktur Folder Proyek

Berikut adalah peta struktur repositori frontend yang harus dipatuhi oleh seluruh anggota kelompok dalam memisahkan penulisan kode:

```text
absensi-siswa-fe/
├── .gitignore               # Konfigurasi pengecualian pelacakan berkas Git
├── index.html               # Berkas template HTML utama aplikasi
├── package.json             # Manifes proyek, daftar dependensi, dan skrip otomasi
├── postcss.config.js        # Konfigurasi plugin pemrosesan akhir CSS (Autoprefixer)
├── tailwind.config.js       # Konfigurasi pemetaan jalur konten dan tema DaisyUI
└── src/
    ├── main.js              # Titik masuk utama aplikasi (Inisialisasi Vue & Vue Query)
    ├── style.css            # Berkas injeksi direktif dasar Tailwind CSS (@tailwind)
    ├── App.vue              # Komponen Root (Menyediakan navigasi tab global Kiosk/Admin)
    ├── assets/              # Penyimpanan aset statis lokal (Logo sekolah, ikon manual)
    ├── components/          # Komponen modular skala kecil yang dapat digunakan berulang
    │   ├── StatCard.vue     # Widget kartu indikator statistik kuantitas kehadiran admin
    │   ├── LogTable.vue     # Tabel penampil baris riwayat data absensi real-time
    │   └── CameraFeed.vue   # Kotak pembungkus viewport streaming kamera sisi kiosk
    └── views/               # Komponen utama penampung halaman penuh (Layout View)
        ├── KioskView.vue    # Halaman utama lobi sekolah untuk penanganan absen siswa
        └── AdminView.vue    # Halaman monitoring guru untuk rekapitulasi data harian