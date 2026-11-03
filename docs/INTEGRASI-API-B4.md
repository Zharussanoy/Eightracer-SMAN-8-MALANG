# Integrasi API B4

## Koneksi yang sudah dilakukan

FAQ berhasil dibuka dari laptop FE lewat HTTPS Tailscale dan mengembalikan JSON pada `data`. Base URL pengembangan dari paket backend adalah:

```env
NEXT_PUBLIC_API_BASE_URL=https://laptop-3qspir74.tail5f273f.ts.net/api
```

Salin `.env.local.example` menjadi `.env.local`, lalu mulai ulang server Next.js. `.env.local` sudah dikecualikan dari Git. Nilai ini adalah alamat koneksi, bukan token atau kredensial.

Git hanya mengizinkan template `.env.local.example` untuk disimpan. File konfigurasi lokal lainnya tetap diabaikan. Template cukup berisi alamat API; jangan menambahkan password, token, atau secret ke dalamnya. Keberhasilan akses FAQ di atas adalah pemeriksaan sebelumnya, bukan bukti server BE selalu tersedia.

## Client API

`lib/eightracer-api.ts` menangani header JSON, Bearer token di memori, respons validasi Laravel `422`, dan penghapusan token pada `401`. Contoh pemakaian:

```ts
const faq = await api.faq();
const session = await api.login({ email, password });
const profile = await api.me();
```

Token hanya berada di memori browser. Refresh halaman akan menghapusnya sehingga login ulang diperlukan. Jangan menaruh token di `localStorage`, URL, atau log.

## Endpoint modul B4

- Admin: katalog `GET/POST /beasiswa`, ubah `PUT /beasiswa/{id}`, arsip `DELETE /beasiswa/{id}`.
- Admin: alumni dan penerimaan PT memakai `/study-tracer`; progres memakai `/alumni/{siswa_id}/progress`, riwayat memakai `/alumni/{siswa_id}/timeline`, dan revisi/publikasi memakai `/alumni-progress/{id}`.
- Admin: analitik `GET /analitik-beasiswa`; review rekomendasi `PATCH /rekomendasi-beasiswa/{id}/review`; pembuatan rekomendasi `POST /siswa/{id}/rekomendasi-beasiswa/generate`.
- Siswa: alumni berizin `GET /jejak-alumni` dan `/jejak-alumni/{id}`; rekomendasi yang disetujui `GET /rekomendasi-beasiswa/saya`.

Endpoint katalog dan progres admin memerlukan role `administrator`. Endpoint `/saya` dan alumni berizin menggunakan akun siswa. Jangan memakai pilihan profil contoh pada UI sebagai identitas untuk meminta data privat.

## Sebelum mengganti data contoh B4

Minta backend menyiapkan email/password akun uji admin dan siswa secara terpisah. Kredensial dan token jangan dikirim lewat Git atau ditempel di source. Masuk FE perlu disambungkan ke halaman login API, kemudian data katalog, alumni, progres, timeline, analitik dan rekomendasi dapat dipindahkan satu per satu dari `demoStore` ke endpoint terkait. Foto bukti prestasi privat tidak boleh ditampilkan.

Paket menyebut CORS lokal mendukung `http://localhost:3000` atau `http://127.0.0.1:3000` secara default. Jika origin berbeda, backend perlu mengizinkannya. Laptop backend, Laravel, dan Tailscale harus aktif agar alamat pengembangan dapat digunakan.
