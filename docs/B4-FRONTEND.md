# Frontend B4 — Alumni dan Beasiswa

Sebagian besar halaman modul B4 masih memakai data contoh dan belum memakai layanan AI. Login, pemeriksaan sesi dan logout sudah dihubungkan ke kontrak API BE. Pembacaan katalog beasiswa untuk sesi BE sudah disiapkan; pengujian dengan akun BE sungguhan masih menunggu akun uji. Jangan gunakan pilihan profil contoh sebagai pengganti otorisasi backend. Rincian dan batas pemeriksaan ada di `docs/INTEGRASI-API-B4.md`.

## Halaman

| Peran | URL | Fungsi |
| --- | --- | --- |
| Admin | `/admin/alumni-perguruan-tinggi` | Pencarian dan filter alumni |
| Admin | `/admin/alumni-perguruan-tinggi/informasi-detail?id=dian` | Edit progres, riwayat, visibilitas biaya, impor Excel |
| Admin | `/admin/timeline-individu` | Riwayat sekolah dan progres per semester |
| Admin | `/admin/analitik-beasiswa` | Visualisasi angka contoh, pengelompokan UKT |
| Admin | `/admin/basis-data-beasiswa` | Pencarian, filter, arsip/aktifkan katalog |
| Admin | `/admin/basis-data-beasiswa/tambah` | Tambah program dan kriteria |
| Admin | `/admin/basis-data-beasiswa/edit?id=b4-scholarship-1` | Edit program dan kriteria |
| Admin | `/admin/rekomendasi-beasiswa` | Tinjau, edit alasan, sembunyikan, hapus, publikasikan rekomendasi |
| Siswa | `/siswa/jejak-alumni` | Pencarian/filter kartu alumni |
| Siswa | `/siswa/jejak-alumni/dian` | Data masuk PT dan progres kuliah |
| Siswa | `/siswa/rekomendasi-beasiswa` | Rekomendasi yang dipublikasikan untuk profil siswa |
| Siswa | `/siswa/rekomendasi-beasiswa/bagas-1` | Detail rekomendasi contoh Bagas |
| Siswa | `/siswa/rekomendasi-beasiswa/chat` | Percakapan dengan jawaban contoh |

## Mencoba alur

1. Tanpa sesi BE, tambahkan beasiswa melalui katalog demo. Isi penyelenggara, deskripsi dan minimal satu nama kriteria, lalu **Simpan di Browser**. Pindah halaman atau refresh: data tetap tersimpan di browser yang sama. Dengan sesi BE, katalog menggunakan API baca saja; **Siapkan Draf Beasiswa Lokal** menyimpan draf terpisah, belum mengubah katalog sekolah. Untuk memulihkan draf sesudah refresh, pilih **Pulihkan draf lokal tersimpan**. Edit/arsip BE belum diaktifkan.
2. Buka rekomendasi admin. Profil awal adalah Nadia dan status awalnya draft. Tinjau lalu tekan **Publikasikan Ke Siswa**.
3. Buka rekomendasi siswa. Pilih **Nadia Putri Wicaksono** pada pilihan profil contoh. Rekomendasi yang dipublikasikan akan terlihat.
4. Edit alasan atau visibilitas rekomendasi di admin. Status kembali menjadi draft sampai dipublikasikan ulang.
5. Edit progres Dian. Tombol mata menentukan visibilitas nominal UKT/IPI di detail siswa, bagian **Progress Kuliah**. Ini simulasi UI; API nantinya wajib menyaring data sensitif di server.

Bagas memiliki rekomendasi terpublikasi pada data awal agar sisi siswa langsung bisa dicoba. Nadia dan Rizky belum dipublikasikan. Generate Ulang hanya menyusun contoh dari katalog aktif, tanpa memanggil AI.

Penyimpanan menggunakan `localStorage` dengan kunci `eightracer-b4-demo-v1`. Data tidak tersimpan ke server dan tidak dibagikan ke perangkat lain. Menghapus kunci tersebut melalui DevTools mengembalikan data awal saat halaman dimuat ulang.

## Impor progres

Unduh template pada dialog **Sinkronkan Data**. Format `.xlsx` atau `.xls`, maksimal 5 MB, satu lembar pertama dengan 1–8 baris untuk alumni yang sedang dibuka.

| Kolom | Nilai |
| --- | --- |
| `semester` | Bilangan bulat 1–8, tanpa duplikat |
| `ipk` | Angka 0–4 |
| `kipk` | Ya / Tidak |
| `beasiswa` | Nama beasiswa, boleh kosong |
| `ukt` | Nominal angka tanpa pemisah ribuan |
| `ipi` | Nominal angka tanpa pemisah ribuan, boleh kosong |

Impor memperbarui semester yang sama setelah pratinjau disetujui dengan **Simpan**. Nominal hasil impor disembunyikan dari siswa secara awal. Pemeriksaan file tidak mengirim berkas ke server.

## Persiapan integrasi BE

Sumber data demo terpusat di `components/b4/demoStore.ts`. Sepakati kontrak API sebelum mengganti penyimpanan lokal:

- Identitas dan peran dari sesi login, serta pemeriksaan akses di setiap endpoint.
- ID alumni, mahasiswa/siswa, program beasiswa, semester, dan rekomendasi yang konsisten.
- Format paginasi, pencarian/filter, respons kosong, validasi, dan pesan kesalahan.
- Operasi katalog, progres, impor, visibilitas nominal, serta transisi draft/publikasi rekomendasi.
- Batas layanan AI: input yang diizinkan, respons terstruktur, status proses, dan penanganan gagal.
- Siswa hanya menerima rekomendasi miliknya yang telah dipublikasikan dan nominal yang boleh ditampilkan. LocalStorage dan pilihan profil harus diganti dengan sesi serta data dari backend.

Halaman analitik masih menggunakan dataset contoh tersendiri. Grafik dan ringkasan belum merupakan hasil agregasi progres yang diedit di admin. Foto alumni memakai avatar pengganti sampai aset resmi tersedia.

## Pemeriksaan lokal

ESLint untuk komponen B4 dan TypeScript telah lolos. Alur tambah/edit katalog, persistensi setelah refresh, publikasi per profil, kembali ke draft, visibilitas biaya, impor Excel, dan percakapan demo telah diuji melalui browser. Sembilan halaman diuji pada lebar 390 px tanpa overflow dokumen; tabel dan timeline semester menggunakan area gulir tersendiri.

Build produksi berhasil dengan `npm run build -- --webpack`. Pada lingkungan pemeriksaan ini, build Turbopack bawaan mengalami crash ketika menjalankan proses CSS, termasuk saat dicoba dengan runtime Node lain. Script build bersama tetap dipertahankan; opsi Webpack dapat dipakai sebagai pembanding sementara.

### Pemeriksaan 3 November 2026

- ESLint untuk berkas B4 yang akan disimpan dan client API lolos. Pemeriksaan format `git diff --check` juga lolos.
- Build produksi dengan Webpack lolos, termasuk TypeScript dan pembuatan halaman. Build Turbopack kembali gagal ketika memulai proses pengolahan CSS; kegagalan ini belum diperbaiki.
- Sebanyak 13 halaman admin/siswa dibuka dari server hasil build. Halaman detail ditunggu sampai kontennya tampil. Tidak ditemukan error aplikasi atau overflow dokumen pada ukuran browser yang diperiksa.
- Pencarian katalog, kombinasi filter tanpa hasil, reset filter, pergantian tab progres siswa, pilihan semester, dan jawaban percakapan demo diperiksa kembali.
- Beranda, beranda admin, dan direktori alumni lama juga dibuka tanpa error aplikasi. Pemeriksaan ini bukan pengujian menyeluruh fitur kelompok lain.
- Pemeriksaan kali ini belum mencakup integrasi API BE, layanan AI, atau pengujian ulang semua operasi simpan dan impor. Hasil pemeriksaan lama di atas tidak menggantikan pengujian integrasi nanti.

### Penyesuaian setelah penggabungan main

Pembaruan main sampai commit `32a3cd3` telah digabung ke b4. Navbar bersama dari layout utama digunakan oleh seluruh halaman B4; komponen B4Navbar lama dipertahankan sebagai kompatibilitas tanpa merender header tambahan.

- Menu **Alumni dan Beasiswa** tersedia di dropdown desktop dan menu ponsel. Di area admin, menu menuju `/admin/alumni-perguruan-tinggi`; di area siswa, menu menuju `/siswa/jejak-alumni`. Di halaman umum, tujuan mengikuti role contoh dari UserContext.
- Tujuan menu tersebut hanya navigasi. Pilihan role demo tidak memberi izin API BE. Profil siswa contoh pada data demo B4 masih terpisah dari identitas akun UserContext sampai integrasi data modul diselesaikan.
- Link direktori bersama memakai `/alumni?tab=direktori`. Breadcrumb layanan B4 menuju `/#layanan`.
- Navbar bersama dibungkus Suspense agar halaman detail dinamis B4 dapat dibangun dengan Cache Components.
- Build Webpack dan TypeScript lolos setelah cache tipe route pengembangan lama disisihkan. Cache tersebut masih merujuk halaman `/admin/alumni` yang dipindahkan oleh main; file sumber tidak perlu dikembalikan ke lokasi lama.
- Pada hasil build, 13 halaman B4 diperiksa dengan satu navbar utama dan tanpa header B4 tambahan. Link desktop/siswa, direktori alumni, menu ponsel pada lebar 390 px, dan tujuan menu berdasarkan role contoh admin/siswa di beranda diperiksa.

Sorotan tabel B4 memakai `#FEEEC9`; warna emas untuk badge dan aksen tetap `#FCC850`. Warna sorotan yang dihitung browser telah diperiksa sebagai `rgb(254, 238, 201)`.
