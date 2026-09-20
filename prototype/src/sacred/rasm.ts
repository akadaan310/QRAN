/**
 * ◐ — the dotless skeleton, derived at render time.
 *
 * FINALITY_PROMPT §5 / §7.5: this is a *display transform* of the canonical
 * string. It is never stored, never canonical, never a manuscript claim. It
 * strips the vowel marks and the iʿjām (the dots that distinguish letters
 * sharing one stroke) and returns the bare rasm — offered as beholding.
 *
 * The folding table below is the consonant-skeleton grouping of the Arabic
 * script: letters written with the same base stroke collapse onto the
 * undotted member of their group. This is a typographic approximation of an
 * undotted script, not a paleographic reconstruction of any manuscript.
 */

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ࣰۭ-ࣿ]/g;

// group -> the undotted stroke the group is written with
const SKELETON: Record<string, string> = {
  // ba / ta / tha / (nun medial) share the tooth
  "ب": "ٮ", "ت": "ٮ", "ث": "ٮ",
  // jim / ha / kha
  "ج": "ح", "خ": "ح",
  // dal / dhal
  "ذ": "د",
  // ra / zay
  "ز": "ر",
  // sin / shin
  "ش": "س",
  // sad / dad
  "ض": "ص",
  // ta / za
  "ظ": "ط",
  // ayn / ghayn
  "غ": "ع",
  // fa / qaf — both on the undotted fa stroke
  "ف": "ڡ", "ق": "ٯ",
  // nun — dotless final form
  "ن": "ں",
  // ya / alef maqsura — dotless ya
  "ي": "ی", "ى": "ی",
  // ta marbuta is a ha with dots
  "ة": "ه",
  // hamza seats keep their seat, lose the hamza
  "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",
  "ؤ": "و", "ئ": "ی",
};

/** The canonical string as its bare undotted stroke sequence. */
export function toRasm(text: string): string {
  let out = "";
  for (const ch of text.replace(MARKS, "")) out += SKELETON[ch] ?? ch;
  return out;
}
