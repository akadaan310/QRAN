/**
 * Folding a Quranic token to its bare consonantal form — for *matching* only.
 * Display always uses the untouched canonical string.
 *
 * This mirrors `scripts/build-data/build_infinite.py`'s `normalize`/`variants`
 * exactly, including the dagger alef's genuine ambiguity: in غُلَـٰمٌ it stands
 * for the alef of غلام, in ٱلرَّحْمَـٰنِ it sits over a name written الرحمن.
 * Both foldings are produced and every lookup tries both. If one side of this
 * pair changes, the other must change with it or the runtime will stop
 * finding what the build recorded.
 */

const DAGGER_ALEF = /ٰ/g;
const MARKS = /[ؐ-ًؚ-ٟۖ-ۭـࣰ-ࣿ​-‏۟-ۨ]/g;

const FOLD: Record<string, string> = {
  "ٱ": "ا",
  "أ": "ا",
  "إ": "ا",
  "آ": "ا",
  "ى": "ي",
  "ة": "ه",
  "ی": "ي",
  "ؤ": "و",
  "ئ": "ي",
  "ء": "",
};

export function normalize(text: string, dagger = ""): string {
  let out = "";
  for (const ch of text.replace(DAGGER_ALEF, dagger).replace(MARKS, "")) {
    out += ch in FOLD ? FOLD[ch] : ch;
  }
  return out.trim();
}

export function variants(text: string): string[] {
  const dropped = normalize(text);
  const spelled = normalize(text, "ا");
  return dropped === spelled ? [dropped] : [dropped, spelled];
}

/** True when the Arabic letters the reader typed occur inside a word form. */
export function letterMatch(form: string, query: string): boolean {
  if (!query) return false;
  const folded = normalize(form);
  return variants(query).some((needle) => needle.length > 0 && folded.includes(needle));
}
