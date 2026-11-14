# Rekomendasi Beasiswa Otomatis

`GET /api/rekomendasi-beasiswa/saya` menghitung hasil untuk profil yang terhubung dengan akun siswa yang sedang masuk. Tidak menerima penggantian `siswa_id`, tidak memerlukan draf admin, persetujuan Guru BK, atau publikasi rekomendasi.

Respons Laravel: `{ automatic: true, data: { target_jenjang, kandidat, llm_used, pemeringkatan_ml } }`. Setiap kandidat memuat `beasiswa_id`, informasi katalog, evaluasi kriteria, alasan, dan persiapan. Profil serta fingerprint internal tidak dikirim ke klien.

FE menggunakan proxy `GET /api/b4/rekomendasi?role=siswa`. Kunci detail otomatis berbentuk `auto-SMA-<id>` atau `auto-Kuliah-<id>`. Jangan menganggap kunci tersebut sebagai ID riwayat rekomendasi tersimpan.

Kriteria tetap dihitung oleh server. TF-IDF/cosine mengurutkan alternatif yang memenuhi kriteria jika data minat dan isi katalog cukup. Jika tidak cukup, mesin memakai urutan kriteria yang deterministik. Gemini menjelaskan hasil dan tidak menentukan skor atau kelulusan.

Penjelasan Gemini disimpan sementara selama 15 menit berdasarkan fingerprint profil dan katalog. Jika penyedia gagal, hasil kriteria/ranking tetap dikembalikan dengan penjelasan dasar, `llm_used: false`, dan percobaan ulang setelah 60 detik. Perubahan profil atau katalog langsung memicu perhitungan baru.

Program dengan data belum lengkap tetap terlihat dengan status belum diketahui. Program nonaktif atau kedaluwarsa dikeluarkan. Hasil bukan keputusan penerimaan beasiswa.

Riwayat/edit/review admin lama dipertahankan untuk kompatibilitas dan pencatatan; tidak menentukan akses siswa ke hasil otomatis. Aturan publikasi data pribadi alumni pada Jejak Alumni tetap terpisah.

## Simpan rekomendasi dan catatan BK (14 November 2026)

- Admin/Guru BK mencari dan memilih nama siswa terlebih dahulu. Halaman tidak memilih profil pertama secara otomatis.
- Tombol **Simpan** memanggil `POST /api/b4/recommendations/{siswaId}/save`, diteruskan ke Laravel `POST /api/siswa/{siswa}/rekomendasi-beasiswa/save` dengan `{ "target_jenjang": "SMA" }` atau `Kuliah`.
- Server menghitung ulang kriteria dan pemeringkatan dari sumber terkini. Respons 200 berisi snapshot tersimpan, `meta.saved: true`, `meta.requires_review: false`.
- Penyimpanan tidak memanggil Gemini. Pengulangan dengan sumber sama menggunakan catatan terakhir, mempertahankan edit opsional dan tidak menggandakan catatan. Sumber berubah membuat riwayat baru.
- **Generate Ulang** tetap aksi terpisah untuk menghitung dan meminta penjelasan Gemini baru.
- Edit, sembunyikan, dan hapus mengelola catatan internal BK. Akses rekomendasi otomatis siswa tidak menunggu penyimpanan, peninjauan, atau publikasi BK.
- Tidak ada migrasi atau perubahan data siswa/alumni saat pemasangan kode ini. Login staf dan perlindungan kepemilikan tetap berlaku.
