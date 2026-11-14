# Perbaikan login lokal — 4 November 2026

MySQL XAMPP pada 127.0.0.1:3306 dapat dihubungi Laravel dan database eightracer_db berisi data sekolah. Sebelum perbaikan ini, login langsung ke Laravel berhasil (200), sedangkan POST maupun OPTIONS ke /api/auth/login di Next.js mengembalikan 500 tanpa respons JSON.

Pemeriksaan menemukan satu berkas JavaScript hasil kompilasi yang dibutuhkan route login berukuran **0 byte**. Log Next.js mencatat kegagalan penulisan karena volume penuh (os error 112). Setelah ruang tersedia lagi, server masih membaca hasil kompilasi yang tidak lengkap tersebut.

Perbaikan berada di proyek utama C:/eightracer/frontend:

- Output pengembangan memakai .next-local agar terbentuk ulang dari source saat ini.
- Output produksi memakai .next-production, terpisah dari server pengembangan.
- Cache filesystem Turbopack untuk pengembangan dinonaktifkan agar tidak terus menambah cache persisten pada laptop dengan ruang terbatas.
- Folder output diabaikan Git dan path tipe hasil generasi disesuaikan Next.js.
- Dependensi xlsx yang sudah tercantum pada package.json dipasang karena sebelumnya belum tersedia di node_modules.

Next.js memuat ulang konfigurasi dan kompilasi baru berhasil. Berkas pengganti yang diperiksa berukuran 852.932 byte. Tidak dilakukan perubahan skema atau impor ulang data sekolah, dan kredensial akun uji tidak diubah.

Verifikasi layanan nyata:

| Pemeriksaan | Hasil |
| --- | --- |
| Login Admin melalui FE localhost | 200 |
| Login Siswa melalui FE 127.0.0.1 | 200 |
| Pemulihan sesi /api/auth/me | 200 untuk kedua akun |
| Halaman tujuan setelah login | 200 untuk kedua peran |
| Katalog pengelolaan untuk Admin | 200 |
| Katalog pengelolaan untuk Siswa | 403 |
| Password salah | 422; sesi tidak dibuat |
| Logout | 200; sesi pengujian dicabut |
| Token pada JSON browser | Tidak diteruskan; cookie HttpOnly |
| TypeScript dan lint konfigurasi | Lulus |

Bukti rinci tanpa password/token: C:/eightracer/.local/fixed-login-verification.json. Pratinjau: http://localhost:3000/login. Jika browser masih menampilkan kegagalan sebelumnya, muat ulang dengan Ctrl+Shift+R.

Pada pemeriksaan terakhir, ruang C: sekitar 850 MiB. Folder kompilasi lama masih disimpan; ruang penyimpanan perlu ditambah untuk mencegah kegagalan penulisan berulang. Build produksi tidak dijalankan dalam pemeriksaan ini.
