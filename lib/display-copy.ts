/** Presentation only: keep source values unchanged for searching, editing and saving. */
const abbreviations = new Map([
  'AI', 'API', 'CSV', 'PDF', 'IPK', 'IPI', 'UKT', 'KIP', 'KIP-K', 'KIPK', 'PIP', 'PKH', 'KIS',
  'NIS', 'NISN', 'SMA', 'SMAN', 'SMK', 'MA', 'PT', 'PTN', 'PTS', 'SNBP', 'SNBT', 'UTBK', 'TKA',
  'RIASEC', 'MI', 'BK', 'UM', 'UB', 'UGM', 'UI', 'ITS', 'ITB', 'IPB', 'UIN', 'UNMUL',
  'UNAIR', 'UNPAD', 'UNDIP', 'UNNES', 'UNESA', 'UNY', 'UNJ', 'UPH', 'BINUS', 'TELADAN',
  'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
  'IX', 'X', 'XI', 'XII', 'IELTS', 'TOEFL', 'ITP', 'TPA', 'WA', 'RT', 'RW',
].map(value => [value.toLocaleLowerCase('id-ID'), value]));
abbreviations.set('loa', 'LoA');
abbreviations.set('ibt', 'iBT');
const connectors = new Set(['dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'yang', 'pada', 'of', 'and', 'the']);

export function displayTitle(value: unknown): string {
  if (value == null || value === '') return '-';
  if (typeof value !== 'string') return String(value);
  let index = 0;
  return value.trim().replace(/\bIP[- ]Kumulatif\b/gi, 'IPK Kumulatif').replace(/_/g, ' ').replace(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu, word => {
    const lower = word.toLocaleLowerCase('id-ID');
    const first = index++ === 0;
    const abbreviation = abbreviations.get(lower);
    if (abbreviation) return abbreviation;
    if (!first && connectors.has(lower)) return lower;
    // Keep intentional brand spelling such as Eightracer and iBT; normalize all-caps source text.
    if (word !== word.toLocaleUpperCase('id-ID') && word !== lower && /[\p{Lu}]/u.test(word.slice(1))) return word;
    return lower.charAt(0).toLocaleUpperCase('id-ID') + lower.slice(1);
  });
}
