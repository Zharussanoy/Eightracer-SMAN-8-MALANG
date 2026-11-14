# Persiapan chat beasiswa

Status: integrasi FE disiapkan dan diuji dengan fixture lokal; **belum diuji dengan endpoint BE/provider sekolah**. Tidak melakukan chat, generate, review atau perubahan data pada BE sekolah selama tahap ini.

## Alur dan batas

- Siswa login → `/siswa/rekomendasi-beasiswa/chat` → pertanyaan eksplisit → POST `/api/b4/chat` → POST Laravel `/chat-beasiswa`.
- Proxy memeriksa origin/content type serta sesi `/me` siswa. Token tetap dalam cookie HttpOnly/server. Input hanya message, beasiswa_id, target_jenjang; history, siswa_id dan field tambahan ditolak.
- Tidak ada pertanyaan otomatis saat halaman dibuka. Sapaan dan tombol saran adalah teks antarmuka, bukan jawaban AI.
- Percakapan hanya di memori komponen. Tidak dikirim sebagai history, tidak disimpan di localStorage, tidak dicatat di log, dan hilang saat halaman ditinggalkan. Setiap pertanyaan stateless; siswa diminta menyertakan konteks dalam pesan.
- Konteks menggunakan **beasiswa_id katalog**, bukan id rekomendasi. Detail rekomendasi meneruskan ID hanya jika BE benar-benar menyediakannya. Tanpa ID, tautan membuka chat umum. ID nonnumerik/jenjang invalid tidak diganti menjadi program pertama.
- Respons answer dirender sebagai teks React dengan baris baru, tanpa HTML/Markdown mentah. Checklist ditampilkan sebagai daftar setelah respons. Tidak ada alasan/portofolio/skor/alumni contoh.
- llm_used=true → label berbantuan AI; false → jawaban faktual tanpa AI generatif; tidak dikirim → label netral layanan beasiswa. Respons ringkas tetap didukung.
- Hanya proyeksi answer, context, label sumber/URL http(s) tanpa kredensial, eligibility skor/kelengkapan/checklist dikirim ke browser. Tidak meneruskan historical_evidence mentah atau internal metadata.
- Satu request aktif, tidak streaming atau retry otomatis. 429 memblokir pengiriman ulang selama 60 detik. Kegagalan ditampilkan di luar balon jawaban, tersedia kirim ulang manual tanpa menduplikasi pertanyaan. Timeout tidak berarti server pasti membatalkan pemrosesan.

## Verifikasi setelah BE tersedia

1. Cocokkan struktur populated answer/sources/eligibility dari BE. Opsional yang tidak dikenal tidak boleh diubah menjadi klaim fakta atau profil contoh.
2. Siswa mengirim satu pertanyaan uji yang disepakati, tanpa data pribadi. Cocokkan label llm_used dan sumber. Pengujian ini dapat memakai provider/kuota; tidak dijalankan otomatis oleh FE.
3. Periksa chat umum, konteks katalog sebenarnya, fallback faktual 200, katalog kosong, 401/403/422/429/5xx dan respons tidak valid.
4. Pastikan tidak ada operasi tulis profil, siswa/alumni, katalog atau publikasi dalam alur chat. Kontrak BE menyebut endpoint stateless, tetapi audit persistensi internal tetap tanggung jawab BE.

## BE lokal

Pesan tim BE mengusulkan Laravel lokal pada port 8000. Perubahan ini belum diterapkan oleh tugas chat. Jangan mengganti .env.local sampai proses BE lokal dan konfigurasi privatnya siap. Laravel lokal dengan Supabase bersama tetap memakai data sekolah bersama; bukan database uji. Jangan migration/seed atau membagikan APP_KEY/Gemini/database credentials lewat Git atau dokumentasi FE.
