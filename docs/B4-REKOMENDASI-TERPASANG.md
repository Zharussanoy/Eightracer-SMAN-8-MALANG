# Rekomendasi beasiswa B4 - sambungan terpasang

Dikerjakan langsung di C:\eightracer. Tampilan admin mengikuti susunan AdminRecommendationsPage pada repo FE branch b4: empat filter, profil siswa dan status publikasi, tiga kartu kelengkapan, lalu kartu rekomendasi. StudentRecommendationsPage dan ScholarshipChatPage menjadi acuan kartu/detail siswa dan percakapan. CSS utama dan navbar FE dipertahankan.

Komponen tampilan RecommendationAdminView menerima data dan callback dari AdminRecommendationsApi. Sesi yang terautentikasi tidak menggunakan nama siswa, skor, referensi alumni, maupun jawaban contoh dari demoStore. Informasi yang belum tersedia tetap "-" atau belum diketahui.

## Penyelarasan UI 4 November 2026

- Pencarian nama, kelas, angkatan, dan publikasi memakai GET /api/b4/students. Daftar kelas dan angkatan berasal dari metadata BE, tanpa menambahkan kelas contoh.
- Filter FE publication=true/false diterjemahkan menjadi rekomendasi_published=1/0 pada GET /api/siswa. Status ini berarti siswa mempunyai setidaknya satu hasil review yang disetujui; bukan status pendaftaran beasiswa.
- Metadata filters.cohorts dan filters.classrooms mencakup pilihan global. Identitas NISN tidak diteruskan ke DTO browser; UI hanya menampilkan masker jika NISN tersimpan.
- Generate Ulang dan Publikasikan Ke Siswa tetap memakai endpoint yang sudah terpasang.
- Sembunyikan, Edit, dan Hapus dipertahankan di posisi komponen FE tetapi masih dinonaktifkan. API perubahan per kandidat belum tersedia; tombol tersebut tidak melakukan perubahan semu di localStorage.
- Target jenjang SMA/Kuliah tetap memakai pilihan yang sudah ada pada komponen API FE.
- Struktur profil dan kartu kelengkapan tetap dirender ketika isian kosong. Nilai TKA, RIASEC, pendanaan, dan alumni pembanding tidak diisi dari data demo.
- Detail siswa mempertahankan kotak Referensi dari Jejak Alumni. Karena tidak ada identitas alumni pembanding individual dalam respons rekomendasi, isinya "-" dan tautannya menuju daftar Jejak Alumni.
- Kartu beasiswa pada chat hanya menautkan detail apabila program terdapat pada hasil yang sudah dipublikasikan untuk siswa tersebut.

## Alur admin

1. Buka /admin/rekomendasi-beasiswa dan pilih siswa dari data BE.
2. Tentukan target SMA atau Kuliah. Untuk profil dengan tahun lulus, pilihan awal Kuliah; pilihan tetap dapat diubah oleh staff.
3. Pratinjau membaca katalog aktif dan evaluasi nyata. Ini belum membuat draft atau memakai Gemini.
4. Generate membuat snapshot draft melalui Gemini. Skor dan checklist tetap berasal dari perhitungan BE. Tombol dikunci selama permintaan berjalan untuk menghindari klik ganda.
5. Hasil tersimpan dapat dimuat ulang. Publikasi hanya aktif jika semua data kriteria lengkap dan setidaknya satu program memenuhi syarat.
6. BE memeriksa ulang fingerprint sumber serta keterkaitan ID siswa sebelum publikasi. Perubahan data/katalog mengharuskan generate ulang.
7. Siswa membaca hasil miliknya yang disetujui; kandidat yang tidak memenuhi syarat atau program yang diarsipkan tidak masuk kartu rekomendasi siswa.

Jika koneksi putus saat generate, jangan otomatis mengulang POST. Muat ulang pratinjau untuk memeriksa apakah draft telah tersimpan.

## Endpoint FE -> BE

| FE | BE | Metode |
|---|---|---|
| /api/b4/students | /api/siswa | GET |
| /api/b4/recommendations/{siswa}/preview | /api/siswa/{siswa}/rekomendasi-beasiswa/preview | GET |
| /api/b4/recommendations/{siswa}/draft | /api/rekomendasi-beasiswa?siswa_id=...&target_jenjang=... | GET |
| /api/b4/recommendations/{siswa}/generate | /api/siswa/{siswa}/rekomendasi-beasiswa/generate | POST |
| /api/b4/recommendations/{siswa}/review | /api/rekomendasi-beasiswa/{rekomendasi}/review | POST -> PATCH |
| /api/b4/rekomendasi?role=siswa | /api/rekomendasi-beasiswa/saya | GET |
| /api/b4/recommendations/chat | /api/chat-beasiswa | POST |

BE juga menyediakan GET /api/rekomendasi-beasiswa/{id} untuk staff. Filter daftar BE yang didukung: siswa_id, target_jenjang, page.

Generate:
~~~json
{"target_jenjang":"Kuliah"}
~~~

Review melalui FE:
~~~json
{"recommendation_id":123,"status_review":"disetujui"}
~~~

Chat:
~~~json
{"message":"Apa syarat program ini?","beasiswa_id":1}
~~~

ID di atas hanya contoh format. Gunakan ID dari respons server. Chat menentukan identitas siswa dari sesi, bukan siswa_id kiriman browser.

## Siswa dan chat

- /siswa/rekomendasi-beasiswa menampilkan kartu dari hasil yang sudah disetujui untuk akun itu.
- /siswa/rekomendasi-beasiswa/{batch}-{beasiswa} membaca detail dari daftar milik akun yang sama.
- Satu batch terbaru per target jenjang dipakai pada kartu agar hasil lama tidak ditampilkan berulang.
- /siswa/rekomendasi-beasiswa/chat mengirim pertanyaan ke BE. Konteks program dari detail menggunakan ID katalog.
- Jika pertanyaan belum menunjuk program, BE meminta siswa menyebutkan salah satu program katalog.
- Chat menampilkan jawaban faktual ketika Gemini tidak digunakan; tidak mengaku memakai AI pada respons llm_used=false.
- Data yang belum tersedia tetap belum diketahui. Tidak membuat alumni pembanding atau probabilitas lolos.
- Token berada dalam cookie HttpOnly, diteruskan oleh server FE. Tidak disimpan ke localStorage atau dikembalikan dalam DTO.
- Hash sumber, catatan privat admin, dan data siswa lain tidak diteruskan ke proyeksi siswa.
- Permintaan mutasi memeriksa origin, tipe JSON, field yang diizinkan, ID dan batas ukuran.
- Error provider/server diproyeksikan menjadi pesan umum; detail internal tidak diteruskan.

## Data nyata yang masih membatasi hasil

Audit 4 November 2026 menemukan dua program aktif: Beasiswa Lotte dan beasiswa tanoto, masing-masing satu kriteria. Pratinjau sampel menghasilkan dua kandidat dengan kelengkapan false. Kriteria tersimpan memakai nilai TKA, sedangkan kolom nilai_tka seluruh profil masih kosong. Nilai rapor atau hasil asesmen tidak otomatis dianggap nilai TKA.

Akibatnya draft dapat disiapkan untuk ditinjau, namun tidak boleh dipublikasikan sebagai memenuhi syarat sebelum nilai yang diperlukan tersedia atau kriteria katalog diperbaiki berdasarkan ketentuan resmi. Nilai yang hilang tidak diganti angka contoh.

Akun siswa uji yang sejak awal dibuat tanpa data siswa asli masih belum terhubung ke profil. Responsnya 404 dengan pesan yang jelas; jangan hubungkan ke siswa sekolah secara acak. Gunakan pemetaan akun-profil yang sah agar rekomendasi personal dapat dibaca.

TF-IDF/cosine tetap menggunakan deskripsi katalog dan data minat nyata. Jika data tidak cukup, respons menyebut fallback; tidak membuat skor kemiripan palsu. Skor kecocokan kriteria bukan probabilitas diterima.

## Verifikasi

- Suite backend: 178 tes (177 lulus, satu XLSX lama dilewati), 1375 assertions; tidak ada kegagalan.
- 40 tes kontrak/form/proxy FE lulus; mencakup generate, review, publikasi ke siswa, pencegahan pertukaran ID, error provider, serta chat.
- TypeScript dan ESLint pada bagian yang disentuh diperiksa.
- Pemeriksaan HTTP server utama: 872 profil, tiga angkatan, belum ada kelas aktif maupun hasil terpublikasi. Filter angkatan dan publikasi sesuai isi DB; halaman admin/siswa/chat merespons 200. Dua kandidat katalog tetap belum lengkap.
- Render struktur admin dengan data nyata dan keadaan kosong diperiksa; tujuh aturan CSS utama cocok dengan referensi FE. Pengambilan tangkapan layar browser belum berhasil karena alat kendali browser gagal dimulai. Ini pemeriksaan struktur/CSS dan HTTP, bukan verifikasi visual di browser.
- Gemini diuji langsung dengan dua kandidat terdeidentifikasi dan responsnya lolos validasi. Uji ini tidak membuat draft pada database sekolah.
- Uji tulis/publikasi terisolasi dengan Gemini sungguhan juga berhasil: generate 201, review 200, dan pembacaan siswa 200; sebelum publikasi kosong, setelah publikasi satu hasil. Seluruh tabel berada pada SQLite :memory: dan hilang setelah proses selesai.
- Tes otomatis memakai SQLite in-memory dan HTTP fake. Tidak membuat data sintetis atau mengubah nilai siswa di database sekolah.

Tidak ada migration baru untuk sambungan ini. GEMINI_API_KEY tetap hanya di .env.
