# Kontrak status katalog — BE

Aturan perhitungan tetap berada di backend. Field respons `status_program` dan `status_pendaftaran` bersifat hanya baca. Payload tulis menggunakan `is_active`, `tanggal_buka`, dan `tanggal_tutup`.

Aktif berarti program dikelola dalam katalog. Status pendaftaran dihitung dari tanggal lengkap menurut WIB: belum_dibuka, dibuka, ditutup, belum_ditentukan, atau tidak_tersedia. Keterangan bulan saja tidak dipakai untuk menebak tahun/tanggal.

Atas arahan pemilik proyek, kolom dan tampilan tambahan dari pekerjaan BE dibatalkan. Halaman memakai komponen katalog yang tersedia pada branch FE b4; penentuan desain dan penampilan status tambahan diserahkan kepada tim FE. Tidak ada halaman riwayat sekolah baru yang dipasang oleh BE.

Data riwayat sekolah tetap tersimpan di database dan tersedia pada API terotorisasi. Data ini tidak otomatis menjadi katalog program.
