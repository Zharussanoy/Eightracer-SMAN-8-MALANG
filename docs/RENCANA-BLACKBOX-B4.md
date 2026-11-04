# Rencana black-box dan demo B4

Jadwal pada pengumuman: Rabu, 4 November 2026, pukul 12.25–12.45 WIB, ruang F5.8. Kelompok siap pukul 12.20. Dokumen ini merupakan rencana pemeriksaan, bukan klaim seluruh skenario sudah lulus.

## Kesiapan yang diketahui

- Login lokal dan endpoint publik FAQ BE merespons HTTP 200 pada pemeriksaan terakhir. Ini hanya bukti layanan tersedia, bukan bukti semua operasi privat berhasil.
- Pengguna melaporkan berhasil login admin dan melihat satu record katalog setelah logout/login. Screenshot menampilkan periode September–Oktober, status Aktif, dan durasi Belum tercatat. Penyimpanan serta respons field durasi perlu dicek ulang; jangan menyatakan semua field sudah teruji.
- Build, lint, TypeScript dan 21 tes dengan server sintetis lokal telah lolos. Pengujian tersebut terpisah dari uji langsung database sekolah.
- Login/sesi dan operasi katalog telah memiliki sambungan API. Riwayat sumber asli, alumni/progres, analitik, rekomendasi dan chat pada FE belum seluruhnya dihubungkan; sebagian masih memakai data contoh.
- Menurut audit BE yang diberikan, alamat yang dipakai FE menunjuk database utama. Membaca data sekolah memakai akun utama yang sesuai. Operasi tulis dicoba hanya pada record/data uji yang disepakati; pergantian akun tidak otomatis mengganti database.

## Persyaratan presentasi

1. Proposal proyek siap ditunjukkan dan dikumpulkan.
2. Use Case Diagram siap dibuka; nama aktor/use case konsisten dengan proposal dan skenario.
3. Demo hasil implementasi dapat dijalankan minimal di localhost.
4. Rencana test scenario untuk black-box siap ditunjukkan.
5. Form peer-assessment diisi setelah presentasi.
6. Setiap anggota mempelajari alur dan pembagian tugas karena presenter dipilih acak.

Proposal dan Use Case Diagram belum diverifikasi kelengkapannya dalam repo ini. Siapkan berkas final kelompok secara terpisah.

## Skenario fungsi yang sudah memiliki sambungan FE

Prasyarat: akun admin dan siswa uji yang terverifikasi, layanan BE/Tailscale aktif, tujuan database telah dipastikan, dan record uji yang boleh diubah. Gunakan nama program uji yang disetujui pemilik BE; hindari identitas sekolah pada bukti publik. Kolom hasil aktual/status diisi ketika pengujian nyata dilakukan, bukan disalin dari hasil fixture.

| ID | Skenario dan tindakan | Hasil yang diharapkan | Hasil aktual / status |
| --- | --- | --- | --- |
| BB-01 | Login admin dengan kredensial benar | Identitas/peran dari BE tampil dan layanan admin dapat diakses | Belum dicatat formal; pengguna melaporkan berhasil |
| BB-02 | Login sekali dengan kata sandi salah | Pesan gagal, tidak membuat sesi admin; jangan mengulang cepat hingga rate limit | Belum diuji langsung |
| BB-03 | Refresh halaman setelah login | Identitas dan sesi yang sama tetap dikenali | Belum dicatat formal |
| BB-04 | Muat katalog | Record dari BE tampil; jumlah sesuai respons server | Satu record terlihat pada screenshot; cocokkan ID/jumlah saat uji |
| BB-05 | Cari nama record yang ada, lalu kata yang tidak cocok | Daftar terfilter; pencarian tanpa hasil memberi pesan kosong | Belum diuji langsung |
| BB-06 | Filter jenjang SMA/Kuliah/Keduanya | Hasil sesuai aturan lintas jenjang BE; reset mengembalikan daftar | Belum diuji langsung |
| BB-07 | Pindah halaman sambil memakai filter, jika data >20 record | Filter tetap berlaku, nomor halaman/jumlah sesuai metadata BE | Belum diuji langsung; tidak dapat dicoba dengan satu record |
| BB-08 | Tambah satu program khusus uji dengan input valid, lalu refresh dan logout/login | Record tersimpan di BE dan tetap terbaca. Cocokkan nama, jenjang, durasi/satuan, periode dan kriteria | Record terlihat setelah login ulang menurut pengguna; seluruh field belum dicocokkan |
| BB-09 | Kosongkan nama atau masukkan kriteria tidak lengkap | Tidak mengklaim sukses; pesan validasi jelas dan isian dipertahankan | Belum diuji langsung |
| BB-10 | Edit satu field pada record uji lalu buka ulang | Hanya record dengan ID yang sama berubah; field lain dipertahankan | Belum diuji langsung |
| BB-11 | Arsipkan record uji, kemudian aktifkan kembali | Status program berubah sesuai respons BE dan tetap benar setelah refresh | Belum diuji langsung |
| BB-12 | Pakai periode September–Oktober pada program aktif | Status program mengikuti is_active; bukan otomatis status pendaftaran. Tanggal pendaftaran dinilai terpisah jika fitur itu tersedia | Aktif terlihat pada screenshot; sesuai pemetaan FE saat ini |
| BB-13 | Logout lalu coba akses data katalog privat | Sesi BE dicabut; API privat menolak tanpa sesi. Data demo tanpa login tidak dihitung sebagai keberhasilan akses BE | Belum diuji langsung |
| BB-14 | Login siswa dan coba endpoint katalog staff | Akses data katalog privat ditolak, tidak mendapat hak admin | Belum diuji langsung |

## Skenario use case B4 yang masih perlu integrasi FE

Daftar berikut tetap menjadi rencana pengujian. Jangan memberi label lulus sebelum FE tersambung dan hasil nyata diperiksa.

| ID | Use case | Hasil yang diharapkan | Kondisi FE saat persiapan |
| --- | --- | --- | --- |
| BB-15 | Riwayat KIP/beasiswa sumber asli oleh staf | Ringkasan/daftar dari endpoint sumber; 574 catatan tidak ditafsirkan sebagai 574 penerima; keputusan belum dikonfirmasi | Belum terhubung ke endpoint baru |
| BB-16 | Telusuri alumni dan timeline | Kampus/prodi/jalur/angkatan/riwayat dari record BE yang tepat; siswa hanya melihat data berizin | Masih memakai data contoh pada sebagian alur |
| BB-17 | Simpan/koreksi progres alumni | Progres tersimpan, koreksi mempertahankan versi lama; konflik tidak ditimpa paksa | Belum terhubung |
| BB-18 | Analitik beasiswa/UKT/IPK | Angka berasal dari API; nilai tidak diketahui ditampilkan sebagai belum tercatat, bukan nol | Grafik masih contoh; jangan gunakan sebagai angka sekolah |
| BB-19 | Generate, review dan publikasi rekomendasi | Draft ditinjau, hasil disetujui hanya terlihat oleh siswa pemilik; data tidak lengkap tidak dipaksa eligible | Masih simulasi FE |
| BB-20 | Chat beasiswa | Jawaban berasal dari endpoint, sumber dan fallback ditangani; jawaban tidak dianggap keputusan beasiswa final | Jawaban masih contoh |

## Urutan demo 20 menit

- Menit 0–3: masalah, tujuan, aktor, pembagian tugas dan proposal.
- Menit 3–5: Use Case Diagram dan alur utama yang akan didemokan.
- Menit 5–12: login → katalog → pencarian/filter → satu operasi record uji yang sudah diperiksa → refresh/baca ulang. Jangan pertama kali mencoba operasi berisiko ketika presentasi.
- Menit 12–15: tunjukkan data sekolah melalui alur baca yang sudah tersambung bila tersedia. Jelaskan batas catatan sumber, status program dan status penerima. Halaman yang masih contoh disebut sebagai hasil slicing/simulasi, bukan integrasi selesai.
- Menit 15–17: tunjukkan rencana black-box, hasil aktual yang telah dicatat, dan pekerjaan yang masih terbuka.
- Menit 17–20: pertanyaan dosen dan penjelasan pembagian pekerjaan FE/BE.

Sebelum masuk: pastikan jaringan, Tailscale, laptop BE dan layanan yang dibutuhkan tetap aktif; hindari login admin akun yang sama di Postman saat demo karena dapat mencabut sesi browser. Tutup tampilan password/token. Tidak perlu membuka database atau mengubah konfigurasi server saat presentasi.
