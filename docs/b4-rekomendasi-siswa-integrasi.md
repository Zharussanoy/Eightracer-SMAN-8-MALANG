# Persiapan integrasi rekomendasi siswa

Status terbaru: respons BE asli dan daftar siswa sudah diperiksa secara baca saja. BE mengirim satu kelompok target SMA, berstatus Terpublikasi, dengan array beasiswa kosong. Adapter kini mendukung kondisi kelompok kosong ini, bukan menganggapnya snapshot beasiswa tunggal. Tidak ada skor beasiswa yang dapat diverifikasi pada respons tersebut. Tidak push atau mengubah konfigurasi/database.

Status publikasi dibandingkan dengan nilai BE (normalisasi huruf besar/kecil), bukan disimpulkan dari jumlah hasil. Field persetujuan review terpisah tidak dikirim pada kelompok yang diperiksa; tidak mengklaim verifikasi review independen.

Daftar dan detail UI sudah diperiksa dengan BE asli: keduanya menunjukkan 1 hasil kelompok, 0 beasiswa, status Terpublikasi dan skor Belum tersedia. Koneksi sempat gagal di tengah pemeriksaan lalu pulih; detail akhirnya berhasil dibuka. Tidak ada generate/review atau perubahan data BE.

## Jalur

- Browser → GET `/api/b4/student-recommendations?page=N` → GET Laravel `/rekomendasi-beasiswa/saya?page=N`.
- Bearer hanya dibaca di server dari cookie HttpOnly; tidak ada siswa_id, role atau status_review dalam query dari browser.
- Backend tetap menentukan pemilik dan persetujuan hasil. Respons dibatasi field UI, tidak meneruskan objek mentah.
- Daftar/detail siswa tidak lagi mengimpor demoStore, profil contoh, evaluasi contoh, atau referensi alumni contoh.
- Detail membaca ulang halaman hasil disetujui yang ditunjuk tautan `?page=N`, lalu mencari ID rekomendasi. Tidak menciptakan endpoint detail BE. Jika hasil berpindah halaman/dicabut, pengguna diminta kembali ke daftar terbaru.
- Chat disiapkan memakai POST layanan melalui proxy dan tidak lagi memakai jawaban demo. Tautan detail hanya mengirim ID katalog jika beasiswa_id tersedia; tanpa ID membuka chat umum. Belum diverifikasi pada BE sekolah; lihat b4-chat-integrasi.md.

## Adapter yang masih harus dicocokkan

Kontrak tertulis menyebut paginator, snapshot `beasiswa`, `checklist`, `alasan`, `persiapan`, `skor_kecocokan`, dan `pemeringkatan_ml`. Struktur populated belum diterima. Adapter sementara menerima:

- Paginator Laravel langsung, wrapper data, atau resource data+meta.
- Format flat sebelumnya: setiap item memiliki id numerik positif dan objek beasiswa dengan nama_beasiswa; field opsional penyelenggara, jenjang, tipe_pendanaan, periode_apply. Format ini masih hanya terbukti pada fixture.
- Format kelompok asli: id, target_jenjang, tanggal_rekomendasi, status dan array beasiswa. Kelompok Terpublikasi dengan array kosong dipetakan ke groups tanpa skor/nama/alasan buatan. Struktur item di array beasiswa yang terisi belum tersedia; adapter menolak struktur terisi yang belum dicocokkan, bukan menebaknya.
- Skor 0–100 atau null; persiapan teks atau array teks; checklist berupa array kriteria/status/syarat.
- Jika status_review dikirim, wajib disetujui. Jika tidak dikirim, endpoint siswa yang terdokumentasi menjadi sumber pembatasan approval.

Nama/struktur yang berbeda **tidak ditebak**. Adapter akan gagal 502 dengan pesan struktur, bukan menyamarkannya menjadi daftar kosong atau mengisi angka contoh. Field opsional yang belum dikenal tidak ditampilkan sebagai fakta.

## Setelah koneksi pulih

1. Login siswa sungguhan. Buka `/api/b4/student-recommendations/contract-check` pada development localhost port 3000. Pemeriksaan hanya mengembalikan nama field/tipe/jumlah, tanpa nilai dan token; di production mengembalikan 404.
2. Cocokkan snapshot, checklist, persiapan, score, serta pagination terisi. Sesuaikan adapter berdasarkan bukti struktur BE.
3. Periksa list/detail, halaman berikutnya dan kembali ke halaman sebelumnya dengan akun siswa yang sama. Jangan generate/review atau mengubah data untuk mengisi layar.
4. Uji akun tanpa hasil disetujui, admin ditolak, sesi habis, 403, 429, 5xx, null dan skor nol. Jangan mencatat identitas atau respons mentah dalam bukti pengujian.
5. Baru tandai integrasi BE asli selesai setelah UI cocok dengan hasil akun tersebut. Tes fixture lokal bukan bukti koneksi BE sekolah.

Perubahan source dibagikan lewat Git setelah diizinkan. Perubahan data BE terbaca melalui request baru; perubahan bentuk kontrak tetap perlu koordinasi FE/BE. Tidak membutuhkan Supabase key atau akses tabel langsung.
