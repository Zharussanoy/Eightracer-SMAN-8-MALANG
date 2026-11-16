# Pemeriksaan revisi visual B4 — 14 November 2026

Referensi: Figma `capstone baru` (984:12798) dan catatan revisi yang terlihat pada rekaman 13 November. Perubahan alur yang sudah diminta pengguna diprioritaskan ketika berbeda dari frame Figma.

## Hasil implementasi

- Analitik dan Ringkasan Pola tetap terpisah; timeline individu digabung langsung pada detail alumni yang dipilih, tanpa kartu profil ganda. Route lama dipertahankan untuk kompatibilitas.
- Gradient bersama memakai arah horizontal, #F5EDFF ke #D1C8F3; kuning #FCC850 dan latar #FEEEC9 dipertahankan.
- Breadcrumb dan caret akun memakai aset asli Figma dengan proporsi SVG dipertahankan.
- Tinggi metrik status, pembagian kartu profil admin, CTA kartu rekomendasi, dan pembungkusan judul panjang dirapikan.
- Tindakan hapus merah; hover, fokus keyboard, disabled, loading dan reduced-motion tetap tersedia.
- Form katalog memfokuskan kolom invalid pertama. Arsip dari editor memakai dialog yang konsisten dan bisa dibatalkan; tidak langsung menjalankan perubahan.
- Chat menampilkan tiga pertanyaan lanjutan setelah respons, menyesuaikan konteks program. Jawaban tidak dibuat sebelum request dan fallback faktual dibedakan dari AI generatif.

## Bukti pemeriksaan

Build produksi berhasil. Suite B4 sebelumnya 67/67 lulus; pemeriksaan ulang integrasi memakai backend sintetis lokal, bukan server sekolah. ESLint dan pemeriksaan whitespace dijalankan untuk file yang diubah.

Desktop diperiksa: daftar alumni admin, detail/timeline admin, Analitik, Ringkasan Pola, katalog dan form tambah; dilanjutkan daftar/detail Jejak Alumni siswa, progres kuliah, daftar/detail rekomendasi siswa, chat serta dialog arsip editor.

Ponsel 390px diperiksa: detail rekomendasi, chat, form edit katalog. Ketiganya tidak menghasilkan overflow halaman; menu seluler terbuka dan tertutup dengan Escape. Tabel dan navigasi tab tetap dapat digeser di wadahnya.

Validasi kosong mengarahkan fokus ke Nama Beasiswa. Dialog arsip dibuka lalu dibatalkan tanpa menyimpan. Skor sintetis 0 tetap tampil 0/100; field kosong tidak diganti data contoh. Aset terlihat pada screenshot termuat; pemeriksaan DOM editor ponsel mencatat satu gambar tanpa naturalWidth, sehingga tidak diklaim seluruh aset pada seluruh state telah tervalidasi.

Screenshot lokal sintetis disimpan di `.next/b4-final/` (diabaikan Git). Build berikutnya dapat menghapus folder tersebut.

## Batas yang masih perlu BE

- Generate/review/publikasi rekomendasi sekolah belum diaktifkan sebagai operasi tulis; status persetujuan tidak dilewati.
- Respons kelompok rekomendasi siswa yang berisi item masih perlu dicocokkan dengan BE asli. Struktur kelompok kosong sudah didukung.
- Impor yang tersedia adalah CSV penambahan katalog; XLSX dan upsert massal belum diimplementasikan.
- Tidak menguji provider AI, impor, publikasi, atau perubahan data sekolah selama audit visual ini.

Tidak ada data siswa/alumni atau konfigurasi BE yang diubah. Setelah audit, pengguna mengizinkan push revisi FE ke branch b4.

Penggabungan timeline ke detail diuji ulang lewat daftar alumni: halaman detail memuat perjalanan SMA, semester kuliah dan detail semester; hanya satu kartu profil, tanpa tombol ke halaman timeline terpisah. Build, lint dan 32 tes integrasi ulang lulus.

## Sinkronisasi rekan sebelum push

Push pertama ditolak karena origin/b4 telah diperbarui sampai 1dba6ac. Pembaruan itu digabung tanpa force push. Bagian batas BE di atas merekam keadaan sebelum sinkronisasi, bukan status implementasi terbaru: rekan telah menambahkan Simpan/Generate rekomendasi, hasil otomatis siswa, kontrol progres serta pratinjau/commit impor progres.

Timeline dipasang pula pada AdminAlumniDetailPage terbaru memakai proyeksi timeline berizin, dan tab global Timeline dihapus. Pertanyaan lanjutan chat diterapkan pada ScholarshipChatApi yang sekarang aktif. Build gabungan dan 122 tes lokal lulus. Belum melakukan uji operasi tulis atau provider di BE sekolah; keberhasilan kode/tes lokal bukan bukti layanan tersebut sudah lulus di server tujuan.

## Koreksi berdasarkan tiga screenshot revisi

Sinkronisasi progres sempat terbawa kembali saat penggabungan update rekan. Bagian itu kini dihapus sepenuhnya dari detail alumni, termasuk handler impor dan dialog tersembunyi. Form progres manual serta riwayat dipertahankan. Tiga kriteria diperiksa bersama: tidak ada tab global Timeline, timeline tampil langsung pada detail alumni terpilih, dan tidak ada sinkronisasi spreadsheet pada detail. API impor di server tidak dihapus; halaman ini tidak lagi memanggilnya.

Koreksi 15 November: tautan Lihat & Kelola progres disembunyikan hanya saat timeline berada di detail yang sama; route lama tetap dapat menuju detail. Verifikasi browser dengan data sintetis: tab Timeline=false, timeline di detail=true, sinkronisasi=false, input file=0, tautan kelola berulang=false. Build dan lint lulus; 123 tes lokal lulus. Tidak menekan Simpan atau mengarsipkan data sekolah.

Sebelum push koreksi, update rekan sampai 3cca845 digabung. Penghapusan sinkronisasi dan mode timeline embedded tetap dipertahankan. Build gabungan serta 142 tes lokal lulus.

## Koreksi rekomendasi setelah audit lanjutan

Detail hasil rekomendasi personal siswa memakai satu kolom pada desktop maupun layar kecil: informasi program, evaluasi, referensi alumni, ajakan percakapan; alasan tetap di akhir. Tombol Edit kandidat admin memakai penekanan utama, Sembunyikan netral, Hapus merah. Izin dan syarat aktivasi tombol tidak berubah. Pemeriksaan browser sintetis membuktikan satu kolom dan tanpa overflow; tes render memeriksa urutan bagian, skor nol dan penekanan tombol. Build, lint dan 144 tes lokal lulus. Tidak memanggil BE sekolah atau mengubah data.


## Audit lanjutan 16 November 2026

Pemeriksaan memakai server Next produksi dengan backend sintetis lokal terpisah. Tidak memakai akun sekolah atau mengirim operasi ke BE sekolah. Referensi: 15 frame halaman capstone baru dan catatan revisi rekaman; perubahan alur video diprioritaskan.

| Halaman | Yang diperiksa | Hasil / koreksi |
|---|---|---|
| Alumni admin | Daftar, detail, profil, riwayat, timeline | Ringkasan progres terbaru di samping profil; satu profil; timeline tetap embedded; sinkronisasi tidak ada. Breadcrumb memakai shell bersama setelah gabungan. |
| Katalog admin | Urutan semua record, nama panjang, status program/pendaftaran | Aktif A–Z lalu arsip A–Z; durasi tidak dipecah; muat ulang setelah perubahan kembali halaman pertama. |
| Tambah/edit | Isian kosong, fokus validasi, footer, dialog arsip | Validasi kosong diuji tanpa POST; arsip dibuka dan dibatalkan; tombol utama dan batal tetap jelas. |
| Impor katalog | Dialog dan panduan kolom | Dibuka tanpa mengunggah atau menyimpan. Pembaruan rekan membawa CSV/XLSX; format diuji secara lokal, bukan impor ke sekolah. |
| Analitik | Grafik terisi, distribusi, UKT nol, dropdown | Dipisah dari Ringkasan; deskripsi sesuai isi; nol tidak diganti null; jumlah kelompok tidak dianggap total alumni unik. |
| Ringkasan Pola | Kartu agregat dan pola periode | Data sintetis tampil sesuai respons; tidak mengisi sumber kosong dengan angka contoh produksi. |
| Rekomendasi admin sebelum gabungan | Pilih siswa, kandidat, kandidat tersembunyi, modal Edit | Pemilihan eksplisit dan Batal modal diperiksa tanpa menyimpan. |
| Rekomendasi admin terbaru | Katalog program lalu detail informasi/kriteria sebelum analisis | Ditemukan pemetaan ganda respons detail: proxy sudah mengembalikan ScholarshipRow, tetapi pembaca baru mengharapkan data mentah. Diganti memakai getScholarship; browser membuktikan status Dibuka dan kriteria tampil tanpa error. Ada tes regresi untuk ID salah/detail tidak lengkap. Analisis POST tidak dijalankan pada sekolah. |
| Jejak Alumni siswa | Daftar, detail penerimaan, progres dan UKT Rp0 | Revisi yang sempat kembali saat gabungan dipulihkan: tabel dan pilihan Data Masuk PT/Progres Kuliah di bawah. Dua tes render menjaga alur ini. |
| Beasiswa siswa | Katalog, detail umum, detail personal | Judul detail h2; detail personal tetap vertikal dan alasan paling akhir; waktu yang disarankan tidak dikarang dari tanggal buka. |
| Chat siswa | Awal, konteks program, pertanyaan eksplisit, balasan, pertanyaan lanjutan | Jawaban berasal dari fixture bertanda sintetis, bukan hasil AI sekolah; ikon asli Figma dipakai. Tidak menguji Gemini. |

Pemeriksaan layar kecil 390px: editor, detail alumni admin, progres siswa, detail rekomendasi personal dan chat; lebar dokumen sama dengan viewport, tanpa overflow halaman. Tabel/timeline dapat digeser dalam wadah. Screenshot yang berhasil disimpan di `.next/b4-full-audit/` dan tidak dipush. Satu pengambilan screenshot timeline tambahan macet pada alat browser; tidak dijadikan bukti lulus. Gambar SVG timeline ada dan tidak kosong; pemeriksaan naturalWidth pada gambar lazy di luar layar tidak dianggap sebagai bukti gambar rusak.

Saat hendak push, origin/b4 telah bertambah sampai 642a0b8. Pembaruan digabung tanpa force push. Perbaikan periode progres kosong, impor Excel dan halaman analisis program dari rekan dipertahankan. Kesalahan perbandingan array lintas konteks pada tes impor diperbaiki pada tes; validasi produksi tidak dilonggarkan.

Build produksi gabungan berhasil. Pemeriksaan lint file sumber yang diubah lulus. Seluruh tes lokal akhir dicatat saat push. Ini bukan sertifikasi seluruh fitur BE: koneksi lingkungan sekolah, analisis/generate, penyimpanan, impor dan provider AI tetap perlu uji terkoordinasi terpisah. Tidak ada data siswa/alumni, izin akun, atau konfigurasi BE yang diubah.
