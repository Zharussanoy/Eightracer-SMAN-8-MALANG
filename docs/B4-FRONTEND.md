# Frontend B4 — Alumni dan Beasiswa

Status integrasi 14 November 2026. FE berada pada branch b4; Laravel tetap menjadi API dan Supabase menjadi database Laravel.

## Halaman aktif

| Peran | URL | Fungsi |
| --- | --- | --- |
| Admin | /admin/alumni-perguruan-tinggi | Daftar penerimaan PT dan filter |
| Admin | /admin/alumni-perguruan-tinggi/informasi-detail?id={admission_id} | Detail penerimaan, progres dan impor |
| Admin | /admin/timeline-individu | Identitas dan progres yang tersedia |
| Admin | /admin/analitik-beasiswa | Agregat sekolah, statistik biaya, ekspor PDF |
| Admin | /admin/basis-data-beasiswa | CRUD, pencarian, arsip/aktifkan katalog |
| Admin | /admin/rekomendasi-beasiswa | Cari/pilih siswa, perhitungan dan riwayat |
| Siswa | /siswa/jejak-alumni | Data alumni yang diizinkan untuk siswa |
| Siswa | /siswa/rekomendasi-beasiswa | Perhitungan personal otomatis |
| Siswa | /siswa/rekomendasi-beasiswa/chat | Pertanyaan berdasarkan profil dan katalog |

ID penerimaan PT berbeda dari ID siswa. Gunakan ID dari API; jangan memilih profil pertama secara otomatis.

Browser memakai route /api/b4/* pada origin yang sama, dengan API_BASE_URL di server FE. Token tidak disimpan pada source. Role contoh bukan izin API. Hasil rekomendasi siswa tidak membutuhkan publikasi BK; izin Jejak Alumni merupakan aturan terpisah.

Katalog berisi KIP-K, Bebas IPI, TELADAN UIN, catatan Prestasi Basket UM dan ikatan dinas UPH. Status arsip mengikuti server. Kemiripan ML bukan peluang diterima; fakta belum diketahui tidak diganti perkiraan.

Rincian: INTEGRASI-API-B4.md, B4_AUTOMATIC_RECOMMENDATIONS.md dan B4_VISUAL_CONSISTENCY.md. Dokumen HASIL-UJI bertanggal lama adalah bukti historis, bukan pengujian ulang kode saat ini.
