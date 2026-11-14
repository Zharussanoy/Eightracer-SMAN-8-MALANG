# Alur rekomendasi siswa atas permintaan

Rekomendasi hanya untuk siswa aktif SMA 8. Halaman tidak menghitung atau memanggil Gemini saat dibuka. Siswa memulai percakapan, lalu meminta perhitungan secara eksplisit. Hasil disimpan untuk akun yang sedang login; catatan Guru BK tetap opsional dan terpisah.

## Kontrak integrasi

- `GET /api/b4/rekomendasi?role=siswa`: membaca hasil tersimpan. `state` adalah `not_started`, `ready`, atau `needs_update`; `data` berisi daftar rekomendasi; `generatedAt` adalah waktu hasil terakhir jika ada. Tanpa hasil, daftar kosong dan UI mengajak mulai percakapan.
- `POST /api/b4/recommendations/generate`: perhitungan eksplisit. Body `{}` atau `{ "target_jenjang": "SMA" }` / `{ "target_jenjang": "Kuliah" }`. Tidak menerima ID siswa dari browser. Memakai cookie sesi dan pemeriksaan origin.
- Endpoint Laravel pengganti: `GET /api/rekomendasi-beasiswa/saya` dan `POST /api/rekomendasi-beasiswa/saya/generate`. Field waktu Laravel bernama `generated_at`.
- `POST /api/b4/recommendations/chat`: pertanyaan informasi/persiapan. Mengajukan pertanyaan umum tidak otomatis menyimpan hasil rekomendasi. Permintaan rekomendasi personal pada UI menggunakan endpoint generate.

## Perilaku

1. Belum pernah meminta hasil: tidak ada skor, kartu hasil, atau referensi alumni contoh yang muncul otomatis.
2. Permintaan berhasil: ranking ML dan evaluasi kriteria dihitung dari profil tersimpan, penjelasan tersedia sesuai status layanan, lalu hasil disimpan di `student_scholarship_results`.
3. GET berikutnya membaca snapshot tanpa ranking ulang atau panggilan Gemini. Snapshot tidak bergantung pada publikasi Guru BK.
4. Perubahan fingerprint sumber mengembalikan `needs_update`, tanpa menampilkan skor lama sebagai hasil terkini. Perhitungan baru hanya melalui POST.
5. Kegagalan/timeout tidak dianggap sebagai hasil berhasil; UI mempertahankan pesan error yang aman. Data profil tidak diubah otomatis dari teks chat.
6. Alasan rekomendasi berada setelah evaluasi, referensi alumni, dan informasi beasiswa pada detail. Tautan percakapan lanjutan berlabel “Bahas Beasiswa Ini”.

## Penyimpanan dan akses

Tabel hasil memiliki satu baris per siswa, FK ke siswa, snapshot JSON, fingerprint, target yang diminta, dan waktu perhitungan. Akses RLS hanya untuk role backend `eightracer_runtime`; role Supabase `anon` dan `authenticated` tidak memperoleh akses. API selalu menentukan pemilik melalui akun login. Tidak ada kewajiban Supabase Auth di frontend.

Migrasi Laravel `create_student_scholarship_results_table` telah dipasang pada staging melalui akun migrasi yang dikonfigurasi terpisah. Akun runtime tidak diberi izin membuat tabel. Data sekolah yang sudah ada tidak diubah oleh pemasangan skema ini.
