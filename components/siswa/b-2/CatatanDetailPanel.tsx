"use client";

import React from "react";
import { CatatanSiswaItem } from "./mockDataSiswa";

interface CatatanDetailPanelProps {
  catatan: CatatanSiswaItem;
  onSaveCatatan?: (updated: CatatanSiswaItem) => void;
}

export default function CatatanDetailPanel({
  catatan,
}: CatatanDetailPanelProps) {
  const displayIdCatatan = catatan.idCatatan || catatan.id || "1001";
  const displayIdSiswa = catatan.idSiswa || "30";
  const displaySemester =
    catatan.semester !== undefined ? String(catatan.semester) : "2";
  const displayJenis = catatan.jenisCatatan || catatan.kategori || "Disiplin";
  const displayPoin = catatan.poinDisiplin || "-5";
  const displayDeskripsi =
    catatan.deskripsiCatatan ||
    catatan.ringkasan ||
    "Datang tepat waktu dan mematuhi aturan sekolah";
  const displayTanggal =
    catatan.tanggalLengkap || catatan.tanggalPencatatan || "12 Oktober 2026";
  const subtitleCategory = catatan.kategoriSubtitle || "Akademik";

  // Badge warna poin disiplin
  const isPoinPositif = String(displayPoin).startsWith("+");
  const poinBadgeStyle = isPoinPositif
    ? { background: "#E0F5E8", color: "#148557" }
    : { background: "#FDECEA", color: "#C0392B" };

  return (
    <div
      className="w-full bg-[#F0E6F5] rounded-[14px] p-5 sm:p-6 flex flex-col gap-5 shadow-xs"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header ── */}
      <div>
        <h2 className="text-[16px] font-bold text-[#14141C] leading-snug">
          Detail Catatan Karakter
        </h2>
        <p className="text-[10px] text-[#6E6B78] mt-1">
          {displayTanggal} &bull; {subtitleCategory}
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-[#DECFE8]" />

      {/* ── Grid 2 Kolom: ID Catatan, ID Siswa, Semester, Jenis, Poin, Tanggal ── */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">

        {/* ID Catatan */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            ID Catatan
          </span>
          <span className="text-[12px] font-bold text-[#14141C]">
            {displayIdCatatan}
          </span>
        </div>

        {/* ID Siswa */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            ID Siswa
          </span>
          <span className="text-[12px] font-bold text-[#14141C]">
            {displayIdSiswa}
          </span>
        </div>

        {/* Semester */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            Semester
          </span>
          <span className="text-[12px] font-bold text-[#14141C]">
            {displaySemester}
          </span>
        </div>

        {/* Jenis Catatan */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            Jenis Catatan
          </span>
          <span className="text-[12px] font-bold text-[#14141C]">
            {displayJenis}
          </span>
        </div>

        {/* Poin Disiplin */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            Poin Disiplin
          </span>
          <span
            className="inline-flex items-center self-start px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold"
            style={poinBadgeStyle}
          >
            {displayPoin}
          </span>
        </div>

        {/* Tanggal Pencatatan */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            Tanggal Pencatatan
          </span>
          <span className="text-[12px] font-bold text-[#14141C]">
            {displayTanggal}
          </span>
        </div>
      </div>

      {/* ── Deskripsi Catatan — full width dalam kotak putih ── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
          Deskripsi Catatan
        </span>
        <div className="w-full bg-white rounded-[10px] border border-[#DECFE8] px-3.5 py-3">
          <p className="text-[11px] text-[#14141C] leading-relaxed">
            {displayDeskripsi}
          </p>
        </div>
      </div>
    </div>
  );
}
