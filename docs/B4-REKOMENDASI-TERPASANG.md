# Rekomendasi beasiswa B4 - sambungan terpasang

Dikerjakan langsung di C:\eightracer. Tampilan admin mengikuti susunan AdminRecommendationsPage pada repo FE branch b4: empat filter, profil siswa dan status publikasi, tiga kartu kelengkapan, lalu kartu rekomendasi. StudentRecommendationsPage dan ScholarshipChatPage menjadi acuan kartu/detail siswa dan percakapan. CSS utama dan navbar FE dipertahankan.

Komponen tampilan RecommendationAdminView menerima data dan callback dari AdminRecommendationsApi. Sesi yang terautentikasi tidak menggunakan nama siswa, skor, referensi alumni, maupun jawaban contoh dari demoStore. Informasi yang belum tersedia tetap "-" atau belum diketahui.

## Penyelarasan UI 4 November 2026

- Pencarian nama, kelas, angkatan, dan publikasi memakai GET /api/b4/students. Daftar kelas dan angkatan berasal dari metadata BE, tanpa menambahkan kelas contoh.
- Filter FE publication=true/false diterjemahkan menjadi rekomendasi_published=1/0 pada GET /api/siswa. Status ini mengikuti batch terbaru per jenjang; batch terbaru yang masih draft menarik publikasi sebelumnya.
- Metadata filters.cohorts dan filters.classrooms mencakup pilihan global. Identitas NISN tidak diteruskan ke DTO browser; UI hanya menampilkan masker jika NISN tersimpan.
- Generate Ulang dan Publikasikan Ke Siswa tetap memakai endpoint yang sudah terpasang.
- Sembunyikan/Tampilkan, Edit, dan Hapus aktif untuk hasil yang sudah tersimpan sebagai draft. Dialog dan posisi tombol mengikuti komponen FE. Perubahan disimpan lewat API, bukan localStorage. Pratinjau belum tersimpan memerlukan Generate Ulang dahulu.
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

## CRUD dan sinkronisasi siswa

1. Create: Generate Ulang menyimpan batch dan detail melalui Gemini; tambah katalog tetap melalui form Tambah Beasiswa FE.
2. Read: admin membaca draft terbaru; siswa membaca hasil yang sudah ditinjau untuk profil yang terhubung ke akunnya.
3. Update: Edit mengubah alasan kecocokan dan waktu yang disarankan. Nama, katalog, skor, dan checklist bersifat read only di dialog.
4. Sembunyikan/Tampilkan menyimpan is_hidden. Hasil tersembunyi tidak diteruskan ke siswa.
5. Delete: Hapus menyimpan deleted_at; detail hilang dari daftar dan publikasi tetapi riwayat database dipertahankan.
6. Setiap perubahan menarik publikasi dan mengembalikan status pending. Publikasikan kembali setelah review; hanya kandidat tidak tersembunyi yang dinilai untuk kelayakan publikasi.
7. revision naik setiap kali hasil diubah atau ditinjau. PATCH/DELETE detail wajib membawa revision dan siswa_id; permintaan dari versi lama ditolak 409. Hanya batch terbaru yang boleh diubah/ditinjau.
8. UI daftar rekomendasi, detail, chat, serta Jejak Alumni siswa mengambil ulang data saat fokus/tab kembali terlihat dan setiap 20 detik ketika tab terlihat. Permintaan tidak memakai cache browser.
9. Daftar, detail, dan kartu chat memakai proyeksi publikasi siswa yang sama. Alasan dan waktu yang diedit admin dibaca kembali dari database.
10. Hak siswa tetap baca; endpoint pengelolaan hanya staff. Identitas siswa ditentukan dari sesi untuk pembacaan personal.

FE:
- PATCH /api/b4/recommendations/{siswa}/items/{detail}
- DELETE /api/b4/recommendations/{siswa}/items/{detail}

BE:
- PATCH /api/rekomendasi-beasiswa/{batch}/detail/{detail}
- DELETE /api/rekomendasi-beasiswa/{batch}/detail/{detail}

Contoh payload FE PATCH (ID hanya contoh format; gunakan ID respons server):
~~~json
{"recommendation_id":7,"revision":2,"reason":"Alasan hasil review sekolah.","timing":"Januari 2027"}
~~~
Visibilitas memakai hidden:true/false pada endpoint yang sama. DELETE cukup membawa recommendation_id dan revision. FE menyisipkan siswa_id dari path dan menerjemahkan reason/timing/hidden ke nama field BE. detail adalah ID detail rekomendasi, bukan ID katalog beasiswa.

Migration 2026_11_04_140000_add_recommendation_editor_fields sudah dijalankan di eightracer_db pada 4 November 2026. Kolom revision, is_hidden, waktu_disarankan, dan deleted_at telah diperiksa. Cadangan skema dan baris rekomendasi sebelum migration disimpan pada folder privat .local/sync-crud-20261104, tidak masuk Git.

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
- Hanya batch terbaru per target jenjang yang dapat tampil. Bila batch terbaru masih pending/ditolak, hasil lama tidak dimunculkan kembali sebagai pengganti.
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

- Suite backend: 182 tes (181 lulus, satu XLSX lama dilewati), 1460 assertions; tidak ada kegagalan. Mencakup siklus CRUD/publikasi ulang, isolasi siswa, penolakan edit skor, batch lama, dan konflik revision.
- 46 tes kontrak/form/proxy/sinkronisasi FE lulus; mencakup generate, review, publikasi ke siswa, pencegahan pertukaran ID, error provider, serta chat.
- TypeScript dan ESLint pada bagian yang disentuh diperiksa.
- Pemeriksaan HTTP server utama: 872 profil, tiga angkatan, belum ada kelas aktif maupun hasil terpublikasi. Filter angkatan dan publikasi sesuai isi DB; halaman admin/siswa/chat merespons 200. Dua kandidat katalog tetap belum lengkap.
- Render struktur admin dengan data nyata dan keadaan kosong diperiksa; tujuh aturan CSS utama cocok dengan referensi FE. Pengambilan tangkapan layar browser belum berhasil karena alat kendali browser gagal dimulai. Ini pemeriksaan struktur/CSS dan HTTP, bukan verifikasi visual di browser.
- Gemini diuji langsung dengan dua kandidat terdeidentifikasi dan responsnya lolos validasi. Uji ini tidak membuat draft pada database sekolah.
- Uji tulis/publikasi terisolasi dengan Gemini sungguhan juga berhasil: generate 201, review 200, dan pembacaan siswa 200; sebelum publikasi kosong, setelah publikasi satu hasil. Seluruh tabel berada pada SQLite :memory: dan hilang setelah proses selesai.
- Tes otomatis memakai SQLite in-memory dan HTTP fake. Tidak membuat data sintetis atau mengubah nilai siswa di database sekolah.

GEMINI_API_KEY tetap hanya di .env.

## Status data utama setelah pemasangan

- Ada 872 profil dan 599 penerimaan alumni. Seluruh 599 belum memiliki penanda izin publikasi ke siswa; Jejak Alumni siswa merespons 200 dengan total 0 sesuai aturan akses.
- Belum ada profil yang ditautkan ke akun siswa (user_id masih kosong), termasuk akun uji yang diminta terpisah dari data sekolah. Pembacaan rekomendasi personal akun uji merespons 404 "Akun belum terhubung dengan data siswa." Pemetaannya perlu dilakukan lewat provisioning akun resmi, bukan memilih siswa asli secara acak.
- Ada dua program katalog dan nol batch rekomendasi tersimpan. Tidak ada data siswa/rekomendasi sintetis ditambahkan ke database utama untuk mengisi tampilan.
- Uji mutasi penuh dilakukan di SQLite terisolasi. Pemeriksaan HTTP utama memastikan route baru tersedia, ID tidak ada menghasilkan 404 dan akses tulis siswa ditolak 403.
- Publikasi alumni memerlukan konfirmasi/referensi persetujuan sekolah; kolom persetujuan tidak diisi otomatis oleh proses sinkronisasi.
