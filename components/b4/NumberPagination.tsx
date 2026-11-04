"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NumberPagination({ current, last, onChange }: { current: number; last: number; onChange: (page: number) => void }) {
  const pages = last <= 5 ? Array.from({ length: last }, (_, index) => index + 1) : [...new Set([1, current, last])].sort((a, b) => a - b);
  return <nav className="b4-pagination" aria-label="Halaman daftar alumni">
    <button type="button" aria-label="Halaman sebelumnya" disabled={current <= 1} onClick={() => onChange(current - 1)}><ChevronLeft size={20} aria-hidden="true" /></button>
    {pages.map((page, index) => <span key={page} className="bc4-paginationItem">{index > 0 && page > pages[index - 1] + 1 && <span className="bc4-paginationEllipsis" aria-hidden="true">...</span>}<button type="button" aria-label={`Halaman ${page}`} aria-current={current === page ? "page" : undefined} onClick={() => onChange(page)}>{page}</button></span>)}
    <button type="button" aria-label="Halaman selanjutnya" disabled={current >= last} onClick={() => onChange(current + 1)}><ChevronRight size={20} aria-hidden="true" /></button>
  </nav>;
}
