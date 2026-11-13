# Pedoman Penulisan Antarmuka

- Judul, label formulir, kolom tabel, tab, dan tombol memakai huruf awal kapital. Kata penghubung seperti di, ke, dan, atau, dan untuk tetap kecil di tengah judul.
- Deskripsi, petunjuk, pesan kesalahan, dan percakapan memakai kapital di awal kalimat.
- Nama alumni, kampus, program studi, dan beasiswa ditampilkan melalui `displayTitle` dari `lib/display-copy.ts` ketika berasal dari sumber dengan kapitalisasi tidak konsisten.
- Singkatan resmi seperti NISN, KIP-K, UKT, IPK, TKA, SNBP, SNBT, UIN, S1, serta TELADAN dipertahankan. Tambahkan singkatan baru ke kamus apabila diperlukan.
- Gunakan Progres Kuliah dan Periode Pendaftaran secara konsisten.
- Format hanya saat merender. Nilai asli untuk filter, identitas, formulir edit, penyimpanan, dan API harus dipertahankan.
- Hindari CSS `uppercase` atau `capitalize` untuk merapikan data karena dapat merusak singkatan dan menyembunyikan perbedaan nilai formulir.
