/**
 * Rasm skeleton — §7.5 "the rasm as sacred display". A *display transform*
 * computed at render time from the canonical Uthmani string; never stored
 * as Quran text, never a manuscript claim (see docs/PHASE-01-UI-SYSTEM.md
 * §6 and prototype/data/SOURCES.md for the exact letter-grouping table this
 * mirrors from scripts/gen-fixtures.mjs — kept in sync by hand since it's a
 * tiny, stable mapping, not a build artifact).
 */
const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭࣔ-ࣿـ]/g;
const RASM_MAP: Record<string, string> = {
  "ب":"ب","ت":"ب","ة":"ه","ث":"ب","ن":"ب","ي":"ب","ى":"ب","ئ":"ب",
  "ج":"ح","ح":"ح","خ":"ح",
  "د":"د","ذ":"د",
  "ر":"ر","ز":"ر",
  "س":"س","ش":"س",
  "ص":"ص","ض":"ص",
  "ط":"ط","ظ":"ط",
  "ع":"ع","غ":"ع",
  "ف":"ف","ق":"ق","ك":"ك","ل":"ل","م":"م","ه":"ه",
  "و":"و","ؤ":"و",
  "ا":"ا","أ":"ا","إ":"ا","آ":"ا","ء":"ا","ٱ":"ا","ٰ":"ا",
};

export function toRasmSkeleton(marked: string): string {
  const bare = marked.normalize("NFC").replace(HARAKAT, "");
  let out = "";
  for (const ch of bare) out += RASM_MAP[ch] ?? ch;
  return out;
}
