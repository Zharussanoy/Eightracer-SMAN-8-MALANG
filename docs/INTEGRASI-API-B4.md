# Integrasi API B4

## Koneksi yang sudah dilakukan

FAQ berhasil dibuka dari laptop FE lewat HTTPS Tailscale dan mengembalikan JSON pada `data`. Base URL pengembangan dari paket backend adalah:

```env
NEXT_PUBLIC_API_BASE_URL=https://laptop-3qspir74.tail5f273f.ts.net/api
```

Salin `.env.local.example` menjadi `.env.local`, lalu mulai ulang server Next.js. `.env.local` sudah dikecualikan dari Git. Nilai ini adalah alamat koneksi, bukan token atau kredensial.

Git hanya mengizinkan template `.env.local.example` untuk disimpan. File konfigurasi lokal lainnya tetap diabaikan. Template cukup berisi alamat API; jangan menambahkan password, token, atau secret ke dalamnya. Keberhasilan akses FAQ di atas adalah pemeriksaan sebelumnya, bukan bukti server BE selalu tersedia.

## Client API

Login menggunakan route FE `/api/auth/login`, `/api/auth/me`, dan `/api/auth/logout`. Server FE meneruskan permintaan ke BE memakai Bearer token. `lib/eightracer-api.ts` menyediakan client untuk route tersebut dan pesan validasi Laravel. Contoh pemakaian:

```ts
const faq = await api.faq();
const session = await api.login({ email, password });
// Alternatif: api.login({ nisn, password }); NISN harus berupa string.
const { user } = await api.me();
```

Token tidak dikembalikan ke JavaScript browser. Server FE menyimpannya dalam cookie `HttpOnly`, `SameSite=Lax`, dengan expiry dari BE; cookie Secure diwajibkan untuk host produksi selain loopback. Saat refresh, FE memeriksa sesi melalui `/me`. Logout mencabut token di BE dan menghapus cookie. Jika BE tidak terjangkau ketika logout, cookie lokal ditutup disertai pesan bahwa pencabutan di BE belum berhasil. Jika server FE sendiri tidak terjangkau, UI tidak mengklaim logout berhasil.

Alamat BE dibaca server dari `API_BASE_URL` jika diisi, atau dari `NEXT_PUBLIC_API_BASE_URL` yang sudah ada. Konfigurasi saat ini tidak perlu ditambah agar login dapat dicoba. Route login FE hanya menerima email ATAU NISN dan password, bukan role. Permintaan lintas origin ditolak. Request dan respons akun tidak di-cache.

`GET /me` dari BE mengembalikan object akun di tingkat teratas. Identitas sesi selalu diambil dari endpoint tersebut sesudah login. Role `administrator` dipetakan ke label Admin pada UI; guru hanya memperoleh akses staff ketika `school_staff` bernilai boolean true dan email terverifikasi. Guru tanpa grant menuju profil akun. Pengalih role demo disembunyikan saat sesi BE aktif dan tidak dapat mengganti identitas yang terautentikasi.

Foto profil terlindungi belum diambil; UI memakai avatar pengganti. Profil akun yang sedang login menampilkan identitas BE, bukan nilai akademik contoh. Halaman profil demo lama masih tersedia saat tidak ada sesi, dengan penanda simulator.

`apiRequest` generik saat ini digunakan untuk permintaan publik seperti FAQ. Endpoint data B4 yang memerlukan Bearer masih perlu dihubungkan melalui route server FE pada tahap selanjutnya; jangan memindahkan token cookie ke localStorage untuk menyambungkannya.

## Endpoint modul B4

- Staff: katalog `GET/POST /beasiswa`, ubah `PUT /beasiswa/{id}`. Kontrak terbaru belum merinci operasi arsip/aktifkan terpisah; jangan menganggap `DELETE` tersedia.
- Admin: alumni dan penerimaan PT memakai `/study-tracer`; progres memakai `/alumni/{siswa_id}/progress`, riwayat memakai `/alumni/{siswa_id}/timeline`, dan revisi/publikasi memakai `/alumni-progress/{id}`.
- Admin: analitik `GET /analitik-beasiswa`; review rekomendasi `PATCH /rekomendasi-beasiswa/{id}/review`; pembuatan rekomendasi `POST /siswa/{id}/rekomendasi-beasiswa/generate`.
- Siswa: alumni berizin `GET /jejak-alumni` dan `/jejak-alumni/{id}`; rekomendasi yang disetujui `GET /rekomendasi-beasiswa/saya`.

Kontrak B4 terbaru memperluas beberapa endpoint katalog/progres kepada staff: administrator atau guru BK dengan grant aktif dan allowlist sesuai. Peta endpoint lama di atas perlu dicocokkan dengan kontrak yang benar-benar sudah dipasang di server BE sebelum integrasi tiap fitur. Endpoint `/saya` dan alumni berizin menggunakan akun siswa. Jangan memakai pilihan profil contoh pada UI sebagai identitas untuk meminta data privat.

## Sebelum mengganti data contoh B4

Minta backend menyiapkan akun uji khusus admin dan siswa dengan email terverifikasi, beserta email/NISN dan password melalui saluran pribadi. Kontrak API saja bukan akun login. Pastikan perubahan kontrak terbaru sudah terpasang di server yang diakses; dokumentasi kandidat belum membuktikan pemasangannya. Grant guru BK dapat disiapkan belakangan oleh administrator.

Kredensial dan token jangan dikirim lewat Git atau ditempel di source. Login FE sudah disambungkan pada tahap ini. Pembacaan katalog untuk sesi BE sudah disiapkan seperti dijelaskan di bawah; alumni, progres, timeline, analitik dan rekomendasi masih memakai data contoh. Foto bukti prestasi privat tidak boleh ditampilkan.

Paket menyebut CORS lokal mendukung `http://localhost:3000` atau `http://127.0.0.1:3000` secara default. Jika origin berbeda, backend perlu mengizinkannya. Laptop backend, Laravel, dan Tailscale harus aktif agar alamat pengembangan dapat digunakan.

## Pemeriksaan login

Jalankan build Webpack terlebih dahulu, lalu `node --test tests/b4-auth.test.mjs`. Tes memakai BE tiruan lokal dan akun sintetis, tidak menghubungi BE sekolah. Sebelas kasus memeriksa identifier, sumber role dari /me, grant BK, cookie HttpOnly/Secure, penolakan origin asing, expiry, respons gagal dan logout. Browser juga dipakai untuk mencoba login admin/email, siswa/NISN, refresh sesi, profil, logout, penolakan login dan tampilan ponsel.

FAQ BE sungguhan berhasil dijangkau pada 3 November 2026. Login sukses dengan akun BE sungguhan belum diverifikasi karena akun uji belum disediakan. Tidak ada password atau token sekolah yang digunakan dalam pemeriksaan ini.

## Tahap berikutnya: baca katalog

Route FE `GET /api/b4/beasiswa` meneruskan Bearer dari cookie server hanya ke `GET /beasiswa` pada base BE yang dikonfigurasi. Tidak menerima URL tujuan bebas dan tidak menyediakan operasi tulis. Backend tetap memeriksa izin staff; pilihan role demo tidak memberi akses. Respons tidak di-cache. Sesi BE yang ditolak dengan 401 dihapus dan pengguna diarahkan login.

Pada `/admin/basis-data-beasiswa`, sesi BE memakai katalog API; tanpa sesi, pratinjau demo sebelumnya tetap tersedia. Pencarian maksimal 100 karakter, perubahan filter kembali ke halaman pertama, request lama dibatalkan, dan pergantian halaman mempertahankan filter. Label UI `Kuliah & SMA` dikirim sebagai `Keduanya`. Pagination mengikuti metadata server (kontrak: 20 record), bukan memotong ulang menjadi 8.

Adapter membaca paginator Laravel dengan `data`, `current_page`, `last_page`, `per_page`, `total`, atau metadata dalam `meta`. Baris memerlukan `id` numerik, `nama_beasiswa`, `jenjang` SMA/Kuliah/Keduanya dan `is_active` boolean. Tanggal `tanggal_buka`/`tanggal_tutup` boleh kosong; ditampilkan sebagai belum tercatat, bukan tanggal karangan. Jika respons nyata berbeda, adapter perlu disesuaikan setelah sampel respons nonprivat tersedia. URL pagination serta field tambahan tidak diteruskan ke browser.

Durasi belum memiliki field pada kontrak terbaru sehingga kolom itu belum ditampilkan pada katalog API. Tambah/edit/arsip belum tersedia sebagai operasi BE. Formulir persiapan di bawah hanya menyimpan lokal. Operasi arsip/aktifkan perlu dikonfirmasi kepada tim BE sebelum dihubungkan.

Tahap ini disiapkan sambil menunggu akun uji. Pengujian menggunakan fixture lokal; belum menjadi bukti katalog BE sungguhan sesuai adapter atau dapat diakses akun sekolah. Tes integrasi katalog mencakup tamu/siswa, validasi query, 20 baris dan halaman kedua, hasil kosong, respons rusak, 429/503, serta pencabutan sesi. Tidak ada penulisan data ke BE sekolah.

Pemeriksaan lokal tahap baca katalog: 15 tes login/katalog lolos, ESLint berkas terkait lolos, serta build Webpack dan TypeScript lolos. Browser memverifikasi 20 baris, halaman kedua dengan filter Keduanya, hasil kosong, pesan kegagalan, dan layar 390 px tanpa overflow dokumen. Tabel menggunakan gulir horizontal tersendiri di ponsel.

## Persiapan formulir tambah/edit

Formulir kini mencakup nama, penyelenggara, deskripsi, jenjang, link pendaftaran, tanggal buka/tutup, status aktif dan daftar kriteria. Tanggal berupa tanggal penuh; bulan dari data demo lama tidak ditebak menjadi tanggal tertentu. Durasi lama tetap tersedia hanya pada mode contoh. Persyaratan wajib, batas panjang dan validasi draf merupakan batas UI lokal sementara, bukan pernyataan seluruh validasi BE sudah diketahui.

Setiap kriteria menyimpan nama, nilai persyaratan sebagai teks, dan bobot opsional tanpa default. Tipe/operator belum bisa dipilih karena enum yang diizinkan, kombinasi tipe/operator dan aturan bobot belum lengkap pada kontrak terbaru. Contoh `nilai_tka` dan `>=` pada Postman lama bukan daftar enum resmi. Tidak ada pembentukan payload POST/PUT atau operasi tulis BE yang diaktifkan. Tautan berprotokol selain HTTP(S), tautan berkredensial, tanggal tidak valid dan urutan tanggal terbalik ditolak dalam draf.

Tanpa sesi BE, tombol **Simpan di Browser** memperbarui katalog demo beserta field draf tambahan. Perubahan nama/kriteria demo tetap kompatibel dengan rekomendasi contoh. Dengan sesi staff BE, halaman tambah memakai **Simpan Draf Lokal** dan kunci terpisah per akun `eightracer-b4-scholarship-draft-v1:<id>`. Pemulihan setelah refresh dilakukan melalui **Pulihkan draf lokal tersimpan**. Draf ini tidak muncul di katalog sekolah. Pengguna dapat mengisi ulang jika penyimpanan browser dihapus. Guru tanpa grant/siswa tidak mendapat formulir admin.

Halaman edit saat sesi BE belum menampilkan form sampai kontrak pengambilan detail beserta kriteria dipastikan. Data contoh tidak digunakan untuk menimpa record BE. Konfirmasi yang masih diperlukan dari tim BE: enum tipe kriteria/operator dan kombinasi yang sah, tipe/rentang bobot, kewajiban dan batas field, referensi program eligibilitas, bentuk pengambilan detail beasiswa, serta operasi arsip/aktifkan. Field `program_eligibilitas_id` opsional belum dipilih karena sumber referensinya belum dipastikan.

Pemeriksaan formulir: total 18 tes lokal login/katalog/draf lolos. Tambah/hapus kriteria, penyimpanan draf akun sintetis, pemulihan setelah refresh termasuk tanggal, penolakan tanggal terbalik, edit data contoh dan pemeliharaan deskripsi diperiksa di browser. Layar 390 px tidak menunjukkan overflow dokumen. ESLint berkas terkait, TypeScript dan build Webpack lolos. Akun yang dipakai seluruhnya sintetis pada fixture lokal.
