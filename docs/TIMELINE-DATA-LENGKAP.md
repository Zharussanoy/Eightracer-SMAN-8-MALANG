# Timeline Individu — identitas tetap tampil

Halaman menampilkan alumni yang sama dengan Alumni di PT. Tidak memakai filter kelengkapan data.

Nama, kampus, prodi, jalur dan tahun lulus diambil dari API. Panel Status Terkini, Perjalanan Pendidikan SMA, Perjalanan Pendidikan PT dan Detail Semester tetap tampil saat progres kosong. Data yang belum ada ditampilkan -.

Tiga posisi tahap pendidikan diisi dari education_events. Tahap yang belum punya tanggal/tahun tetap berupa placeholder; tanggal tidak ditebak. Jika hanya tahun lulus tersedia, tampilkan tahun tersebut. Nama kampus tetap terlihat meskipun tanggal masuk PT belum diketahui.

Delapan posisi semester kosong adalah struktur tampilan FE, bukan record database. Setelah progres tersimpan, tampilkan semester/periode/nilai sesuai record. Tidak membuat IPK, UKT, status aktif atau keputusan beasiswa contoh.

Endpoint browser: GET /api/b4/alumni dan GET /api/b4/alumni/{id}. Cookie HttpOnly diteruskan server ke BE. Detail memakai ID penerimaan; dua penerimaan milik satu alumni tidak dicampur. Filter, pemilihan alumni dan paginasi mengikuti data sekolah.

Kelola Progress membuka detail alumni/penerimaan yang sama. Modul timeline siswa tidak diubah. Data utama599 penerimaan/576 alumni/49 kampus; tidak ditambah progres buatan. Lima belas tes parser/form/render, TypeScript dan ESLint lulus; API diuji lewat HTTP. Pemeriksaan visual browser otomatis belum dilakukan.
