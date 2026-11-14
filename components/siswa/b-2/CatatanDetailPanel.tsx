"use client";

import React, { useState, useEffect } from "react";
import { CatatanSiswaItem } from "./mockDataSiswa";
import { Edit3, Check, X, Loader2 } from "lucide-react";

interface CatatanDetailPanelProps {
  catatan: CatatanSiswaItem;
  onSaveCatatan?: (updated: CatatanSiswaItem) => Promise<void> | void;
}

export default function CatatanDetailPanel({
  catatan,
  onSaveCatatan,
}: CatatanDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editJenis, setEditJenis] = useState("");
  const [editPoin, setEditPoin] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");

  useEffect(() => {
    setEditJenis(catatan.jenisCatatan || catatan.kategori || "Kedisiplinan");
    setEditPoin(String(catatan.poinDisiplin ?? "+5"));
    setEditDeskripsi(catatan.deskripsiCatatan || catatan.ringkasan || "");
    setIsEditing(false);
  }, [catatan]);

  const displayIdCatatan = catatan.idCatatan || catatan.id || "1001";
  const displayIdSiswa = catatan.idSiswa || "30";
  const displaySemester =
    catatan.semester !== undefined ? String(catatan.semester) : "2";
  const displayJenis = editJenis || catatan.jenisCatatan || catatan.kategori || "Kedisiplinan";
  const displayPoin = editPoin || catatan.poinDisiplin || "+5";
  const displayDeskripsi =
    editDeskripsi ||
    catatan.deskripsiCatatan ||
    catatan.ringkasan ||
    "Datang tepat waktu dan mematuhi aturan sekolah";
  const displayTanggal =
    catatan.tanggalLengkap || catatan.tanggalPencatatan || "12 Oktober 2026";
  const subtitleCategory = catatan.kategoriSubtitle || "Karakter";

  // Badge warna poin disiplin
  const isPoinPositif = String(displayPoin).startsWith("+");
  const poinBadgeStyle = isPoinPositif
    ? { background: "#E0F5E8", color: "#148557" }
    : { background: "#FDECEA", color: "#C0392B" };

  const handleSave = async () => {
    if (!onSaveCatatan) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      const updated: CatatanSiswaItem = {
        ...catatan,
        jenisCatatan: editJenis,
        kategori: editJenis,
        poinDisiplin: editPoin,
        deskripsiCatatan: editDeskripsi,
        ringkasan: editDeskripsi,
      };
      await onSaveCatatan(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert("Gagal memperbarui catatan: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="w-full bg-[#F0E6F5] rounded-[14px] p-5 sm:p-6 flex flex-col gap-5 shadow-xs"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#14141C] leading-snug">
            Detail Catatan Karakter
          </h2>
          <p className="text-[10px] text-[#6E6B78] mt-0.5">
            {displayTanggal} &bull; {subtitleCategory}
          </p>
        </div>

        {onSaveCatatan && (
          <div>
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#DECFE8] text-[#6E6B78] hover:text-[#14141C] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-3 py-1 rounded-lg bg-[#5F089E] hover:bg-[#520492] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Simpan
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded-lg bg-white/80 hover:bg-white border border-[#DECFE8] text-[#5F089E] text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Catatan
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-[#DECFE8]" />

      {/* ── Grid 2 Kolom: ID Catatan, ID Siswa, Semester, Jenis, Poin, Tanggal ── */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
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
          {isEditing ? (
            <input
              type="text"
              value={editJenis}
              onChange={(e) => setEditJenis(e.target.value)}
              className="w-full h-7 px-2 text-[11px] font-medium border border-[#DECFE8] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#5F089E]"
            />
          ) : (
            <span className="text-[12px] font-bold text-[#14141C]">
              {displayJenis}
            </span>
          )}
        </div>

        {/* Poin Disiplin */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-semibold text-[#6E6B78] uppercase tracking-wider">
            Poin Disiplin
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editPoin}
              onChange={(e) => setEditPoin(e.target.value)}
              placeholder="+5"
              className="w-20 h-7 px-2 text-[11px] font-bold border border-[#DECFE8] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#5F089E]"
            />
          ) : (
            <span
              className="inline-flex items-center self-start px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold"
              style={poinBadgeStyle}
            >
              {displayPoin}
            </span>
          )}
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
        <div className="w-full bg-white rounded-[10px] border border-[#DECFE8] px-3.5 py-2.5">
          {isEditing ? (
            <textarea
              rows={3}
              value={editDeskripsi}
              onChange={(e) => setEditDeskripsi(e.target.value)}
              className="w-full text-[11px] text-[#14141C] border-none focus:outline-none resize-none"
              placeholder="Deskripsi catatan karakter siswa..."
            />
          ) : (
            <p className="text-[11px] text-[#14141C] leading-relaxed">
              {displayDeskripsi}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
