# Timeline Individu — data sekolah

Halaman /admin/timeline-individu kini mengambil daftar dengan /api/b4/alumni?timeline_complete=1, lalu detail /api/b4/alumni/{id}?timeline_complete=1. Server FE meneruskan ke BE; cookie/token tidak ditaruh di localStorage.

Kelengkapan minimal: identitas dan penerimaan PT diketahui, tanggal masuk SMA, waktu lulus SMA, waktu masuk PT, serta progres kuliah terbaru dengan periode/semester/status/tanggal/IPK/UKT/status KIP-K. Tahun saja boleh dipakai jika memang hanya itu yang diketahui. Beasiswa, IPI, NISN dan akun email tidak diwajibkan.

- UKT0 dan status bukan penerima adalah nilai sah.
- Tidak membuat tanggal dari tahun lulus, tidak menghitung tahun masuk SMA dengan asumsi tiga tahun, dan tidak membuat periode semester yang belum ada.
- Pilihan alumni/kampus/prodi/jalur hanya dari data yang memenuhi syarat.
- Beberapa penerimaan milik satu alumni tetap punya ID dan progres terpisah.
- Riwayat semester memakai progres yang tersimpan, bukan delapan semester contoh.
- Beasiswa ditampilkan sebagai diterima hanya jika status keputusan diterima tercatat.
- Tombol Kelola Progress menuju detail penerimaan yang sama.
- Hasil kosong, koneksi gagal dan sesi tidak sah ditampilkan terpisah.

Saat pemeriksaan database sekolah, belum ada alumni yang memenuhi syarat: waktu masuk SMA/PT dan progres perkuliahan belum tersimpan. Halaman menampilkan penjelasan tersebut; tidak mengisi profil contoh. Setelah data asli dilengkapi, alumni yang memenuhi syarat otomatis masuk daftar.

Tampilan memakai komponen/CSS FE yang sedang digunakan. Komponen timeline siswa tidak diubah dalam tahap ini. Tidak ada migrasi baru. Backend168 tes tanpa kegagalan (1 tes lama dilewati), 13 tes parser/form dan 13 pemeriksaan HTTP berhasil; TypeScript/ESLint lulus. Pemeriksaan visual browser otomatis belum dilakukan.
