# Audit sinkronisasi UI B4 — 14 November 2026

Audit dilakukan terhadap UI lokal pada branch b4 setelah merge origin/b4 (836fc70), tanpa mengubah data sekolah.

| Bagian | Sambungan yang diperiksa | Hasil |
|---|---|---|
| Alumni PT | Daftar ke detail berdasarkan ID penerimaan PT; ID siswa untuk timeline tetap terpisah | Tautan daftar lama diperbaiki agar tidak membuka record lain |
| Progres kuliah | Tambah/edit/arsip dan impor melalui proxy B4, validasi dan kepemilikan di Laravel | Tes BE editor dan bukti beasiswa lolos |
| Analitik dan Ringkasan Pola | API analitik sekolah, UKT/IPK, filter angkatan/prodi/beasiswa/periode | Filter dipertahankan di URL dan diteruskan antar-tab |
| Ekspor PDF | Filter yang sama dengan JSON analitik | Tes normalisasi filter lolos |
| Katalog | Kriteria dan tanggal dari BE; aktif/arsip A–Z sebelum pagination | Tes kontrak dan pengurutan lolos |
| Rekomendasi admin | Pilih siswa, preview, Simpan snapshot, Generate Ulang, edit catatan opsional | Tanpa gerbang publikasi BK; tes CRUD dan save lolos |
| Rekomendasi siswa | Perhitungan otomatis milik akun login | Tes isolasi akun, unknown criteria, dan proyeksi hasil lolos |
| Chat siswa | Konteks beasiswa/jenjang dari URL, jawaban faktual/prompt Gemini, poin dan bold aman | Tes kontrak dan format lolos |

Validasi: TypeScript tanpa error; 107 tes FE; 101 tes BE dengan 901 assertion pada SQLite in-memory. Dua belas route halaman lokal memberi HTTP 200 tanpa error kompilasi. API alumni, analitik, dan rekomendasi tanpa sesi memberi HTTP 401 JSON.

Batas verifikasi: HTTP 200 halaman tidak menggantikan pengujian interaksi browser setelah login. Suite FE yang memerlukan build produksi (b4-auth.test.mjs) tidak dijalankan dalam audit ini. Tidak ada uji panggilan Gemini berbayar/live atau operasi tulis ke database sekolah pada audit ini.
