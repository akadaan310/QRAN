/**
 * ✦ — word depth (§7.2 / §9).
 *
 * The word rendered large in Uthmani, then every occurrence of that exact
 * form in the Quran as its complete ayah text, orderable by the four marks.
 * No part of speech, no transliteration, no translation: the corpus carries
 * all three and §9 renders none of them. A word is explained by where else
 * it stands.
 *
 * Two doors lead onward, and they appear only when there is somewhere to go:
 * ❖ to the word's root, ⬔ where the word is an anchor of one of the thirty
 * markers. Nothing here is ever a dead end.
 */

import { corpus } from "../corpus";
import { GLYPH, mark } from "../glyphs";
import { openLayer, shimmer, stillness } from "../layer";
import { mountOccurrences } from "../occurrences";
import { variants } from "../normalize";
import { toRasm } from "../rasm";

export interface WordLayerContext {
  host: HTMLElement;
  rasm: boolean;
  onJump: (surah: number, ayah: number) => void;
  onRoot: (root: string) => void;
  onField: (marker: number, seed: { surah: number; ayah: number }) => void;
}

export async function openWord(
  context: WordLayerContext,
  surah: number,
  ayah: number,
  position: number
): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "word";
  const stop = shimmer(layer.body);

  try {
    const [words, occurrences, markers] = await Promise.all([
      corpus.ayahWords(surah, ayah),
      corpus.wordOccurrences(),
      corpus.markers(),
    ]);
    stop();

    const row = words.find((entry) => entry[1] === position);
    if (!row) {
      stillness(layer.body, () => void openWord(context, surah, ayah, position));
      return;
    }
    const [, , text, root] = row;

    const head = document.createElement("div");
    head.className = "head";
    head.dir = "rtl";
    head.textContent = context.rasm ? toRasm(text) : text;
    layer.body.appendChild(head);

    if (root) {
      const glyph = mark(GLYPH.root, "root");
      glyph.addEventListener("click", () => context.onRoot(root));
      layer.rail.appendChild(glyph);
    }

    // A word is a marker anchor when the build recorded it as one — the same
    // folding on both sides, so the runtime never re-derives what the build
    // already decided.
    const folded = new Set(variants(text));
    for (const marker of markers) {
      if (!marker.anchors.some((anchor) => variants(anchor.anchor).some((key) => folded.has(key)))) continue;
      const glyph = mark(GLYPH.field, "field");
      glyph.addEventListener("click", () => context.onField(marker.n, { surah, ayah }));
      layer.rail.appendChild(glyph);
      break;
    }

    mountOccurrences(layer.body, {
      packed: occurrences[text] ?? [],
      rasm: context.rasm,
      onJump: (s, a) => context.onJump(s, a),
    });
  } catch {
    stop();
    stillness(layer.body, () => void openWord(context, surah, ayah, position));
  }
}
