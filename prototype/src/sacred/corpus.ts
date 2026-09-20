/**
 * Corpus access — the single door to `data/`.
 *
 * Nothing in the sacred interface reads a JSON file directly; everything comes
 * through here, so the lazy-loading policy (FINALITY_PROMPT §4 Phase A) lives
 * in one place: the index and surah table up front, the ayah text and the
 * alignment table once, per-surah word streams and the occurrence indices on
 * demand, each fetched at most once per session.
 */

/** [surah, ayah, juz, page, hizb, rub, manzil, ruku, sajdah, uthmani] */
export type AyahRow = [number, number, number, number, number, number, number, number, unknown, string];
/** [ayah, pos, text, root, lemma, pos_tag, en, translit] */
export type WordRow = [number, number, string, string | null, string, string, string, string];

export interface SurahRow {
  n: number;
  ar: string;
  en: string;
  type: string;
  ayahs: number;
  words: number;
  juz_start: number;
}

export interface Fehres {
  surahs: SurahRow[];
  /** The thirty ajzāʾ, each with the locus and page it opens at. */
  juz: { n: number; s: number; a: number; page: number }[];
  /** [page, surah, ayah] — the first ayah printed on each of the 604 pages. */
  pages: [number, number, number][];
  root_rank: [string, number][];
  stats: Record<string, number>;
}

/** An occurrence packed by `scripts/build-data/build_infinite.py`. */
export interface Occurrence {
  surah: number;
  ayah: number;
  pos: number;
}

export function unpack(key: number): Occurrence {
  return {
    surah: Math.floor(key / 1_000_000),
    ayah: Math.floor(key / 1_000) % 1_000,
    pos: key % 1_000,
  };
}

export function ayahKey(surah: number, ayah: number): number {
  return surah * 1000 + ayah;
}

const inflight = new Map<string, Promise<unknown>>();

/** Fetch-once cache. A failed fetch is not cached, so a retry can succeed. */
function once<T>(url: string): Promise<T> {
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;
  const request = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return response.json() as Promise<T>;
    })
    .catch((error) => {
      inflight.delete(url);
      throw error;
    });
  inflight.set(url, request);
  return request as Promise<T>;
}

export class Corpus {
  surahs!: SurahRow[];
  fehres!: Fehres;
  private ayat: AyahRow[] | null = null;
  private align: Record<string, [number, number][]> | null = null;
  private words = new Map<number, WordRow[]>();

  /** Ayah rows grouped by their Madani page (1..604), built once on demand. */
  private pageIndex: AyahRow[][] | null = null;
  /** Row offset of each surah's first ayah in `ayat`, built with the page index. */
  private surahOffset: number[] = [];

  async boot(): Promise<void> {
    const [surahs, fehres] = await Promise.all([
      once<SurahRow[]>("/data/quran/surahs.json"),
      once<Fehres>("/data/fehres/fehres.json"),
    ]);
    this.surahs = surahs;
    this.fehres = fehres;
  }

  async loadText(): Promise<void> {
    if (this.ayat && this.align) return;
    const [ayat, align] = await Promise.all([
      once<AyahRow[]>("/data/quran/ayat.json"),
      once<Record<string, [number, number][]>>("/data/quran/align.json"),
    ]);
    this.ayat = ayat;
    this.align = align;
    const pages: AyahRow[][] = Array.from({ length: 605 }, () => []);
    this.surahOffset = new Array(115).fill(-1);
    ayat.forEach((row, index) => {
      pages[row[3]].push(row);
      if (this.surahOffset[row[0]] < 0) this.surahOffset[row[0]] = index;
    });
    this.pageIndex = pages;
  }

  /** Every ayah printed on Madani page `page` (1..604), in mushaf order. */
  page(page: number): AyahRow[] {
    return this.pageIndex![Math.min(604, Math.max(1, page))];
  }

  ayah(surah: number, ayah: number): AyahRow | null {
    const start = this.surahOffset[surah];
    if (start === undefined || start < 0) return null;
    return this.ayat![start + ayah - 1] ?? null;
  }

  /** The token spans of each word of an ayah, as `align.json` records them. */
  spans(surah: number, ayah: number): [number, number][] {
    return this.align![`${surah}:${ayah}`] ?? [];
  }

  async wordsOf(surah: number): Promise<WordRow[]> {
    const cached = this.words.get(surah);
    if (cached) return cached;
    const rows = await once<WordRow[]>(`/data/quran/words/${String(surah).padStart(3, "0")}.json`);
    this.words.set(surah, rows);
    return rows;
  }

  /** The word stream of one ayah, 1-based by `pos`, aligned to `spans()`. */
  async ayahWords(surah: number, ayah: number): Promise<WordRow[]> {
    const rows = await this.wordsOf(surah);
    return rows.filter((row) => row[0] === ayah);
  }

  wordOccurrences(): Promise<Record<string, number[]>> {
    return once<Record<string, number[]>>("/data/index/word-occ.json");
  }

  rootOccurrences(): Promise<Record<string, number[]>> {
    return once<Record<string, number[]>>("/data/index/root-occ.json");
  }

  /** Walks derived from the 3354 catalogued experiences; values are s*1000+a. */
  paths(): Promise<number[][]> {
    return once<number[][]>("/data/index/paths.json");
  }

  ayahPaths(): Promise<Record<string, number[]>> {
    return once<Record<string, number[]>>("/data/index/ayah-paths.json");
  }

  addressals(): Promise<{ key: string; phrase: string; n: number; loci: [number, number, number][] }[]> {
    return once("/data/addressals/addressals.json");
  }

  markers(): Promise<
    { n: number; source: string; anchors: { anchor: string; how: string; n: number }[]; unresolved: string[]; loci: [number, number, number[]][] }[]
  > {
    return once("/data/markers/markers.json");
  }

  /** The page a given locus is printed on, for the compass scrubber. */
  pageOf(surah: number, ayah: number): number {
    return this.ayah(surah, ayah)?.[3] ?? 1;
  }

  juzOf(surah: number, ayah: number): number {
    return this.ayah(surah, ayah)?.[2] ?? 1;
  }
}

export const corpus = new Corpus();
