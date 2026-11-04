# Alumni B4 — data sekolah

Halaman /admin/alumni-perguruan-tinggi dan detailnya sekarang memakai data asli melalui API. Struktur tabel, filter, panel detail dan CSS FE dipertahankan.

- Data saat pemasangan: 599 penerimaan, 576 alumni unik, 49 kampus terkait.
- Satu alumni dapat memiliki beberapa penerimaan. Link detail memakai ID penerimaan (study_tracer.id), bukan ID siswa.
- Nama, kampus, jenis kampus, prodi, jalur, tahun lulus, kelas dan progres dibaca dari relasi BE yang benar.
- IPK/UKT/IPI, status aktif kuliah, semester, serta keputusan KIP-K yang belum ada tetap kosong/belum diketahui. Form dan impor progres belum diaktifkan pada tahap alumni ini; tidak ada penyimpanan progres contoh di localStorage.
- Daftar/detil tidak melakukan fallback ke mockData/demoStore jika respons kosong atau koneksi gagal.
- Browser: GET /api/b4/alumni dan /api/b4/alumni/{id}. Cookie HttpOnly diteruskan server FE ke GET /api/alumni dan /api/alumni/{id} pada BE utama; token tidak dikirim kembali ke browser.
- Siswa dan tamu tidak mendapat arsip admin ini. Tampilan alumni siswa belum diubah pada tahap ini.

Filter yang diteruskan: search, perguruan_tinggi_id, program_studi, jalur_masuk, page. Adapter meminta per_page=8 dan include_filters=1. Pilihan kampus/prodi/jalur berasal dari data sekolah.

Tipe parser pada lib/b4-alumni.ts memetakan paginator BE menjadi data, currentPage, lastPage, perPage, total, filters. Field detail progress adalah array kosong bila belum ada riwayat. Angka nol tidak menggantikan data yang belum diketahui.

Verifikasi: lima tes parser, TypeScript/ESLint, dan 33 pemeriksaan HTTP FE→BE utama lulus. Pemeriksaan visual browser otomatis belum dilakukan. Modul timeline, katalog, rekomendasi dan UI lainnya tetap mengikuti pekerjaan FE sebelumnya.
