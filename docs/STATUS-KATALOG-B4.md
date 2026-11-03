# Status program dan pendaftaran

Kolom katalog dipisahkan menjadi **Status Program** dan **Status Pendaftaran**. Aktif berarti program dikelola di katalog; bukan pernyataan bahwa pendaftaran sedang buka.

BE menghitung status jadwal menurut WIB dari tanggal penuh, termasuk tahun. FE memetakan `status_pendaftaran` ke label berikut: `belum_dibuka` → Belum dibuka, `dibuka` → Dibuka, `ditutup` → Ditutup, `belum_ditentukan` → Jadwal belum ditentukan, `tidak_tersedia` → Tidak tersedia.

Program aktif dengan tanggal 1 September–31 Oktober 2026 pada 4 November 2026 tampil **Aktif / Ditutup**. Jika hanya ada keterangan teks September–Oktober tanpa tanggal penuh, tampil **Aktif / Jadwal belum ditentukan**. Program yang diarsipkan tampil **Diarsipkan / Tidak tersedia**.

`status_program` dan `status_pendaftaran` adalah field respons BE; jangan ikut dikirim saat menyimpan. Payload tulis tetap memakai `is_active`, `tanggal_buka`, dan `tanggal_tutup`, bersama nama, jenjang, serta seluruh kriteria sesuai kontrak. Jangan mengubah Aktif menjadi Diarsipkan hanya karena periodenya selesai.

Status baru diterapkan pada katalog API. Draf yang masih berada di browser belum mendapat perhitungan BE; label pratinjau draf jangan dianggap hasil penentuan jadwal server. Riwayat beasiswa sekolah dan status penerima alumni tetap mempunyai makna terpisah.

Verifikasi: tujuh tes parser FE lulus; TypeScript/ESLint diperiksa. Suite backend 136 tes, 958 assertions, tidak ada kegagalan, satu tes XLSX lama dilewati. Tes tanggal meliputi batas buka/tutup WIB, bulan tanpa tanggal, tanggal sebagian, program diarsipkan, pengaktifan ulang jadwal lama, dan penolakan edit tanggal yang bertentangan.
