# Alur beasiswa siswa: informasi umum dan hasil personal

Halaman awal menampilkan katalog beasiswa aktif dengan desain kartu yang ada. Membuka katalog atau detail tidak menghitung kecocokan dan tidak memanggil Gemini. Rekomendasi personal hanya untuk siswa aktif SMA 8 dan dihitung setelah permintaan eksplisit siswa.

## Informasi umum

- `/siswa/rekomendasi-beasiswa`: daftar beasiswa umum; akses percakapan AI umum berada di bawah kartu.
- `/siswa/rekomendasi-beasiswa/catalog-{id}`: penyelenggara, deskripsi, persyaratan umum, periode, dan penerima yang tercatat. Tidak menampilkan skor atau evaluasi profil.
- Tombol percakapan pada detail menuju `/siswa/rekomendasi-beasiswa/chat?beasiswa={id}`. Pertanyaan membawa konteks program terpilih, termasuk ketika siswa belum pernah meminta rekomendasi.
- `GET /api/b4/student-scholarships?page=1` meneruskan katalog Laravel `GET /api/beasiswa-siswa`.
- `GET /api/b4/student-scholarships/{id}` meneruskan detail Laravel `GET /api/beasiswa-siswa/{id}`.
- Katalog diurutkan A–Z dan hanya memuat program aktif. Detail program arsip tidak tersedia.
- Referensi penerima dibatasi pada penerimaan perguruan tinggi yang cocok, keputusan bantuan yang sesuai, serta izin tampilan Jejak Alumni. Daftar dideduplikasi per siswa dan menampilkan maksimal 12 nama disertai jumlah dalam cakupan tersebut. Jumlah ini bukan pengganti total bantuan pada analitik sekolah. Kontak, NISN, nilai, dan keuangan tidak diteruskan.

## Hasil personal atas permintaan

- Pertanyaan informasi umum tidak otomatis menghasilkan skor. Pertanyaan seperti “Beasiswa apa yang cocok buat aku?” memulai perhitungan eksplisit menggunakan profil tersimpan.
- `POST /api/b4/recommendations/generate`: body `{}` atau `{ "target_jenjang": "SMA" }` / `{ "target_jenjang": "Kuliah" }`. Memakai cookie sesi dan pemeriksaan origin; tidak menerima ID siswa dari browser.
- Laravel: `POST /api/rekomendasi-beasiswa/saya/generate`. Ranking ML dan evaluasi kriteria dihitung, lalu snapshot disimpan. Penjelasan tersedia sesuai status layanan; tidak ada klaim skor sebagai peluang diterima.
- `GET /api/b4/rekomendasi?role=siswa` membaca snapshot Laravel `GET /api/rekomendasi-beasiswa/saya`. State: `not_started`, `ready`, `needs_update`; waktu Laravel `generated_at` dipetakan ke `generatedAt`.
- Hasil tersimpan dapat dibuka melalui `/siswa/rekomendasi-beasiswa?hasil=1`; detail hasil memakai ID personal `auto-*`, terpisah dari detail katalog `catalog-*`.
- GET tidak menghitung ulang atau memanggil Gemini. Perubahan sumber menghasilkan `needs_update`; perhitungan baru tetap memerlukan POST. Catatan Guru BK opsional, tanpa gerbang publikasi.
- Alasan kecocokan berada di bagian bawah detail hasil personal. Saat percakapan berasal dari detail katalog, konteks program terpilih tetap dipertahankan.
- Kegagalan layanan bukan hasil berhasil. Teks percakapan tidak mengubah profil secara otomatis.

## Penyimpanan dan akses

`student_scholarship_results` menyimpan satu snapshot per siswa, FK ke siswa, fingerprint sumber, target, dan waktu perhitungan. RLS membatasi akses ke role backend `eightracer_runtime`; `anon` dan `authenticated` tidak memperoleh akses langsung. Pemilik hasil ditentukan dari akun login Laravel.

Migrasi hasil telah diterapkan pada staging melalui akun migrasi terpisah. Perubahan alur katalog ini tidak membutuhkan migrasi baru dan tidak mengubah data sekolah.