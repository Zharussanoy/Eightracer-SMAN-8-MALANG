# Integrasi API B4

## Persiapan demo: CSV katalog, PDF dan pagination

Pengguna mengizinkan perubahan **informasi beasiswa saja**, bukan data siswa/alumni. Oleh karena itu impor yang diaktifkan adalah CSV katalog beasiswa baru: template UTF-8 BOM, 1–20 baris, maksimal 5 MB, pratinjau dan konfirmasi sebelum penyimpanan. CSV dengan ID/kolom siswa/alumni atau kolom di luar template ditolak. `kriteria_json` harus memuat kriteria lengkap. Field status hasil perhitungan tidak dikirim; program baru dibuat Aktif melalui kontrak katalog.

CSV katalog menggunakan POST `/api/b4/beasiswa` → `/api/beasiswa` **per baris**. Tidak mengarang module beasiswa pada `/imports` generik yang belum ada pada kontrak. Tidak ada upsert berdasarkan nama, penggantian record lama, atau commit impor siswa/alumni. Saat satu baris gagal, proses berhenti; baris sukses sebelumnya tetap tersimpan. Tombol terkunci selama proses dan tidak mengulang penyimpanan otomatis. Pengguna diminta memeriksa katalog sebelum unggah ulang setelah kegagalan parsial.

Ekspor pada panel UKT memakai GET `/api/b4/reports/alumni-pdf` → `/api/buku-alumni/pdf` dengan Bearer server, filter snapshot dan respons blob. Query angkatan/prodi dipetakan menjadi tahun_lulus/program_studi. PDF harus bertipe application/pdf dan berawalan `%PDF-`; HTML/JSON sukses palsu ditolak. Respons privat no-store, nama berkas tetap, dan error 401/403/422/429/503 ditangani. Runtime PDF pada BE asli masih perlu dikonfirmasi; pengujian sintetis hanya membuktikan transport/unduhan dan status kegagalan, bukan isi atau render laporan sekolah.

Pagination daftar alumni kini berupa panah, nomor awal/aktif/akhir dan titik-titik seperti referensi desain; jumlah halaman tetap metadata BE (contoh 599 penerimaan dengan 20/halaman = 30 halaman), bukan angka 75 yang dipaksakan dari mockup.

Validasi: build/TypeScript/lint lulus; 44 tes sintetis lulus. Browser menguji login salah/benar, CRUD katalog, penolakan CSV siswa, unduh template, pratinjau tanpa request tulis, konfirmasi satu POST katalog dan baca ulang, penguncian tombol selesai, serta unduh PDF fixture. Pagination 1/2/.../30 beserta aria-current dan permintaan halaman diuji. Tidak ada exception JavaScript. Seluruh operasi tulis pengujian agen tetap pada BE sintetis, tanpa mengubah database sekolah. Pengguna mengizinkan commit/push ke b4 setelah pemeriksaan.

## Rekomendasi admin: pratinjau baca saja — 4 November 2026

Sesuai instruksi tidak mengubah data BE, tahap ini hanya menyambungkan pencarian siswa dan pratinjau. FE `GET /api/b4/students` membaca `/siswa`; FE `GET /api/b4/recommendations/{siswa_id}/preview?target_jenjang=SMA|Kuliah` membaca endpoint preview BE. Tidak ada proxy untuk generate, review, edit, hapus, sembunyikan atau publikasi pada tahap ini. Tombol Generate dan Publikasi di sesi BE dinonaktifkan. GET preview tidak membuat draft dan, menurut kontrak BE, tidak memanggil Gemini.

Struktur asli dicocokkan melalui sesi admin: daftar siswa membungkus paginator dalam `data`; preview mengirim `data.target_jenjang`, `pemeringkatan_ml`, dan `kandidat[].beasiswa/evaluasi`. Kandidat memuat skor, lengkap, memenuhi, checklist serta metadata kemiripan teks. FE hanya memproyeksikan field yang diperlukan; NISN, keluarga, email, catatan siswa, model_hash, jumlah fitur dan object mentah tidak diteruskan. Teks dirender sebagai teks biasa.

- Pilihan siswa berasal dari master BE dengan pencarian, angkatan dan pagination 20, tanpa profil Nadia/Bagas contoh pada sesi staff.
- Preview ditandai sebagai pratinjau, bukan draft/publikasi. Status publikasi tidak ditebak karena endpoint ini tidak membacanya.
- Lengkap false/null berarti belum dapat dinilai lengkap, bukan otomatis tidak memenuhi. Memenuhi true/false baru dilabeli sebagai hasil akhir kriteria ketika lengkap true.
- Skor kecocokan 0–100 dan kemiripan teks 0–1 ditampilkan terpisah; null tidak menjadi nol dan keduanya bukan peluang lolos. Urutan dari BE dipertahankan.
- Mengganti siswa atau jenjang membatalkan pembacaan lama dan menyembunyikan hasil sebelumnya. Respons dengan target jenjang berbeda ditolak. Kandidat kosong tetap kosong, tanpa contoh pengganti.
- `401` membersihkan sesi; akses siswa ditolak; ID/query invalid dan respons cacat tidak menghasilkan kartu sukses.

**Bukti asli:** pemeriksaan browser melalui sesi admin lulus untuk satu siswa dan satu kandidat. Receipt aman: projectionMatches=true, candidates=1, studentSelected=true, content=true, writeActionsDisabled=true, passed=true. Pembandingan mencakup kandidat, skor, kelengkapan/hasil evaluasi, kemiripan teks, jumlah checklist dan tombol tulis nonaktif. Tidak ada nilai identitas/nominal/token disimpan pada receipt. POST pemeriksaan hanya menyimpan boolean/jumlah pada FE lokal; seluruh request ke BE asli berupa GET. Endpoint pemeriksaan sementara dihapus setelah receipt diterima.

**Validasi teknis:** 39 tes sintetis lulus. Browser sintetis memeriksa pencarian/reset, pilihan siswa, skor 0, data belum lengkap, similarity null, jenjang kosong, pergantian siswa, dan lebar ponsel; nol request tulis ke API B4 dan tidak ada exception JavaScript. Build/TypeScript/lint lulus. Generate/review/publikasi belum terintegrasi atau diuji pada BE; perlu tahap tulis terpisah yang disepakati, dengan record uji yang jelas.

## Analitik beasiswa — 4 November 2026

Pemeriksaan tampilan pada sesi admin asli menampilkan **Lulus**, dikonfirmasi pengguna. Halaman pemeriksaan membandingkan 13 nilai: total alumni, KIP-K, penerima unik jika tersedia, serta masing-masing lima statistik UKT/IPK; juga jumlah elemen grafik/distribusi/rentang/periode. Nilai pembanding diambil langsung dari kedua endpoint BE. Berkas hasil lokal tidak diterima agen, sehingga hasil ini dicatat sebagai konfirmasi pengguna atas hasil pemeriksaan browser, bukan receipt otomatis yang dibaca agen. Setelah konfirmasi, endpoint pemeriksaan sementara dihapus. Sampel nyata berisi array agregat kosong dan statistik nullable; varian berisi data nonkosong tetap hanya teruji melalui fixture sintetis.

Sesi staff pada halaman analitik menggunakan `GET /api/b4/analytics`, yang membaca dua endpoint BE: `/analitik-beasiswa` dan `/dashboard/ukt-ipk`. Semua request ke BE adalah GET, Bearer tetap di server melalui cookie HttpOnly, respons tidak di-cache, dan browser tidak diberi payload mentah atau token.

Pencocokan struktur asli menemukan ringkasan `jumlah_alumni_tercatat`, `jumlah_penerima_kipk`, `distribusi_beasiswa`, `per_angkatan`, `tren_periode`, serta dashboard `jumlah_alumni`, `ukt`, `ipk`, `per_kampus_prodi`, `tren_ipk`. Pada sampel pemeriksaan, array agregat tersebut kosong dan min/maks/rata-rata UKT/IPK null. FE menampilkan keadaan tersebut, tanpa mengisi dataset contoh. Angka ringkasan tetap diambil dari BE, bukan dihitung dari jumlah profil master atau dari nilai desain.

- Filter FE: angkatan (tahun lulus), prodi, beasiswa_id, periode. Dashboard menerima pemetaan tahun_lulus/program_studi untuk angkatan/prodi. Nilai pilihan beasiswa berasal dari pencarian katalog, bukan ID contoh. Filter kampus belum dipasang karena kontrak analitik umum yang diberikan belum menjamin filter itu; UI hanya menawarkan filter bersama kedua endpoint.
- Jumlah penerima beasiswa unik belum dikirim oleh respons asli. Kartu tersebut menampilkan Belum tersedia. Menjumlah distribusi tidak sah sebagai pengganti karena satu alumni dapat memiliki beberapa program.
- Min/maks/rata-rata null adalah Belum tercatat. Angka nol yang benar-benar dikirim tetap nol. Rentang golongan UKT dan populasi IPK tidak dikarang dari statistik ringkas.
- Distribusi IPK dan keberlanjutan menurut rentang IPK belum tersedia pada struktur BE ini. Panel menjelaskan ketidaktersediaannya, bukan menampilkan grafik contoh.
- Tren per periode mempertahankan jumlah alumni dan status proses/diterima/ditolak masing-masing program. Tidak diubah menjadi peluang lolos atau jumlah penerima unik.
- Gagal koneksi, sesi berakhir, akses ditolak dan struktur cacat menjadi pesan yang jelas. Hasil lama disembunyikan ketika filter berubah/gagal; tidak berpindah ke data demo pada sesi staff.

Validasi sementara: build/TypeScript/lint lulus; 32 tes sintetis lulus, termasuk null vs 0, nilai decimal string, proyeksi privasi, status tren dan pemetaan query kedua endpoint. Browser sintetis memeriksa angka API, filter, reset, kegagalan BE tanpa fallback contoh, serta lebar ponsel. Cabang agregat nonkosong dicoba dengan fixture sintetis; respons asli nonkosong belum tersedia untuk dicocokkan. Perbandingan angka halaman dengan snapshot BE asli dilakukan terpisah melalui pemeriksaan browser admin.

## Pencocokan respons asli — 4 November 2026

Verifikasi alur browser asli setelah perbaikan sudah lulus untuk sampel pertama: proyeksi respons cocok, tautan daftar menuju siswa yang dipilih, jumlah satu kejadian tetap satu di tampilan, dan label/waktu sesuai BE. Hasil direkam hanya sebagai boolean/jumlah (`passed: true`), tanpa menyalin nilai data sekolah. Endpoint pemeriksaan lokal sementara dihapus setelah hasil berhasil diterima. Ini tidak memperluas klaim menjadi uji seluruh alumni/seluruh varian progres.

Respons asli BE dibaca melalui sesi admin pengguna dengan GET saja. Agen menerima struktur nama field dan tipe, tanpa nilai identitas, kontak, NISN, token atau nominal. Daftar menggunakan paginator Laravel tingkat atas, relasi `siswa.nama_lengkap`, `siswa_id` serta `perguruan_tinggi.nama_pt`; proyeksi daftar yang ada sudah cocok dengan sampel asli.

Timeline asli berbentuk `{data:[{study_tracer_id,events:[{type,date,year,label,granularity}]}]}`. Implementasi terdahulu keliru memperlakukan kelompok sebagai kejadian, sehingga pemeriksaan struktur dapat terlihat sukses sementara rincian/tahun hilang. Adapter kini membuka `events` pada setiap kelompok, mempertahankan identitas unik kejadian antar penerimaan, memakai label BE, dan membaca `year`. `granularity: year` tidak diberi tanggal buatan. Bentuk kelompok tanpa array events yang valid ditolak alih-alih ditampilkan sebagai riwayat kosong generik.

Uji regresi diperluas menjadi 26 kasus lulus; fixture memakai struktur kelompok yang diamati dengan seluruh nilai sintetis. Browser memeriksa label/tahun, daftar → timeline berdasarkan siswa_id, rincian progres sintetis, editor katalog per ID, serta lebar ponsel; tidak ada exception JavaScript. Build produksi/TypeScript/lint lulus. Pemeriksaan asli hanya sampel penerimaan pertama dan riwayatnya; belum membuktikan semua varian data, seluruh alumni, atau operasi tulis progres BE.

## Pembaruan lanjutan 4 November — detail katalog dan baca alumni

Editor kini memakai `GET /api/b4/beasiswa/{id}` → `GET /api/beasiswa/{id}` sesuai kontrak terbaru. Nomor halaman/filter katalog tidak menentukan apakah detail dapat dibuka. Detail wajib memiliki kriteria lengkap sebelum PUT diizinkan. Aktifkan kembali juga membaca detail terbaru terlebih dahulu. Durasi integer berbentuk string seperti `"8"` kini dipetakan menjadi angka; nilai kosong/tidak valid tetap belum tercatat. Tanggal ISO dipotong menjadi YYYY-MM-DD tanpa perubahan zona waktu. Katalog menampilkan tanggal pasti di bawah tulisan periode bila tersedia.

Sesi staff pada daftar alumni dan timeline kini menggunakan jalur baca berikut:

- FE `GET /api/b4/alumni` → BE `GET /api/study-tracer` dengan pagination 20, search, program_studi, jalur_masuk, angkatan; route juga menerima perguruan_tinggi_id.
- FE `GET /api/b4/alumni/{siswa_id}/timeline` → BE `GET /api/alumni/{siswa_id}/timeline`.
- Link daftar memakai **siswa_id**, bukan ID penerimaan PT. Nama/kampus/prodi/status penerimaan ditampilkan dari hasil BE. Tabel menghitung penerimaan PT, bukan menganggap setiap baris sebagai alumni unik.
- Halaman detail admin dalam sesi BE memakai tampilan baca timeline, bukan formulir edit/impor lokal. Menulis progres belum dihubungkan. Halaman siswa tetap belum masuk cakupan integrasi ini dan tidak diarahkan ke endpoint admin.
- Data tidak diketahui tetap null/Belum tercatat. Riwayat yang hanya mempunyai tahun tidak diberi tanggal palsu. KIP-K tidak ditebak dari nama program; status beasiswa proses tidak diubah menjadi diterima.
- Proyeksi server tidak meneruskan NISN, WA, bukti, pivot atau object mentah. Token tetap pada cookie HttpOnly; 401 membersihkan sesi, 403/404 ditampilkan tanpa beralih ke data contoh. Request baca memakai no-store dan dapat dibatalkan ketika filter berubah.

**Batas verifikasi:** 25 tes sintetis lulus, termasuk detail katalog, ID siswa vs penerimaan, akses siswa ditolak, proyeksi privasi, tanggal/durasi, null serta respons tidak sesuai. Browser sintetis membuktikan daftar → timeline, editor langsung meski page=99, dan lebar ponsel. Build/TypeScript/lint lulus. Bentuk respons alumni/timeline server tujuan belum diberikan secara lengkap dan belum dibaca agen dengan sesi asli. Adapter menerima paginator Laravel tingkat atas/di dalam data; timeline array atau data.timeline/progress/progres/riwayat_progress. Jika respons nyata berbeda, tampilkan kesalahan kontrak untuk dicocokkan, bukan isi data contoh. Keberhasilan fixture bukan bukti integrasi server sekolah sudah lulus.

Pengguna akan memeriksa tanggal/durasi record yang sama lewat browser login. Agen tidak mengambil cookie sesi atau kredensial pengguna. Tidak ada operasi tulis ke BE sekolah, commit atau push pada langkah ini.

## Pembaruan 4 November 2026 — katalog dapat menulis ke BE

Tombol dan kolom katalog dikembalikan ke desain awal: Tambah Beasiswa, Durasi, Periode Apply, Edit, serta Arsipkan/Aktifkan. Kontrol draf lokal tidak dipakai pada sesi BE. Form API memakai nama, durasi/satuan, jenjang, bulan pendaftaran dan kriteria. Informasi tambahan dan pengaturan penilaian kriteria dibuka seperlunya.

Route FE `POST /api/b4/beasiswa`, `PUT /api/b4/beasiswa/{id}` dan `DELETE /api/b4/beasiswa/{id}` meneruskan ke endpoint BE yang sama dengan sesi HttpOnly. Endpoint DELETE mengarsipkan sesuai inventaris route dan panduan paket BE, bukan menghapus melalui SQL. Aktifkan memakai PUT dengan input lengkap yang dikirim katalog. Tidak ada perubahan source, database, migrasi, konfigurasi atau hak akses BE.

Implementasi awal membaca kriteria dari daftar katalog. Kontrak detail terbaru menggantikan cara tersebut seperti dijelaskan pada pembaruan lanjutan di atas. Jika kriteria lengkap tetap tidak tersedia pada detail, edit dihentikan agar tidak menimpa data dengan nilai contoh. Field opsional yang tidak dikirim BE tidak otomatis diubah menjadi null. Field finansial/identitas siswa tidak termasuk payload katalog.

Respons 422 diteruskan per field; 401 menghapus sesi, 403 menolak akses, dan 409 meminta muat ulang. Tombol kirim dikunci selama proses dan request tulis tidak diulang otomatis. Bila jaringan gagal atau respons sukses tidak sesuai kontrak, UI meminta pengguna memeriksa katalog sebelum mencoba kembali, karena operasi mungkin sudah tersimpan.

Pilihan tipe/operator baru dibatasi contoh yang sudah terdokumentasi (`nilai_tka` dan `>=`), tanpa otomatis mengubah teks persyaratan menjadi aturan numerik. Pengguna harus menentukan aturan bila mengisi kriteria. Kriteria dan operator lain yang sudah ada dari BE tetap dipertahankan ketika edit. Daftar enum lengkap masih perlu dikonfirmasi untuk menyediakan seluruh pilihan. Kriteria kosong dikirim sebagai array kosong dan server menentukan validitasnya; FE tidak mengklaim program tersebut sudah layak direkomendasikan.

Build Webpack, TypeScript, ESLint dan 21 tes lokal lolos. Tes mencakup tambah/baca ulang/edit/arsip/aktifkan pada server sintetis lokal, validasi field, sesi, izin, origin, whitelist dan respons yang tidak sesuai. Login admin dan hasil katalog kosong pada BE nyata dilaporkan pengguna; penulisan katalog dengan sesi pengguna belum dilakukan oleh agen. Pemeriksaan browser otomatis terbaru terhenti karena alat tidak dapat memastikan URL. Bagian dokumen di bawah mencatat tahap persiapan sebelumnya dan tidak menggantikan status terbaru ini.

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
# Penyesuaian status katalog — 4 November 2026

Katalog API kini menampilkan Status Program dan Status Pendaftaran secara terpisah. `status_program` dibaca dari BE, dengan fallback `is_active` untuk server lama. Lima nilai `status_pendaftaran` dipetakan sesuai kontrak BE; field hilang/tidak dikenal ditampilkan sebagai Jadwal belum ditentukan. FE tidak menghitung status berdasarkan jam laptop, tanggal, atau tulisan bulan.

Field status hasil perhitungan tidak dimasukkan ke DTO POST/PUT. Tanggal ISO dari BE tetap dipotong menjadi YYYY-MM-DD tanpa konversi zona waktu. Form menolak tanggal tutup sebelum tanggal buka; kedua tanggal dapat diisi pada Informasi tambahan. BE tetap berwenang memvalidasi dan menghitung jadwal WIB.

Verifikasi: build produksi, TypeScript dan lint file terkait lulus; 22 tes otomatis dengan BE sintetis lulus. Browser sintetis membuktikan program Aktif dapat memiliki pendaftaran Ditutup, dua kolom tidak melebarkan dokumen ponsel, dan tanggal terbalik ditolak. Tidak ada penulisan ke database sekolah atau push. Pembaruan ini belum membuktikan versi BE tujuan sudah mengirim field baru, dan tidak menyelesaikan integrasi rekomendasi/chat.
