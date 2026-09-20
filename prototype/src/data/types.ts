// Types matching the real JSON shapes in data/README.md and
// scripts/build-index.mjs / scripts/build-qalam.mjs's derived output.
// Nothing here is invented — every field traces to a file under data/.

export interface Surah {
  n: number;
  ar: string;
  en: string;
  type: string; // "مكية" | "مدنية"
  ayahs: number;
  juz_start: number;
  words: number;
}

/** [surah, ayah, juz, page, hizb, rub, manzil, ruku, sajdah, uthmani_text] */
export type AyahRow = [number, number, number, number, number, number, number, number, number | null, string];

/** [ayah, pos, text, root, lemma, pos_tag, en, translit] — 1-based `pos` within the ayah */
export type WordRow = [number, number, string, string | null, string | null, string, string, string];

export type AlignSpans = Record<string, [number, number][]>; // "s:a" -> [[tokStart, tokEnd), ...] per word

export interface RootEntry {
  g_ar: string;
  g_en: string;
  g_ar_src: string;
  g_en_src: string;
  n: number;
  masadir: { m: string; p: string }[];
  defs: { book: string; text: string }[];
}

/** [text, root, en, translit, count] sorted by frequency desc */
export type LexiconWordRow = [string, string | null, string, string, number];

export interface Fehres {
  surahs: Surah[];
  juz: { n: number; s: number; a: number; page: number }[];
  pages: [number, number, number][]; // [pageNo, startSurah, startAyah]
  root_rank: [string, number][];
  stats: { surahs: number; ayahs: number; words: number; unique_words: number; roots: number; pages: number };
}

export type ExperienceKind = "discovery" | "motif" | "formula";

export interface Experience {
  id: string;
  kind: ExperienceKind;
  cat: string;
  title: string;
  s: number;
  a_from: number;
  a_to: number;
  loci: number[][]; // [surah, ayahFrom, ayahTo?][]
  note?: string;
  roots?: string[];
  score?: number;
  pattern?: string;
  n_words?: string;
}

export interface Archetype {
  name_en: string;
  name_ar: string;
  curator_label: boolean;
  runway: string;
  ledger_rows: number;
}

export interface QalamMarker {
  n: number;
  section: string;
  title_en: string;
  anchor_ar: string;
  anchor_words: string[];
  embedded_ayah: string | null;
  text: string;
  trailing_arabic_terms: string[];
}

export interface VocativeEntry {
  key: string;
  display: string;
  count: number;
  loci: [number, number][];
  words: [number, number, number, number][]; // [surah, ayah, posFrom, posTo]
}

export type RootOccurrences = Record<string, [number, number, number][]>; // root -> [s,a,pos][]
export type WordOccurrences = Record<string, [number, number, number][]>; // normalized word -> [s,a,pos][]
export type WordToRoot = Record<string, string>;

export interface Locus {
  surah: number;
  ayah: number;
}
