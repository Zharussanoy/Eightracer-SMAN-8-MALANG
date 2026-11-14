# Sambungan riwayat beasiswa sekolah

Revisi 4 November 2026: tampilan tambahan Riwayat Sekolah dan tombol pemilihan katalog sudah dibatalkan atas arahan pemilik proyek. Halaman `/admin/basis-data-beasiswa` kembali memakai komponen katalog milik FE pada branch b4. Data sekolah dipertahankan di database dan API; rancangan penyajian data ditangani tim FE.

Riwayat sekolah membaca data asli melalui route FE `GET /api/b4/riwayat-beasiswa`. Route tersebut meneruskan cookie sesi HttpOnly sebagai bearer ke Laravel `GET /api/riwayat-beasiswa-sumber?include_summary=1`. Token, checksum impor, nomor kontak, dan relasi akun tidak dikirim ke tampilan. Pencarian dan filter dibatasi pada parameter yang diizinkan. Data pribadi tidak memakai cache bersama.

Konfigurasi laptop BE tetap `API_BASE_URL=http://127.0.0.1:8000/api`. Laptop FE dapat memakai base URL HTTPS Tailscale utama yang diberikan BE, tanpa `/b4-test`, untuk membaca arsip sekolah asli. Akun dan database sintetis tetap terpisah; tidak ada perpindahan database otomatis saat halaman dibuka.

Pada 4 November 2026, sambungan FE menerima 574 catatan, 573 terhubung profil, 522 terhubung penerimaan PT. Angka ringkasan dibaca dari server, tidak ditulis tetap di komponen. Tabel menampilkan nilai sumber, kategori, alumni, tahun lulus, kampus/prodi, lokasi sel sumber, dan kelengkapan hubungan. Riwayat ini bukan daftar 574 penerima atau 574 program beasiswa. Status keputusan tidak dibuat dari tanda KIP, kode, atau tanda minus.

Pencarian mencakup nilai sumber, nama alumni, kampus dan prodi. Filter tersedia untuk tahun 2024–2026 dan jenis catatan. Paginasi 20 baris per halaman. Catatan yang penerimaannya belum lengkap memakai kampus/prodi sumber dan diberi keterangan sesuai kondisi, tanpa menebak keputusan beasiswa.

Verifikasi lokal:

- 14 pemeriksaan HTTP FE→BE berhasil, termasuk 574 catatan, filter tahun 2025 (252), referensi beasiswa (3), pencarian TELADAN (1), TPKS (5), paginasi, hasil kosong, validasi, penolakan siswa/tamu, dan penolakan metode tulis.
- 4 tes parser/proyeksi FE lulus; TypeScript dan ESLint pada file yang berubah lulus.
- Suite backend: 130 tes, 920 assertions, tanpa kegagalan, satu tes XLSX lama dilewati karena keterbatasan pemeriksaan berkas Windows.
- Pemeriksaan visual otomatis belum berhasil: alat browser tidak bisa memulai sesi. Tidak ada klaim screenshot atau interaksi browser yang berhasil diuji. Halaman HTTP memberi 200; produksi belum dibangun ulang.

Bagian pemeriksaan di atas merupakan bukti pengujian sambungan API pada versi sebelumnya, bukan pernyataan bahwa tabel riwayat tambahan masih dipasang. Akun siswa tetap tidak mendapat akses arsip admin.
