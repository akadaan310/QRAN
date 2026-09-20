/**
 * One ayah, rendered.
 *
 * This is the only place in the app that turns corpus data into visible text,
 * and it follows `data/README.md`'s normative rendering rule exactly:
 *
 *   1. take the ayah's text from `ayat.json` and split it on spaces;
 *   2. word *i* of the ayah is row *i* of the surah's word stream;
 *   3. its screen span is `align.json["s:a"][i]` — token indices into that
 *      split text. Alignment is never re-derived at runtime.
 *
 * Pause marks and other orthography that live in the ayah text but not in the
 * word stream therefore stay exactly where the muṣḥaf puts them: they fall in
 * the gaps between spans and render as plain text, attached to no word.
 */

import { corpus } from "./corpus";
import { endMarker } from "./numerals";
import { toRasm } from "./rasm";

export interface AyahOptions {
  /** 1-based word positions to mark as the reason this ayah is on screen. */
  highlight?: number[];
  /** Render the dotless skeleton instead of the dotted text. */
  rasm?: boolean;
  /** Omit the ۝ rosette (used where an ayah is quoted inside a layer). */
  bare?: boolean;
  /**
   * Stop after this many words. Used where an ayah has to fit a small cell:
   * cutting on a word boundary leaves a true prefix of the ayah, where a CSS
   * clamp would leave the browser's ellipsis — a mark that is not the Quran's
   * and not one of the eight (§9).
   */
  limit?: number;
}

/**
 * Build the ayah as a fragment of word spans. Returns the element so callers
 * can position margin marks against it.
 */
export function renderAyah(surah: number, ayah: number, options: AyahOptions = {}): HTMLElement {
  const row = corpus.ayah(surah, ayah);
  const node = document.createElement("span");
  node.className = "ayah";
  node.dataset.s = String(surah);
  node.dataset.a = String(ayah);
  if (!row) return node;

  const tokens = row[9].trim().split(/\s+/);
  const spans = corpus.spans(surah, ayah);
  const highlight = new Set(options.highlight ?? []);

  // token index -> the 1-based word position that owns it
  const owner = new Map<number, number>();
  spans.forEach(([from, to], index) => {
    for (let token = from; token < to; token += 1) owner.set(token, index + 1);
  });

  let rendered = 0;
  let position = 0;
  while (position < tokens.length) {
    if (options.limit !== undefined && rendered >= options.limit) break;
    const word = owner.get(position);
    if (word === undefined) {
      // Orthography between words — a pause mark, a sajdah sign. It belongs to
      // the line, not to any word, and is never a tap target.
      const loose = document.createElement("span");
      loose.className = "ayah__loose";
      loose.textContent = options.rasm ? toRasm(tokens[position]) : tokens[position];
      node.append(loose, document.createTextNode(" "));
      position += 1;
      continue;
    }
    const [from, to] = spans[word - 1];
    const text = tokens.slice(from, to).join(" ");
    const span = document.createElement("span");
    span.className = "w";
    span.dataset.s = String(surah);
    span.dataset.a = String(ayah);
    span.dataset.p = String(word);
    if (highlight.has(word)) span.dataset.lit = "1";
    span.textContent = options.rasm ? toRasm(text) : text;
    node.append(span, document.createTextNode(" "));
    rendered += 1;
    position = to;
  }

  if (!options.bare && options.limit === undefined) {
    const rosette = document.createElement("span");
    rosette.className = "ayah__end";
    rosette.textContent = endMarker(ayah);
    node.appendChild(rosette);
  }
  return node;
}

/** The same ayah as a single quiet line, used inside layers. */
export function renderAyahLine(surah: number, ayah: number, options: AyahOptions = {}): HTMLElement {
  const line = document.createElement("div");
  line.className = "line";
  line.dataset.s = String(surah);
  line.dataset.a = String(ayah);
  line.appendChild(renderAyah(surah, ayah, options));
  return line;
}
