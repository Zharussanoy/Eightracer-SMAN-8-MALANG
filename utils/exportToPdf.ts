import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlumniItem } from "@/components/admin/direktori-alumni/types";

export const JALUR_FULL_NAME_MAP: Record<string, string> = {
  SNBP: "SELEKSI NASIONAL BERDASARKAN PRESTASI (SNBP)",
  SNBT: "SELEKSI NASIONAL BERDASARKAN TES (SNBT)",
  SIMAMA: "SELEKSI MAHASISWA BERSAMA / TES (SIMAMA)",
  SIMAMI: "SELEKSI MAHASISWA MANDIRI (SIMAMI)",
  MANDIRI: "SELEKSI MAHASISWA MANDIRI (SIMAMI)",
  KEDINASAN: "SEKOLAH KEDINASAN (IKATAN DINAS)",
  SPANPTKIN:
    "SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN-PTKIN)",
  "SPAN-PTKIN":
    "SELEKSI PRESTASI AKADEMIK NASIONAL PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (SPAN-PTKIN)",
  UMPTKIN: "UJIAN MASUK PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (UM-PTKIN)",
  "UM-PTKIN": "UJIAN MASUK PERGURUAN TINGGI KEAGAMAAN ISLAM NEGERI (UM-PTKIN)",
  PMDP: "SPMB PRESTASI (PMDP)",
  ADIK: "AFIRMASI PENDIDIKAN TINGGI (ADIK)",
  "LUAR NEGERI": "PERGURUAN TINGGI LUAR NEGERI",
  LUAR_NEGERI: "PERGURUAN TINGGI LUAR NEGERI",
};

export function getFullJalurName(jalur: string): string {
  if (!jalur) return "";
  const key = jalur.trim().toUpperCase();
  const normalizedKey = key.replace(/[-_]/g, "");
  return (
    JALUR_FULL_NAME_MAP[key] ||
    JALUR_FULL_NAME_MAP[normalizedKey] ||
    jalur.trim()
  );
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
 * Disesuaikan dengan format tabel 10 kolom:
 * NO | NAMA | KLS | PROGRAM STUDI | PERGURUAN TINGGI | NOMOR WA | KIPK | PIL | PDSS | SERTIF
 *
 * Menggunakan format A4 Landscape agar 10 kolom tersusun proporsional, rapi, dan mudah dibaca.
 *
 * @param filteredData Array of object data alumni yang sudah difilter
 * @param activeJalur String jalur masuk yang sedang difilter (misal 'SNBP', 'SNBT', 'SIMAMI', 'Mandiri', 'Kedinasan', 'SEMUA')
 * @param activeYear String tahun ajaran (misal '2025/2026' atau 'Semua' untuk menyembunyikan)
 * @param activeKategoriPt String kategori PT yang sedang difilter ('Negeri', 'Swasta', 'Kedinasan', 'Luar Negeri', 'SEMUA')
 */
export async function exportToPDF(
  filteredData: AlumniItem[],
  activeJalur: string = "SEMUA",
  activeYear: string = "2025/2026",
  activeKategoriPt: string = "SEMUA"
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  try {
    const [logoJatimResult, logoSman8Result] = await Promise.allSettled([
      loadSvgAsPngBase64("/images/logo_jatim.svg", 300, 420),
      loadSvgAsPngBase64("/images/logo.svg", 300, 300),
    ]);

    // Logo kiri: Pemprov Jatim
    if (logoJatimResult.status === "fulfilled" && logoJatimResult.value) {
      doc.addImage(logoJatimResult.value, "PNG", 16, 9, 20, 25);
    }

    // Logo kanan: SMAN 8 Malang / Eightracer
    if (logoSman8Result.status === "fulfilled" && logoSman8Result.value) {
      doc.addImage(logoSman8Result.value, "PNG", pageWidth - 16 - 21, 10, 21, 21);
    }
  } catch (err) {
    console.warn("Gagal merender logo SVG ke PDF:", err);
  }

  doc.setTextColor(0, 0, 0);

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("PEMERINTAH PROVINSI JAWA TIMUR", centerX, 13.5, { align: "center" });

  doc.setFontSize(12);
  doc.text("DINAS PENDIDIKAN", centerX, 18.5, { align: "center" });

  doc.setFontSize(14);
  doc.text("SMA NEGERI 8 KOTA MALANG", centerX, 24.5, { align: "center" });

  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text(
    "Jl. Veteran 37 Telp. (0341) 51096 FAX (0341) 575795 MALANG",
    centerX,
    29.5,
    { align: "center" }
  );

  // Baris 5: Website & Email
  doc.setFontSize(8.5);
  doc.text(
    "Website: www.sman8malang.sch.id E-mail: sman8malang@gmail.com",
    centerX,
    33.5,
    { align: "center" }
  );

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(14, 37, pageWidth - 14, 37);
  doc.setLineWidth(0.25);
  doc.line(14, 38, pageWidth - 14, 38);

  let currentY = 45;

  // Baris 1: Judul utama
  doc.setFont("times", "bold");
  doc.setFontSize(12);

  const kategoriJudul =
    activeKategoriPt && activeKategoriPt.trim().toUpperCase() !== "SEMUA"
      ? activeKategoriPt.trim().toUpperCase()
      : "NEGERI";

  doc.text(
    `DAFTAR NAMA SISWA DITERIMA DI PERGURUAN TINGGI ${kategoriJudul}`,
    centerX,
    currentY,
    { align: "center" }
  );

  // Baris 2: Jalur masuk
  currentY += 5;
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);

  const isSemuaJalur =
    !activeJalur || activeJalur.trim().toUpperCase() === "SEMUA";

  const mappedJalurName = getFullJalurName(activeJalur);

  const baris2Text = isSemuaJalur
    ? "SEMUA JALUR MASUK PERGURUAN TINGGI"
    : `JALUR ${mappedJalurName}`;

  doc.text(baris2Text, centerX, currentY, { align: "center" });

  // Baris 3: Tahun ajaran
  const shouldShowYear =
    Boolean(activeYear) &&
    activeYear.trim().toLowerCase() !== "semua" &&
    activeYear.trim() !== "";

  if (shouldShowYear) {
    currentY += 5;
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.text(`TAHUN AJARAN ${activeYear.trim()}`, centerX, currentY, {
      align: "center",
    });
  }

  const mainTableRows = filteredData.map((item, index) => {
    const kls =
      item.kelas ||
      (item.angkatan ? item.angkatan.replace("Alumni ", "") : "XII MIPA 1");
    const nilaiSeleksi = item.skorUtbk ?? item.nilai ?? "-"; const kipk = item.isKipk ? "Ya" : "Tidak";
    const pil = item.pilihanKe
      ? item.pilihanKe.replace(/\D/g, "") || item.pilihanKe
      : "1";
    const pdss =
      item.statusPdss ||
      (item.statusPenerimaan?.includes("Lolos") ? "Eligible" : "Tidak");
    const sertif =
      item.sertifikat && item.sertifikat.length > 0
        ? `${item.sertifikat.length} Berkas`
        : "0";

    return [
      index + 1,
      item.nama ? item.nama.toUpperCase() : "-",
      kls,
      item.jurusan || "-",
      item.kampus || "-",
      nilaiSeleksi,
      kipk,
      pil,
      pdss,
      sertif,
    ];
  });

  const mainTableStartY = currentY + 5.5;

  autoTable(doc, {
    startY: mainTableStartY,
    head: [
      [
        "NO",
        "NAMA",
        "KLS",
        "PROGRAM STUDI",
        "PERGURUAN TINGGI",
        "NILAI SELEKSI",
        "KIPK",
        "PIL",
        "PDSS",
        "SERTIF",
      ],
    ],
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
      fontSize: 8.5,
      cellPadding: 1.8,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      1: { halign: "left", cellWidth: 46 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "left", cellWidth: 48 },
      4: { halign: "left", cellWidth: 48 },
      5: { halign: "center", cellWidth: 25 },
      6: { halign: "center", cellWidth: 16 },
      7: { halign: "center", cellWidth: 13 },
      8: { halign: "center", cellWidth: 16 },
      9: { halign: "center", cellWidth: 16 },
    },
  });

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

    if (summaryStartY + 45 > pageHeight - 20) {
      doc.addPage();
      summaryStartY = 18;
    }

    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.text("Rekapitulasi Persebaran PTN:", 14, summaryStartY);

    autoTable(doc, {
      startY: summaryStartY + 2.5,
      head: [["NO", "PERSEBARAN PTN", "JML"]],
      body: summaryRows,
      foot: summaryFoot,
      theme: "grid",
      margin: { left: 14, right: 14 },
      tableWidth: 140,
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
        fontSize: 8.5,
        cellPadding: 1.8,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "left", cellWidth: 98 },
        2: { halign: "center", cellWidth: 28 },
      },
    });
  }

  const margin = 10;
  const lastTableFinalY =
    (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable?.finalY || 100;

  let signY = lastTableFinalY + margin;

  if (signY + 40 > pageHeight - 15) {
    doc.addPage();
    signY = 20;
  }

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const signGap = 22;

  const leftX = 35;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("Mengetahui", leftX, signY);
  doc.text("Kepala Sekolah,", leftX, signY + 4.5);

  doc.setFont("times", "bold");
  doc.text("Nuraeni, S. Pd., M. Pd", leftX, signY + 4.5 + signGap);

  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text("NIP. 196609121989032010", leftX, signY + 4.5 + signGap + 4.5);

  const rightX = pageWidth - 85;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(`Malang, ${formattedDate}`, rightX, signY);
  doc.text("Koordinator BK", rightX, signY + 4.5);

  doc.setFont("times", "bold");
  doc.text("Rina Mariana, S. Pd", rightX, signY + 4.5 + signGap);

  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text("NIP. 198412162009032002", rightX, signY + 4.5 + signGap + 4.5);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      centerX,
      pageHeight - 8,
      { align: "center" }
    );
  }

  const sanitizedJalur = (activeJalur || "SEMUA").replace(/[^a-zA-Z0-9]/g, "_");
  const sanitizedKategori = (activeKategoriPt || "SEMUA").replace(
    /[^a-zA-Z0-9]/g,
    "_"
  );
  const filename = `Laporan_Kelulusan_Alumni_${sanitizedJalur}_${sanitizedKategori}_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
}

export default exportToPDF;
