"use client";

import FigmaIcon from "./FigmaIcon";

export default function NumberPagination({ current, last, onChange, label = "Halaman daftar alumni" }: { current: number; last: number; onChange: (page: number) => void; label?: string }) {
  const pages = last <= 5 ? Array.from({ length: last }, (_, index) => index + 1) : [...new Set([1, current, last])].sort((a, b) => a - b);
  return <nav className="b4-pagination" aria-label={label}>
    <button type="button" aria-label="Halaman sebelumnya" disabled={current <= 1} onClick={() => onChange(current - 1)}><FigmaIcon name="previous" size={20} /></button>
    {pages.map((page, index) => <span key={page} className="bc4-paginationItem">{index > 0 && page > pages[index - 1] + 1 && <span className="bc4-paginationEllipsis" aria-hidden="true">...</span>}<button type="button" aria-label={`Halaman ${page}`} aria-current={current === page ? "page" : undefined} onClick={() => onChange(page)}>{page}</button></span>)}
    <button type="button" aria-label="Halaman selanjutnya" disabled={current >= last} onClick={() => onChange(current + 1)}><FigmaIcon name="next" size={20} /></button>
  </nav>;
}
