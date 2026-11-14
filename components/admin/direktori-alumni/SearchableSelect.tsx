"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

export interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Pilih...",
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Tutup dropdown saat pengguna mengklik area luar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter daftar opsi berdasarkan input pencarian pengguna
    const filteredOptions = options.filter(
        (opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase()) ||
            opt.value.toLowerCase().includes(search.toLowerCase())
    );

    const selectedLabel =
        options.find((opt) => opt.value === value)?.label || placeholder;

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Tombol Utama Dropdown */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium flex items-center justify-between focus:outline-hidden focus:ring-2 focus:ring-[#5F089E]/20 focus:border-[#5F089E] transition-all cursor-pointer"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Popover Dropdown Menu & Kolom Cari */}
            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white border border-slate-200 shadow-lg p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100 min-w-[220px]">
                    {/* Form Pencarian */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama / kode kampus..."
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#5F089E]"
                            autoFocus
                        />
                    </div>

                    {/* List Opsi Kampus */}
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {filteredOptions.length === 0 ? (
                            <div className="py-2.5 px-3 text-[11px] text-slate-400 text-center">
                                Kampus tidak ditemukan
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = value === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${isSelected
                                                ? "bg-purple-50 text-[#5F089E] font-bold"
                                                : "text-slate-700 font-medium hover:bg-slate-50"
                                            }`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-[#5F089E] shrink-0 ml-1" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}