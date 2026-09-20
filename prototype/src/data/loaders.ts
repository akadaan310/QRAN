import type {
  Surah, AyahRow, WordRow, AlignSpans, RootEntry, LexiconWordRow, Fehres,
  Experience, Archetype, QalamMarker, VocativeEntry, RootOccurrences,
  WordOccurrences, WordToRoot,
} from "./types";

const BASE = "/data";

function memo<T>(url: string): () => Promise<T> {
  let p: Promise<T> | null = null;
  return () => {
    if (!p) p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`fetch failed: ${url} (${r.status})`);
      return r.json() as Promise<T>;
    });
    return p;
  };
}

// -- upfront (small, or needed by nearly every screen) ---------------------
export const loadSurahs = memo<Surah[]>(`${BASE}/quran/surahs.json`);
export const loadFehres = memo<Fehres>(`${BASE}/fehres/fehres.json`);
export const loadAyat = memo<AyahRow[]>(`${BASE}/quran/ayat.json`);
export const loadAlign = memo<AlignSpans>(`${BASE}/quran/align.json`);

// -- lazy, per-surah ---------------------------------------------------------
const wordCache = new Map<number, Promise<WordRow[]>>();
export function loadSurahWords(surah: number): Promise<WordRow[]> {
  let p = wordCache.get(surah);
  if (!p) {
    const num = String(surah).padStart(3, "0");
    p = fetch(`${BASE}/quran/words/${num}.json`).then((r) => {
      if (!r.ok) throw new Error(`fetch failed: words/${num}.json (${r.status})`);
      return r.json() as Promise<WordRow[]>;
    });
    wordCache.set(surah, p);
  }
  return p;
}

// -- lazy singletons (large; loaded on first real need) --------------------
export const loadRoots = memo<Record<string, RootEntry>>(`${BASE}/lexicon/roots.json`);
export const loadLexiconWords = memo<LexiconWordRow[]>(`${BASE}/lexicon/words.json`);
export const loadExperiences = memo<Experience[]>(`${BASE}/experiences/experiences.json`);
export const loadArchetypes = memo<Archetype[]>(`${BASE}/experiences/archetypes.json`);

// -- derived indices (scripts/build-index.mjs / build-qalam.mjs) -----------
export const loadRootOccurrences = memo<RootOccurrences>(`${BASE}/derived/root-occurrences.json`);
export const loadWordOccurrences = memo<WordOccurrences>(`${BASE}/derived/word-occurrences.json`);
export const loadWordOccurrencesExact = memo<WordOccurrences>(`${BASE}/derived/word-occurrences-exact.json`);
export const loadWordToRoot = memo<WordToRoot>(`${BASE}/derived/word-to-root.json`);
export const loadQalamMarkers = memo<QalamMarker[]>(`${BASE}/derived/qalam-markers.json`);
export const loadVocatives = memo<VocativeEntry[]>(`${BASE}/derived/vocatives.json`);

// -- small helpers built on the above ---------------------------------------

let ayahByLocusCache: Map<string, AyahRow> | null = null;
export async function ayahByLocus(surah: number, ayah: number): Promise<AyahRow | null> {
  if (!ayahByLocusCache) {
    const all = await loadAyat();
    ayahByLocusCache = new Map(all.map((r) => [`${r[0]}:${r[1]}`, r]));
  }
  return ayahByLocusCache.get(`${surah}:${ayah}`) ?? null;
}

let surahByNumCache: Map<number, Surah> | null = null;
export async function surahByNumber(n: number): Promise<Surah | null> {
  if (!surahByNumCache) {
    const all = await loadSurahs();
    surahByNumCache = new Map(all.map((s) => [s.n, s]));
  }
  return surahByNumCache.get(n) ?? null;
}

/** The normative rendering rule (data/README.md): ayah text split on spaces,
 * word i's screen span from align.json, features attached from words/NNN.json. */
export interface RenderedWord {
  i: number; // 1-based word position
  tokens: string[]; // the ayah-text tokens (space-split) this word covers
  row: WordRow;
}
export async function renderedAyahWords(surah: number, ayah: number): Promise<RenderedWord[] | null> {
  const [ayahRow, align, words] = await Promise.all([
    ayahByLocus(surah, ayah),
    loadAlign(),
    loadSurahWords(surah),
  ]);
  if (!ayahRow) return null;
  const text = ayahRow[9];
  const textTokens = text.split(" ");
  const spans = align[`${surah}:${ayah}`] ?? [];
  const ayahWords = words.filter((w) => w[0] === ayah).sort((a, b) => a[1] - b[1]);
  return ayahWords.map((row, idx) => {
    const span = spans[idx];
    const tokens = span ? textTokens.slice(span[0], span[1]) : [row[2]];
    return { i: row[1], tokens, row };
  });
}

export function ayahPlainText(row: AyahRow): string {
  return row[9];
}

let lexiconByTextCache: Map<string, LexiconWordRow> | null = null;
export async function lexiconWordByText(text: string): Promise<LexiconWordRow | null> {
  if (!lexiconByTextCache) {
    const all = await loadLexiconWords();
    lexiconByTextCache = new Map(all.map((r) => [r[0].normalize("NFC"), r]));
  }
  return lexiconByTextCache.get(text.normalize("NFC")) ?? null;
}
