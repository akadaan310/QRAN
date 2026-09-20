/**
 * The canon of marks — FINALITY_PROMPT §9.
 *
 * Exactly eight glyphs, plus dismiss and retry. They are the entire control
 * vocabulary of the app: there are no labels, in any language, anywhere. A
 * glyph is identical on every surface it appears on, which is what makes the
 * wordless first-run lesson sufficient to learn the whole interface.
 *
 * Nothing may be added to this list without the owner's directive changing.
 */
export const GLYPH = {
  /** ✦ word depth — a word opens into its own layer */
  word: "✦",
  /** ❖ root — the bare root letterforms and everything grown from them */
  root: "❖",
  /** ◈ path — an ayah that anchors a walk */
  path: "◈",
  /** ◉ the addressed — an ayah that calls someone by name */
  addressed: "◉",
  /** ⬔ field — a QALAM marker's field, entered from its anchor words */
  field: "⬔",
  /** ◐ rasm — the page between dotted Uthmani and derived skeleton */
  rasm: "◐",
  /** ◍ compass — the wordless index */
  compass: "◍",
  /** ✧ compose — a new journey from where the reader is standing */
  compose: "✧",
} as const;

export type GlyphName = keyof typeof GLYPH;

/** ✕ dismisses any layer, always returning to the exact ayah and position. */
export const DISMISS = "✕";
/** ↻ is the only thing shown when something fails. Stillness, then this. */
export const RETRY = "↻";

/** The four ordering marks of a word or root layer (§9: "4-glyph ordering"). */
export const ORDER = {
  /** ▪ mushaf order — the order the Quran itself is in */
  mushaf: "▪",
  /** ▮ grouped by surah */
  surah: "▮",
  /** ▬ grouped by juz */
  juz: "▬",
  /** ▭ grouped by page */
  page: "▭",
} as const;

export type OrderName = keyof typeof ORDER;
export const ORDER_SEQUENCE: OrderName[] = ["mushaf", "surah", "juz", "page"];

/**
 * A control. The glyph is its own accessible name — deliberately: an
 * `aria-label` would be a word, and §9 admits no words but the Quran's.
 */
export function mark(glyph: string, kind: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "mark";
  button.dataset.mark = kind;
  button.textContent = glyph;
  button.type = "button";
  return button;
}
