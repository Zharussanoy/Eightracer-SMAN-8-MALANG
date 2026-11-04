# Persiapan uji fungsional B4 — 4 November 2026

## Status berdasarkan pemeriksaan 3 November

Uji harus memakai backend nyata. Hasil fixture, data browser dan draf lokal bukan bukti integrasi BE berhasil. Endpoint FAQ BE mengembalikan HTTP 200 pada pemeriksaan terakhir; ini tidak membuktikan endpoint privat atau operasi simpan bekerja.

| Alur | Implementasi saat ini | Bukti yang masih diperlukan |
| --- | --- | --- |
| Login, sesi, logout | Proxy FE dan cookie sesi tersedia; teruji dengan fixture | Akun BE admin/siswa, login nyata, refresh dan logout nyata |
| Baca katalog | GET, pencarian, filter dan pagination tersedia; teruji dengan fixture | Respons katalog nyata sesuai adapter dan akses siswa ditolak |
| Tambah/edit/arsip katalog | POST/PUT/DELETE BE sudah dipasang pada 4 November; teruji dengan fixture | Uji record khusus di BE nyata; konfirmasi seluruh enum dan aturan field/bobot |
| Alumni/timeline/progres | Data contoh | Integrasi baca/detail dan simpan/koreksi dengan ID referensi aktual |
| Rekomendasi/review | Simulasi browser | Generate/review nyata serta hasil yang disetujui terbaca oleh akun siswa yang tepat |
| Chat | Jawaban contoh | Sambungan endpoint, jawaban faktual dan penanganan fallback |
| Impor | Simulasi lokal | Preview, persetujuan commit, pemantauan batch dan worker pada server uji |

## Yang harus disiapkan bersama pemilik BE

1. Akun uji khusus admin dan siswa, email terverifikasi; kredensial dibagikan melalui jalur pribadi dan dimasukkan langsung pada login lokal. Tidak ditempel ke source, chat Codex, laporan atau Git.
2. Data sintetis yang boleh diubah dan ditandai sebagai data uji. Pemilik BE menentukan server/database uji serta pencadangan dan pemulihannya. Jangan menganggap server yang tersedia terpisah dari data sekolah.
3. Konfirmasi versi kontrak yang sudah terpasang, endpoint pengambilan detail katalog, enum tipe/operator beserta kombinasi yang diizinkan, tipe/rentang bobot, batas/kewajiban field, dan cara arsip/aktifkan.
4. Laptop BE, aplikasi BE dan Tailscale tetap aktif pada jam pengujian. Worker/provider diperlukan hanya untuk alur yang memakainya.
5. Daftar use case wajib dari penguji untuk menentukan urutan. Jika semua use case B4 wajib, seluruh baris yang belum terhubung tetap merupakan pekerjaan terbuka.

## Urutan pelaksanaan

### 1. Login dan otorisasi

- Masuk dengan akun admin; identitas harus berasal dari BE, bukan pilihan role contoh.
- Refresh: sesi tetap dikenali. Logout: sesi BE dicabut dan akses privat ditolak.
- Masuk dengan akun siswa; endpoint katalog staff harus menolak akses. Jangan mengubah role atau grant untuk melewati pemeriksaan.

### 2. Baca katalog

- Muat katalog nyata, cari nama, gabungkan filter jenjang dan pindah halaman.
- Cocokkan jumlah/ID dengan respons BE, termasuk hasil kosong.
- Bila bentuk respons berbeda, sesuaikan adapter FE; jangan mengganti kontrak BE sepihak.

### 3. Tulis katalog, sesudah integrasi tersedia

- Pakai program sintetis yang disepakati. Simpan sekali dengan tombol yang mencegah kirim ganda.
- Pastikan respons sukses, lalu ambil ulang data dari server. Refresh halaman dan buka dari sesi/perangkat kedua bila tersedia. Keberadaan di localStorage tidak cukup.
- Ubah satu field dan baca ulang. Pastikan ID record tetap tepat; jangan memakai ID ilustrasi atau ID demo.
- Untuk validasi 422, pertahankan isian dan tampilkan error field. Jangan otomatis mengulang operasi tulis saat timeout; periksa apakah record sudah dibuat lebih dahulu.

### 4. Alumni dan rekomendasi sesuai prioritas penguji

- Gunakan siswa/alumni sintetis dengan ID aktual. Baca data sebelum menulis progres dan baca ulang sesudahnya.
- Konflik 409 memerlukan muat ulang/tinjau ulang, bukan menimpa versi terbaru secara paksa.
- Generate rekomendasi hanya melalui tindakan pengguna, bukan saat halaman dibuka. Tinjau draft sebelum menyetujui publikasi.
- Akun siswa hanya melihat hasil miliknya yang telah disetujui. Uji privasi juga merupakan bagian fungsi.
- Impor, bila wajib, harus preview dahulu dan commit hanya setelah ringkasan ditinjau; jangan otomatis commit.

## Bukti minimum tiap use case

Catat tindakan, hasil yang diharapkan, hasil aktual, status lulus/gagal/belum diuji dan waktu pemeriksaan. Screenshot tidak boleh menampilkan password, token atau data pribadi sekolah. Bedakan kegagalan aplikasi dari server mati, izin ditolak, validasi dan provider tidak tersedia. Jangan memberi status lulus sebelum aksi benar-benar diuji ke BE.

## Menjalankan FE lokal

Gunakan hasil build yang telah diverifikasi: `npm run build -- --webpack`, lalu `npm run start -- --hostname 127.0.0.1 --port 3000`. Jalankan build saat server lokal dihentikan terlebih dahulu. Alamat login: `http://127.0.0.1:3000/login`. Jangan mengganti database atau konfigurasi BE dari repo FE.

Pengujian otomatis lokal: `node --test tests/b4-auth.test.mjs tests/b4-scholarship-draft.test.mjs`. Tanpa opsi pemeriksaan browser, fixture berhenti otomatis setelah tes. Hasil tes ini tetap bukan bukti server BE sekolah sudah terintegrasi.
