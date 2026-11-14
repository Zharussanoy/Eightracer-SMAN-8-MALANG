# Pengujian fungsional B4

14 November 2026: TypeScript tanpa emit lolos; 83 tes FE di luar fixture produksi lolos. Render statis memastikan empat program aktif tampil otomatis tanpa tombol publikasi admin. Tes ini bukan pengujian tulis menyeluruh pada database sekolah.

tests/b4-auth.test.mjs membutuhkan fixture server Next hasil build produksi dan belum dijalankan ulang karena keterbatasan disk. Jangan menganggap pengujian parser sebagai pengujian login browser menyeluruh.

## Skenario manual sebelum rilis

1. Login admin/siswa, refresh dan navigasi; akses role dibatasi, timeout tidak menyebabkan logout.
2. Cari/filter alumni, buka detail dan cocokkan ID penerimaan serta bantuan dengan sumber sekolah.
3. Tambah/koreksi/arsip progres dan pratinjau/commit impor memakai data uji yang diizinkan; jangan mengubah data asli untuk tes.
4. Tambah/edit/arsip/aktifkan katalog; aktif di atas arsip, nama terurut, status program dan pendaftaran berbeda.
5. Filter JSON/PDF konsisten; nol dan belum tersedia dibedakan; penerima unik tidak dijumlahkan dari distribusi program.
6. Admin harus mencari/memilih siswa sebelum melihat rekomendasi; generate ulang menampilkan hasil dan pesan sesuai respons.
7. Siswa hanya memperoleh hasil profil sendiri tanpa review BK; data belum diketahui tetap belum diketahui; kegagalan Gemini tidak mengarang hasil.
8. Desktop/ponsel: fokus pencarian satu bingkai, kartu dan teks konsisten, tidak terpotong, dialog dapat diakses dengan keyboard.

Benchmark ML dan AI dicatat dalam dokumentasi backend B4_VERIFIED_RECOMMENDATIONS.md. Ini bukan akurasi prediksi kelulusan.
