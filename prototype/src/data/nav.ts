import type { Locus } from "./types";
import { loadAyat, loadFehres } from "./loaders";

export const SCREEN_SIZE = 15;

let flatLoci: Locus[] | null = null;
let indexByKey: Map<string, number> | null = null;

async function ensureFlat(): Promise<Locus[]> {
  if (!flatLoci) {
    const ayat = await loadAyat();
    flatLoci = ayat.map((r) => ({ surah: r[0], ayah: r[1] }));
    indexByKey = new Map(flatLoci.map((l, i) => [`${l.surah}:${l.ayah}`, i]));
  }
  return flatLoci;
}

export async function totalAyahCount(): Promise<number> {
  return (await ensureFlat()).length;
}

export async function locusAtIndex(i: number): Promise<Locus | null> {
  const flat = await ensureFlat();
  return flat[i] ?? null;
}

export async function indexOfLocus(surah: number, ayah: number): Promise<number | null> {
  await ensureFlat();
  return indexByKey!.get(`${surah}:${ayah}`) ?? null;
}

/** A window of up to `count` consecutive loci starting at `startIndex`,
 * clamped to the corpus — the last screen of the Quran is shorter than 15. */
export async function windowLoci(startIndex: number, count = SCREEN_SIZE): Promise<Locus[]> {
  const flat = await ensureFlat();
  const clampedStart = Math.max(0, Math.min(startIndex, flat.length - 1));
  return flat.slice(clampedStart, clampedStart + count);
}

/** The screen-aligned start index containing `index` (screens are fixed
 * SCREEN_SIZE-wide windows from the very first ayah — surah/juz/page jumps
 * land on whichever screen contains their target locus, not necessarily at
 * lane 1 of that screen, since screens don't reset at those boundaries. */
export function screenStartContaining(index: number): number {
  return Math.floor(index / SCREEN_SIZE) * SCREEN_SIZE;
}

export async function screenStartForSurah(surahNum: number): Promise<number> {
  const idx = await indexOfLocus(surahNum, 1);
  return screenStartContaining(idx ?? 0);
}

export async function screenStartForPage(pageNum: number): Promise<number> {
  const fehres = await loadFehres();
  const page = fehres.pages[pageNum - 1];
  if (!page) return 0;
  const idx = await indexOfLocus(page[1], page[2]);
  return screenStartContaining(idx ?? 0);
}

export async function screenStartForJuz(juzNum: number): Promise<number> {
  const fehres = await loadFehres();
  const juz = fehres.juz[juzNum - 1];
  if (!juz) return 0;
  const idx = await indexOfLocus(juz.s, juz.a);
  return screenStartContaining(idx ?? 0);
}

export async function screenStartForLocus(surah: number, ayah: number): Promise<number> {
  const idx = await indexOfLocus(surah, ayah);
  return screenStartContaining(idx ?? 0);
}

/** Which mushaf page (1..604) a locus falls on, from ayat.json directly. */
export async function pageOfLocus(surah: number, ayah: number): Promise<number | null> {
  const ayat = await loadAyat();
  const row = ayat.find((r) => r[0] === surah && r[1] === ayah);
  return row ? row[3] : null;
}

export async function juzOfLocus(surah: number, ayah: number): Promise<number | null> {
  const ayat = await loadAyat();
  const row = ayat.find((r) => r[0] === surah && r[1] === ayah);
  return row ? row[2] : null;
}
