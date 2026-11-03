import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlumniItem } from "@/components/admin/direktori-alumni/types";

/**
 * Mapping nama jalur resmi agar tidak disingkat pada judul laporan resmi.
 */
export const JALUR_FULL_NAME_MAP: Record<string, string> = {
  SNBP: "SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP)",
  SNBT: "SELEKSI NASIONAL BERDASARKAN TES (SNBT)",
  SIMAMA: "SELEKSI MAHASISWA BERSAMA / TES (SIMAMA)",
  SIMAMI: "SELEKSI MAHASISWA MANDIRI (SIMAMI)",
  MANDIRI: "SELEKSI MANDIRI",
  SPANPTKIN: "SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN-PTKIN)",
  UMPTKIN: "UJIAN MASUK PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (UM-PTKIN)",
  PMDP: "SPMB Prestasi (PMDP)",
  ADIK: "AFIRMASI PENDIDIKAN TINGGI (ADIK)"
};

/**
 * Helper untuk mengambil nama lengkap jalur dari mapping.
 */
export function getFullJalurName(jalur: string): string {
  if (!jalur) return "";
  const key = jalur.trim().toUpperCase();
  return JALUR_FULL_NAME_MAP[key] || jalur.trim();
}

export async function loadSvgAsPngBase64(
  url: string,
  width = 300,
  height = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      reject(new Error("Fungsi ini hanya dapat dijalankan di sisi browser (client-side)."));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context 2D tidak tersedia"));
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      // Fallback: fetch SVG teks lalu konversi via Blob URL
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.text();
        })
        .then((svgText) => {
          const blob = new Blob([svgText], {
            type: "image/svg+xml;charset=utf-8",
          });
          const blobUrl = URL.createObjectURL(blob);
          const fallbackImg = new Image();

          fallbackImg.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                URL.revokeObjectURL(blobUrl);
                reject(new Error("Canvas context 2D tidak tersedia"));
                return;
              }
              ctx.drawImage(fallbackImg, 0, 0, width, height);
              URL.revokeObjectURL(blobUrl);
              resolve(canvas.toDataURL("image/png"));
            } catch (err) {
              URL.revokeObjectURL(blobUrl);
              reject(err);
            }
          };

          fallbackImg.onerror = (e) => {
            URL.revokeObjectURL(blobUrl);
            reject(e);
          };

          fallbackImg.src = blobUrl;
        })
        .catch(reject);
    };

    img.src = url;
  });
}

/**
 * Fungsi utama untuk mengekspor data alumni ke format PDF laporan resmi sekolah.
 *
 * @param filteredData Array of object data alumni yang sudah difilter
 * @param activeJalur String jalur masuk yang sedang difilter (misal 'SNBP', 'SNBT', 'SIMAMI', 'Mandiri', 'SEMUA')
 * @param activeYear String tahun ajaran (misal '2025/2026' atau 'Semua' untuk menyembunyikan)
 */
export async function exportToPDF(
  filteredData: AlumniItem[],
  activeJalur: string = "SEMUA",
  activeYear: string = "2025/2026"
): Promise<void> {
  // Inisialisasi dokumen jsPDF (A4, Portrait, mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const centerX = pageWidth / 2; // 105 mm

  // ==========================================
  // 1. KOP SURAT (HEADER)
  // ==========================================

  // Load kedua logo SVG secara asinkron
  try {
    const [logoJatimResult, logoSman8Result] = await Promise.allSettled([
      loadSvgAsPngBase64("/images/logo_jatim.svg", 300, 420),
      loadSvgAsPngBase64("/images/logo.svg", 300, 300),
    ]);

    // Logo kiri: Pemprov Jatim
    if (logoJatimResult.status === "fulfilled" && logoJatimResult.value) {
      doc.addImage(logoJatimResult.value, "PNG", 14, 10, 19, 24);
    }

    // Logo kanan: SMAN 8 Malang / Eightracer
    if (logoSman8Result.status === "fulfilled" && logoSman8Result.value) {
      doc.addImage(logoSman8Result.value, "PNG", 176, 11, 20, 20);
    }
  } catch (err) {
    console.warn("Gagal merender logo SVG ke PDF:", err);
  }

  // Teks Kop Surat Rata Tengah (Font Times)
  doc.setTextColor(0, 0, 0);

  // Baris 1: PEMERINTAH PROVINSI JAWA TIMUR
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("PEMERINTAH PROVINSI JAWA TIMUR", centerX, 14, { align: "center" });

  // Baris 2: DINAS PENDIDIKAN
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("DINAS PENDIDIKAN", centerX, 19.5, { align: "center" });

  // Baris 3: SMA NEGERI 8 KOTA MALANG
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("SMA NEGERI 8 KOTA MALANG", centerX, 25.5, { align: "center" });

  // Baris 4: Alamat & Kontak
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text(
    "Jl. Veteran 37 Telp. (0341) 51096 FAX (0341) 575795 MALANG",
    centerX,
    30.5,
    { align: "center" }
  );

  // Baris 5: Website & Email
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Website: www.sman8malang.sch.id E-mail: sman8malang@gmail.com",
    centerX,
    34.5,
    { align: "center" }
  );

  // Garis Batas Horizontal Kop Surat (Double Line Tradisional Laporan Resmi)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(14, 38, 196, 38);
  doc.setLineWidth(0.25);
  doc.line(14, 39, 196, 39);

  // ==========================================
  // 2. JUDUL LAPORAN (KOORDINAT Y TERPISAH)
  // ==========================================
  let currentY = 46.5;

  // Baris 1 (Bold): "DAFTAR NAMA SISWA DITERIMA DI PERGURUAN TINGGI"
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(
    "DAFTAR NAMA SISWA DITERIMA DI PERGURUAN TINGGI",
    centerX,
    currentY,
    { align: "center" }
  );

  // Baris 2 (Bold): "JALUR [Nama Jalur Utuh dari Mapping]"
  currentY += 5.5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);

  const isSemuaJalur =
    !activeJalur || activeJalur.trim().toUpperCase() === "SEMUA";
  const mappedJalurName = getFullJalurName(activeJalur);
  const baris2Text = isSemuaJalur
    ? "SEMUA JALUR MASUK PERGURUAN TINGGI"
    : `JALUR ${mappedJalurName}`;

  doc.text(baris2Text, centerX, currentY, { align: "center" });

  // Baris 3 (Bold): "TAHUN AJARAN [activeYear]" (Jika activeYear = 'Semua', sembunyikan baris ini)
  const shouldShowYear =
    Boolean(activeYear) &&
    activeYear.trim().toLowerCase() !== "semua" &&
    activeYear.trim() !== "";

  if (shouldShowYear) {
    currentY += 5.5;
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.text(`TAHUN AJARAN ${activeYear.trim()}`, centerX, currentY, {
      align: "center",
    });
  }

  // ==========================================
  // 3. TABEL UTAMA (DATA SISWA DITERIMA)
  // ==========================================
  const mainTableRows = filteredData.map((item, index) => {
    const kelas =
      (item as unknown as { kelas?: string }).kelas ||
      (item.angkatan ? item.angkatan.replace("Alumni ", "") : "XII");

    return [
      index + 1,
      item.nama ? item.nama.toUpperCase() : "-",
      kelas,
      item.jurusan || "-",
      item.kampus || "-",
    ];
  });

  const mainTableStartY = currentY + 6;

  autoTable(doc, {
    startY: mainTableStartY,
    head: [["NO", "NAMA", "KELAS", "JURUSAN/PROGRAM STUDI", "PERGURUAN TINGGI"]],
    body: mainTableRows,
    theme: "grid",
    margin: { left: 14, right: 14 },
    headStyles: {
      font: "times",
      fillColor: [240, 243, 246],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      lineWidth: 0.15,
      lineColor: [0, 0, 0],
    },
    styles: {
      font: "times",
      fontSize: 9,
      cellPadding: 2,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { halign: "left", cellWidth: 46 },
      2: { halign: "center", cellWidth: 22 },
      3: { halign: "left", cellWidth: 51 },
      4: { halign: "left", cellWidth: 51 },
    },
  });

  // ==========================================
  // 4. TABEL RANGKUMAN (KONDISIONAL)
  // ==========================================
  const isJalurFiltered = Boolean(activeJalur && activeJalur.trim() !== "");

  if (isJalurFiltered && filteredData.length > 0) {
    const ptnCounts: Record<string, number> = {};
    filteredData.forEach((item) => {
      const ptn = item.kampus?.trim() || "Lainnya";
      ptnCounts[ptn] = (ptnCounts[ptn] || 0) + 1;
    });

    const summaryRows = Object.entries(ptnCounts)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0]);
      })
      .map(([ptn, count], idx) => [idx + 1, ptn, count]);

    const jalurSummaryLabel = isSemuaJalur
      ? "SEMUA JALUR"
      : activeJalur.toUpperCase();

    const summaryFoot = [
      [
        {
          content: `TOTAL MURID JALUR ${jalurSummaryLabel}`,
          colSpan: 2,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        },
        {
          content: filteredData.length,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        },
      ],
    ];

    const lastMainTableY = (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY;
    let summaryStartY = lastMainTableY + 8;

    if (summaryStartY + 45 > 280) {
      doc.addPage();
      summaryStartY = 20;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Rekapitulasi Persebaran PTN:", 14, summaryStartY);

    autoTable(doc, {
      startY: summaryStartY + 2.5,
      head: [["NO", "PERSEBARAN PTN", "JML"]],
      body: summaryRows,
      foot: summaryFoot,
      theme: "grid",
      margin: { left: 14, right: 14 },
      tableWidth: 125,
      headStyles: {
        font: "times",
        fillColor: [240, 243, 246],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.15,
        lineColor: [0, 0, 0],
      },
      footStyles: {
        font: "times",
        fillColor: [248, 250, 252],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.15,
        lineColor: [0, 0, 0],
      },
      styles: {
        font: "times",
        fontSize: 9,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 85 },
        2: { halign: "center", cellWidth: 26 },
      },
    });
  }

  // ==========================================
  // 5. BAGIAN TANDA TANGAN (FOOTER)
  // ==========================================
  const margin = 12;
  const lastTableFinalY =
    (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable?.finalY || 100;

  let signY = lastTableFinalY + margin;

  // Ruang tanda tangan membutuhkan minimal ~45 mm (space kosong +25 + nama + NIP)
  if (signY + 45 > 280) {
    doc.addPage();
    signY = 22;
  }

  // Format tanggal Indonesia resmi: e.g. "3 November 2026"
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const signGap = 25; // Jarak kosong untuk tanda tangan fisik

  // Sebelah Kiri: Mengetahui, Kepala Sekolah
  const leftX = 22;
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text("Mengetahui", leftX, signY);
  doc.text("Kepala Sekolah,", leftX, signY + 5);

  doc.setFont("times", "bold");
  doc.text("Nuraeni, S. Pd., M. Pd", leftX, signY + 5 + signGap);

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text("NIP. 196609121989032010", leftX, signY + 5 + signGap + 5);

  // Sebelah Kanan: Malang, [Tanggal], Koordinator BK (sejajar vertikal)
  const rightX = 135;
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text(`Malang, ${formattedDate}`, rightX, signY);
  doc.text("Koordinator BK", rightX, signY + 5);

  doc.setFont("times", "bold");
  doc.text("Rina Mariana, S. Pd", rightX, signY + 5 + signGap);

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text("NIP. 198412162009032002", rightX, signY + 5 + signGap + 5);

  // ==========================================
  // PENOMORAN HALAMAN OTOMATIS
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      centerX,
      290,
      { align: "center" }
    );
  }

  // Unduh dokumen PDF
  const sanitizedJalur = (activeJalur || "SEMUA").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Laporan_Kelulusan_Alumni_${sanitizedJalur}_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
}

export default exportToPDF;
