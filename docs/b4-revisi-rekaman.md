# Revisi B4 dari rekaman 13 November 2026

Dasar: catatan revisi yang terlihat dalam rekaman 3 menit 7 detik. Tidak memuat isi percakapan pribadi, akun, kredensial, atau gambar rekaman.

## Dikerjakan pada tahap ini

- Timeline dihapus dari navigasi global: akses melalui detail alumni yang dipilih. Route lama tetap tersedia untuk kompatibilitas.
- Timeline individu tampil langsung pada detail alumni admin, di bawah riwayat progres, dengan cakupan penerimaan yang sama dan tanpa mengulang profil. Route timeline lama tetap tersedia untuk kompatibilitas.
- Pratinjau rekomendasi admin tidak memilih siswa otomatis ketika halaman pertama dibuka.
- Tombol detail rekomendasi siswa semuanya netral sebelum dihover/difokuskan; tombol pertanyaan pertama chat juga netral.
- Kartu beasiswa siswa memiliki pembatas judul dan penanda skor tertinggi dalam data contoh, tanpa klaim peluang lolos.
- Daftar Jejak Alumni siswa memakai tabel dan judul kolom dengan penulisan biasa, mengikuti struktur direktori admin. Data tetap dari endpoint publikasi siswa, tidak memakai endpoint staff.
- Pilihan Data Masuk PT/Progress Kuliah berada di bagian bawah detail siswa.
- Rekomendasi tersembunyi pada pratinjau admin diringkas, tidak sekadar dibuat transparan; item tidak dikirim ke tampilan siswa oleh penyaring publikasi yang sudah ada.
- Edit pada pratinjau admin menjadi tindakan utama; Hapus tetap tindakan merah.
- Chat memiliki sapaan ramah, bagian persyaratan berjudul dan bullet list; tidak memakai HTML mentah.
- ID konteks chat tidak dikenal tidak otomatis diganti dengan beasiswa lain.
- Unduhan CSV diberi garis bawah dan dialog memiliki tabel panduan kolom serta contoh. CSV sebenarnya sudah menyertakan satu baris contoh.
- Katalog contoh lokal diurutkan aktif dahulu lalu alfabetis, arsip sesudahnya.
- Rekomendasi admin memilih siswa secara eksplisit di daftar, bukan memilih hasil pencarian pertama otomatis. Ganti siswa mempertahankan pencarian pada daftar BE; pagination memakai tombol nomor yang sama dengan katalog.
- Pratinjau BE menampilkan identitas siswa, target jenjang, kandidat, skor, dan evaluasi tanpa membuat status kelengkapan atau alasan AI yang tidak dikirim server. Informasi pemeringkatan teknis dapat dibuka saat diperlukan.
- Muat ulang pratinjau memiliki status memuat dan menolak klik berulang; tindakan tulis nonaktif disertai penjelasan mode baca saja. Edit pratinjau lokal menjadi tombol utama, hapus memakai konfirmasi merah, dan form kosong tidak dapat disimpan.
- Detail rekomendasi siswa memiliki tombol kembali; daftar menjelaskan arti skor dan setiap tombol detail mempunyai nama beasiswa untuk aksesibilitas. Data contoh sudah dilepas dari jalur siswa yang memakai sesi BE.
- Tahap berikutnya: data contoh di daftar/detail rekomendasi siswa sudah dilepas; jalur GET hasil disetujui milik sesi dan adapter whitelist disiapkan. Belum dinyatakan selesai BE asli sampai snapshot terisi cocok dengan respons server. Lihat b4-rekomendasi-siswa-integrasi.md.

## Belum selesai / perlu keputusan dan dukungan BE

1. Selesai: dua route terpisah /admin/ringkasan-pola (kartu kuning dan pola per periode) serta /admin/analitik-beasiswa (grafik ungu, distribusi, UKT/IPK). Filter diteruskan saat berpindah tab; PDF tetap laporan agregat sekolah dengan filter yang sama. Akses tanpa sesi tidak menampilkan angka contoh.
2. Selesai di FE: seluruh halaman katalog sesuai pencarian/jenjang dibaca, lalu diurutkan Aktif A–Z dan Diarsipkan A–Z sebelum pagination tampilan. Setelah arsip/aktivasi berhasil, katalog dimuat ulang dari halaman pertama. Pembacaan dibatasi 1.000 record/50 halaman; katalog yang lebih besar perlu pengurutan server. Pembacaan gagal, duplikat atau pagination berubah menampilkan kesalahan, bukan daftar sebagian. Tidak menambahkan parameter API yang belum didukung.
3. Simpan lalu rekomendasi tampil kepada siswa: arah revisi sudah diminta pengguna. Kontrak saat ini tetap membutuhkan generate draft dan PATCH review disetujui; perlu penyelarasan BE. Tidak menghapus pemeriksaan izin/review atau mengklaim publikasi berhasil tanpa respons server. Operasi tulis rekomendasi belum diaktifkan.
4. Generate ulang: status loading, sukses dan gagal harus terikat request BE sungguhan. Generate pada akun sekolah masih dibatasi baca saja; jangan menampilkan toast sukses palsu.
5. Persiapan selesai: jawaban demo chat sudah dilepas. POST chat siswa hanya berjalan setelah pertanyaan eksplisit; konteks memakai ID katalog yang disediakan BE, history tidak dikirim. Label membedakan jawaban berbantuan AI/fallback faktual. Struktur ringkas, loading/error, kirim ulang dan cooldown disiapkan; belum diverifikasi pada BE/provider sekolah. Lihat b4-chat-integrasi.md.
6. Susunan detail rekomendasi sudah dibuat vertikal dan alasan kecocokan dipindah ke bagian akhir; sudah diperiksa pada desktop dan ponsel memakai respons sintetis lokal. Lihat b4-audit-visual-final.md.
7. Template Excel berformat tabel dan pembaruan massal: saat ini fitur hanya CSV penambahan katalog. Menambah format XLSX serta upsert bukan sekadar mendandani CSV, perlu validasi dan alur terpisah.
8. Pemeriksaan visual desktop dan ponsel telah dilanjutkan. Cakupan, hasil dan keterbatasan dicatat di b4-audit-visual-final.md; ini bukan klaim seluruh operasi BE sudah lulus.

## Batas data

Tidak mengubah siswa/alumni, izin, data produksi, atau kontrak server. Tidak melakukan impor sungguhan atau publikasi rekomendasi selama revisi ini. Tidak push.
