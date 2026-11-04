# Pendataan alumni B3

## Penyimpanan saat ini

Repository ini hanya berisi frontend Next.js. API eksternal telah digunakan untuk
membaca direktori, tetapi kode backend, schema database, dan kontrak endpoint
penulisan B3 tidak tersedia. Implementasi ini **belum menyimpan ke database/API**.

Data yang disubmit disimpan di localStorage dengan key per ID pengguna
`eightracer_pendataan_b3:<userId>`, dimuat kembali pada formulir dan direktori,
serta dapat diedit melalui modal direktori. Penyimpanan ini terbatas pada browser
dan perangkat yang sama. Menghapus penyimpanan browser menghapus salinan lokal.
Record API dan data alumni lama tidak dihapus atau ditulis ulang.

## Field dan validasi

`FormDataPendataan` menyertakan `kelas`, `nomorWa`, `jenisKampus`, `pilihanKe`,
`lembagaPenyalur`, `jalurLainnya`, `pelamarKipk`, `beasiswa`, dan
`beasiswaLainnya`, di samping seluruh field sebelumnya.

`lib/pendataan.ts` menyediakan opsi dropdown, normalisasi uppercase, pembersihan
nilai kondisional, dan validasi yang dipakai formulir B3 serta modal edit.
Nama perguruan tinggi dan program studi diberi petunjuk nama lengkap; tidak ada
batas panjang minimum yang menolak nama program resmi yang pendek.

Kelas, WhatsApp, jenis perguruan tinggi, dan pilihan ke wajib diisi.
Nama jalur/beasiswa lainnya wajib diisi hanya ketika memilih Lainnya.
Lembaga penyalur, pelamar KIP-K, beasiswa, dan skor UTBK boleh kosong.
Status pelamar KIP-K berdiri sendiri dari status penerima KIP-K.

## Integrasi backend yang masih diperlukan

- Konfirmasi endpoint create/update dan identitas record alumni milik pengguna.
- Tambahkan kolom baru secara nullable/default aman, tanpa menghapus record lama.
- Terapkan aturan yang sama di backend, termasuk uppercase dan mengabaikan nilai
  kondisional yang tidak aktif. Jangan mengandalkan validasi browser saja.
- Konfirmasi penamaan dan tipe field respons/payload. `ApiAlumni` telah disiapkan
  untuk membaca field opsional `nisn`, `kelas`, `nomor_wa`, `jenis_kampus`,
  `jalur_lainnya`, `lembaga_penyalur`, `pelamar_kipk`, `beasiswa`,
  `beasiswa_lainnya`, dan `pekerjaan`. Ini merupakan ekspektasi frontend,
  bukan kontrak backend yang sudah diverifikasi.
- Konfirmasi representasi Tanpa Pilihan. Adapter saat ini membaca `pilihan_ke=0`
  sebagai Tanpa Pilihan dan `null` sebagai data yang belum tersedia; belum ada
  pengiriman nilai ini ke API.
- Ganti penyimpanan lokal dengan endpoint yang terkonfirmasi, muat data server,
  dan verifikasi penyimpanan serta edit lintas perangkat sebelum mengklaim
  integrasi database selesai.

## Pemeriksaan

```powershell
node --test tests/pendataan.test.mjs
npx --no-install tsc --noEmit
npm run lint
npm run build
```

Tes memeriksa format WhatsApp, normalisasi, round-trip JSON, field wajib,
pembersihan nilai kondisional, pilihan kosong yang opsional, dan pemisahan
pelamar/penerima KIP-K. Build memerlukan akses Google Fonts sesuai konfigurasi
font project yang sudah ada.
