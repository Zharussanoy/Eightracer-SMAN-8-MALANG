"use client";

import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  Lock,
  ChevronDown,
  Hourglass,
  ShieldCheck,
} from "lucide-react";
import { StudentB1Account } from "./types";
import { determineStudentAccess } from "./studentAccessPolicy";

interface SiswaB1SimulasiSwitcherProps {
  accounts: StudentB1Account[];
  currentAccount: StudentB1Account;
  onSelectAccount: (account: StudentB1Account) => void;
  isSuratValidated: boolean;
  onToggleSuratValidation: (validated: boolean) => void;
}

export const SiswaB1SimulasiSwitcher: React.FC<SiswaB1SimulasiSwitcherProps> = ({
  accounts,
  currentAccount,
  onSelectAccount,
  isSuratValidated,
  onToggleSuratValidation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentAccess = determineStudentAccess(currentAccount, isSuratValidated);

  const getStatusBadge = (acc: StudentB1Account) => {
    const access = determineStudentAccess(acc, isSuratValidated);
    if (!access.canAccessEvaluasi) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Hourglass className="w-2.5 h-2.5" />
          Menunggu Validasi BK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Evaluasi Terbuka
      </span>
    );
  };

  return (
    <div className="w-full bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 sm:p-5 mb-8 shadow-xs font-sans">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Info Box */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#5F089E] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#5F089E] uppercase tracking-wider">
                Simulasi Akses Siswa &amp; Validasi Surat Rekomendasi
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-200/60 text-[#3C0565] text-[10px] font-extrabold uppercase">
                Jenjang: Kelas {currentAccess.jenjang}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Uji kondisi akses: jika surat rekomendasi <strong>belum divalidasi oleh admin/BK</strong>, pratinjau menampilkan status evaluasi BK dan evaluasi nilai belum bisa diakses.
            </p>
          </div>
        </div>

        {/* Kontrol Interaktif: Switcher Akun & Switcher Status Validasi Admin */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* 1. Dropdown Akun Siswa (Kelas 10 vs Kelas 11) */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Akun Siswa:
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full sm:w-64 flex items-center justify-between px-3 py-2 bg-white border border-[#D8B4FE] hover:border-[#5F089E] rounded-xl text-left shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-[#5F089E] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {currentAccount.avatarInitials}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {currentAccount.nama} (Kelas {currentAccount.kelas})
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-full sm:w-84 bg-white border border-[#E9D5FF] rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Pilih Akun Jenjang Siswa:
                  </div>
                  {accounts.map((acc) => {
                    const isSelected = acc.studentId === currentAccount.studentId;
                    return (
                      <button
                        key={acc.studentId}
                        type="button"
                        onClick={() => {
                          onSelectAccount(acc);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-all flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-purple-50/80 border border-[#D8B4FE]"
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">
                              {acc.nama}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-[#5F089E]">
                              Kelas {acc.kelas}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#5F089E] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#5F089E]" />
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>
                            NISN: {acc.nisn} &bull; Smt {acc.semester}
                          </span>
                          <span>{getStatusBadge(acc)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. Toggle Status Validasi Surat oleh Admin/BK */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Validasi Surat Admin:
            </label>
            <div className="inline-flex rounded-xl bg-white border border-[#D8B4FE] p-1 gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onToggleSuratValidation(false)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                  !isSuratValidated
                    ? "bg-[#FEF3C7] text-[#92400E] border border-amber-300 shadow-2xs scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                title="Simulasi: Surat Belum Divalidasi oleh Admin/BK"
              >
                <Hourglass className="w-3.5 h-3.5" />
                <span>Belum Divalidasi</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleSuratValidation(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                  isSuratValidated
                    ? "bg-[#5F089E] text-white shadow-xs scale-[1.02]"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
                title="Simulasi: Surat Sudah Divalidasi & Terkunci Permanen"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tervalidasi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
