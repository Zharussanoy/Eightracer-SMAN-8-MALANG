# Alumni B4 — sambungan data dan progres

Halaman /admin/alumni-perguruan-tinggi dan informasi-detail memakai data sekolah melalui API. Struktur FE dan CSS dipertahankan.

- 599 penerimaan / 576 alumni unik / 49 kampus terkait.
- ID detail adalah ID penerimaan; beberapa kampus milik satu alumni tidak dicampur.
- Jalur dari kategori sumber sekolah: Jalur Swasta (52), ADIK (5), UM PTKIN (6), Luar Negeri (1). Jalur spesifik lain tetap. Pilihan filter sama dengan nilai daftar/detail.
- IPK, UKT, IPI, semester dan status yang belum ada tampil -. Aktif hanya jika benar-benar tercatat aktif.
- Form Update Progress Kuliah menyimpan ke BE. Ikon pensil mengisi form untuk koreksi, ikon arsip mempertahankan sejarah.
- Sinkronkan Data membuka popup unggah XLSX/CSV (5MB/40baris). Unduh template → isi → Pratinjau → Simpan. Kesalahan ditampilkan per baris; seluruh batch harus valid.
- Kolom wajib: periode, semester, status_pendidikan, tanggal_update. Kolom opsional: ipk, kipk, ukt, ipi, beasiswa, status_beasiswa, nominal_beasiswa. IPI hanya Mandiri; beasiswa harus cocok dengan katalog.
- CSV menggunakan pemisah koma; XLSX/CSV dapat memakai format angka canonical atau Indonesia sesuai pilihan. Kolom kosong pada koreksi impor mempertahankan nilai sebelumnya. Edit manual dapat menyimpan null.
- Status pendidikan: aktif/cuti/lulus/nonaktif. Tanggal YYYY-MM-DD, bukan masa depan. KIP-K Ya/Tidak/1/0; IPK0–4.
- Form manual dapat memilih beberapa beasiswa yang diterima. Keputusan lain yang sudah tercatat dipertahankan.
- Impor memerlukan antivirus aktif. Batch terikat penerimaan/pengunggah, memakai digest dan validasi ulang sebelum simpan.
- Tidak ada progres contoh/localStorage atau fallback mock saat API kosong/gagal.
- Cookie HttpOnly tetap pada server FE; tamu dan siswa tidak dapat membuka arsip admin.

Browser memakai /api/b4/alumni; server FE meneruskan ke /api/alumni pada BE utama, dengan suffix:
GET /{id}, GET /{id}/progress-template,
POST /{id}/college-progress, PUT/DELETE /{id}/college-progress/{progress},
POST /{id}/progress-imports, POST /{id}/progress-imports/{batch}/commit.

GET detail mengembalikan progress (versi terkini) dan catalog_options. POST/PUT sukses mengembalikan ID/revisi, lalu halaman memuat ulang data server. Publikasi nominal/alumni mengikuti izin terpisah.

Validasi: 9 tes parser/form, TypeScript/ESLint dan pemeriksaan HTTP. Uji penulisan/impor memakai database uji terpisah; data sekolah tidak diisi progres buatan. Pemeriksaan visual browser otomatis belum dilakukan.
