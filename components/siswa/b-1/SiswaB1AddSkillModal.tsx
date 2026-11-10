"use client";

import React, { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { SUGGESTED_SKILLS } from "./mockData";

interface SiswaB1AddSkillModalProps {
  isOpen: boolean;
  activeSkills: string[];
  onClose: () => void;
  onSaveSkills: (skills: string[]) => void;
}

export const SiswaB1AddSkillModal: React.FC<SiswaB1AddSkillModalProps> = ({
  isOpen,
  activeSkills,
  onClose,
  onSaveSkills,
}) => {
  const [currentList, setCurrentList] = useState<string[]>(activeSkills);
  const [customInput, setCustomInput] = useState<string>("");

  if (!isOpen) return null;

  const handleToggleSuggested = (skillName: string) => {
    if (currentList.includes(skillName)) {
      setCurrentList((prev) => prev.filter((s) => s !== skillName));
    } else {
      if (currentList.length >= 10) return;
      setCurrentList((prev) => [...prev, skillName]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInput.trim();
    if (!val) return;
    if (!currentList.includes(val) && currentList.length < 10) {
      setCurrentList((prev) => [...prev, val]);
    }
    setCustomInput("");
  };

  const handleRemoveSkill = (skillName: string) => {
    setCurrentList((prev) => prev.filter((s) => s !== skillName));
  };

  const handleSave = () => {
    onSaveSkills(currentList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="w-full max-w-[620px] bg-white rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-start justify-between border-b border-slate-100 bg-white">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E1E1E] tracking-tight">
              Tambah Keahlian
            </h2>
            <p className="text-xs sm:text-sm text-[#6C757D]">
              Tambahkan keahlian teknis, perangkat lunak, atau bidang minatmu.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#6C757D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Custom Input */}
          <form onSubmit={handleAddCustom} className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E1E1E] block">
              Keahlian Baru <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ketik keahlian lalu tekan Tambah..."
                className="flex-1 text-xs sm:text-sm bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 outline-none focus:border-[#5F089E]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs font-semibold cursor-pointer shrink-0"
              >
                Tambah
              </button>
            </div>
          </form>

          {/* Suggested Skills */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C757D]">
              KEAHLIAN YANG DISARANKAN BERDASARKAN PROFIL
            </h3>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((sk) => {
                const isSelected = currentList.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => handleToggleSuggested(sk)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#410070] text-white shadow-xs"
                        : "bg-[#F5EBF7] text-[#1E1E1E] hover:bg-[#ebdcf0]"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-[#410070]" />
                    )}
                    <span>{sk}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Skills Added */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C757D]">
                KEAHLIAN YANG SUDAH DITAMBAHKAN
              </h3>
              <span className="text-xs text-[#6C757D]">
                {currentList.length} / 10 Keahlian
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[50px] p-3 rounded-xl bg-slate-50 border border-slate-100">
              {currentList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE6F5] text-[#410070] text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="w-4 h-4 rounded-full hover:bg-purple-200/60 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-3 h-3 text-[#410070]" />
                  </button>
                </span>
              ))}
              {currentList.length === 0 && (
                <p className="text-xs text-slate-400 py-1">
                  Belum ada keahlian yang dipilih.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FBF0FC] border-t border-purple-100/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-[#4C4452] hover:bg-white/60 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#5F089E] hover:bg-[#4d0680] text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all"
          >
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

