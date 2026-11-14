import type { ScholarshipPage, ScholarshipRow } from "./b4-scholarships";

const byName = new Intl.Collator("id", { sensitivity: "base" });
export function compareCatalogRows(a: ScholarshipRow, b: ScholarshipRow) {
  return Number(b.active) - Number(a.active) || byName.compare(a.name.trim(), b.name.trim()) || a.id - b.id;
}

/** Read every filtered page before ordering. Never sort an incomplete page as a full catalogue. */
export async function loadOrderedCatalog(readPage: (page: number) => Promise<ScholarshipPage>): Promise<ScholarshipPage> {
  const first = await readPage(1);
  if (first.total > 1000 || first.lastPage > 50) throw new Error("Katalog terlalu besar untuk diurutkan di FE. Tim BE perlu menyediakan pengurutan katalog sebelum pagination.");
  if (first.currentPage !== 1 || first.lastPage !== Math.max(1, Math.ceil(first.total / first.perPage))) throw new Error("Pagination katalog belum konsisten. Muat ulang katalog.");
  const records = [...first.data];
  for (let start = 2; start <= first.lastPage; start += 3) {
    const numbers = Array.from({ length: Math.min(3, first.lastPage - start + 1) }, (_, i) => start + i);
    const pages = await Promise.all(numbers.map(readPage));
    pages.forEach((page, index) => {
      if (page.currentPage !== numbers[index] || page.total !== first.total || page.perPage !== first.perPage || page.lastPage !== first.lastPage) throw new Error("Katalog berubah saat dimuat. Muat ulang untuk mendapatkan urutan lengkap.");
      records.push(...page.data);
    });
  }
  if (records.length !== first.total || new Set(records.map(row => row.id)).size !== records.length) throw new Error("Data katalog belum lengkap atau berubah saat dimuat. Silakan muat ulang.");
  return { ...first, data: records.sort(compareCatalogRows) };
}

export function catalogDisplayPage(collection: ScholarshipPage, requestedPage: number): ScholarshipPage {
  const currentPage = Math.max(1, Math.min(requestedPage, collection.lastPage));
  return { ...collection, currentPage, data: collection.data.slice((currentPage - 1) * collection.perPage, currentPage * collection.perPage) };
}
