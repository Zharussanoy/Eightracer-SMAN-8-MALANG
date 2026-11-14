# Integrasi API B4

FE lokal: http://127.0.0.1:3000. Laravel lokal: http://127.0.0.1:8000/api. Set API_BASE_URL di environment server FE. FE tidak mengakses tabel Supabase langsung. Jangan kirim secret ke NEXT_PUBLIC_* atau Git.

## Route FE

| Route | Operasi |
| --- | --- |
| /api/b4/alumni | GET daftar dan filter penerimaan PT |
| /api/b4/alumni/{id} | GET detail sesuai ID penerimaan dari daftar |
| /api/b4/alumni/{id}/college-progress | POST progres |
| /api/b4/alumni/{id}/college-progress/{progress_id} | PUT koreksi, DELETE arsip |
| /api/b4/alumni/{id}/progress-template | GET template |
| /api/b4/alumni/{id}/progress-imports | POST berkas untuk pratinjau |
| /api/b4/alumni/{id}/progress-imports/{batch}/commit | POST dengan digest pratinjau |
| /api/b4/beasiswa | GET katalog; POST tambah |
| /api/b4/beasiswa/{id} | GET detail; PUT edit/aktifkan; DELETE arsip |
| /api/b4/analytics | GET agregat sekolah |
| /api/b4/analytics/options | GET pilihan filter |
| /api/b4/students | GET pencarian/paginasi siswa |
| /api/b4/recommendations/mine | GET hasil personal dari /rekomendasi-beasiswa/saya Laravel |

Payload dan validasi mengikuti route dan tipe lib/b4-*.ts. Adapter profile/timeline legacy dipertahankan untuk kompatibilitas.

## Ketentuan

- Pertahankan perbedaan null, nol dan false. Jangan menciptakan IPK, UKT atau keputusan beasiswa.
- ID penerimaan, siswa dan program berbeda; jangan menebak relasinya.
- Analitik sekolah dan snapshot UKT/IPK mempunyai cakupan yang berbeda. Distribusi program tidak dijumlahkan menjadi penerima unik.
- Pembatalan request lama dan timeout tidak menandakan sesi berakhir. Periksa sesi hanya pada respons autentikasi yang sesuai.
- Akun siswa disiapkan sekolah dan hasil personal hanya berasal dari profilnya sendiri.
- Rekomendasi siswa otomatis tanpa review BK. Riwayat editorial admin tidak menggantikan perhitungan.
- ML mengurutkan relevansi; mode eksplorasi tidak mengubah syarat belum diketahui menjadi terpenuhi. Penjelasan Gemini bukan keputusan penerimaan.
- Jangan commit .env.local, cookie, token, dump database, cache build atau dependensi. File contoh harus memakai placeholder.
