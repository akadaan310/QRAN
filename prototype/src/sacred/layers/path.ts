/**
 * ◈ — a path (§9).
 *
 * The 3354 catalogued experiences are entry points reached from the text, not
 * a catalog screen. Tapping the margin mark on an ayah opens the walks that
 * pass through it as a constellation of complete ayahs — no cards, no titles,
 * no curator notes. The seed ayah is the title.
 *
 * The experiences' own Arabic titles and notes are real scholarship-adjacent
 * material and stay in `data/experiences/experiences.json` as the provenance
 * of record; §9 simply does not render them, because they are not the Quran's
 * own words.
 *
 * Where a walk turns out to be a single ayah — 750 of the catalogued
 * experiences are — ✧ is offered instead of an empty list, so no walk ends in
 * nothing.
 */

import { corpus, ayahKey, unpack } from "../corpus";
import { renderAyah } from "../ayah";
import { GLYPH, mark } from "../glyphs";
import { openLayer, shimmer, stillness } from "../layer";
import { mountOccurrences } from "../occurrences";

export interface PathLayerContext {
  host: HTMLElement;
  rasm: boolean;
  onJump: (surah: number, ayah: number) => void;
  onCompose: (surah: number, ayah: number) => void;
}

export async function openPath(context: PathLayerContext, surah: number, ayah: number): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "path";
  const stop = shimmer(layer.body);

  try {
    const [walks, anchored] = await Promise.all([corpus.paths(), corpus.ayahPaths()]);
    stop();
    const ids = anchored[String(ayahKey(surah, ayah))] ?? [];

    // "The seed ayah is the title" (§9): the walk is headed by the ayah the
    // reader opened it from, in its own words, and by nothing else.
    const head = document.createElement("div");
    head.className = "head head--seed";
    head.dir = "rtl";
    head.appendChild(renderAyah(surah, ayah, { rasm: context.rasm, bare: true }));
    layer.body.appendChild(head);

    // Every ayah every walk through here touches, in mushaf order, the seed
    // itself included — the constellation the reader is standing inside.
    const constellation = new Set<number>([ayahKey(surah, ayah)]);
    for (const id of ids) for (const key of walks[id] ?? []) constellation.add(key);

    const loci = [...constellation]
      .sort((a, b) => a - b)
      .map((key) => [Math.floor(key / 1000), key % 1000, []] as [number, number, number[]]);

    if (loci.length <= 1) {
      const glyph = mark(GLYPH.compose, "compose");
      glyph.addEventListener("click", () => context.onCompose(surah, ayah));
      layer.rail.appendChild(glyph);
    }

    mountOccurrences(layer.body, {
      loci,
      rasm: context.rasm,
      onJump: context.onJump,
    });
  } catch {
    stop();
    stillness(layer.body, () => void openPath(context, surah, ayah));
  }
}

/** Used by ✧ when it composes a walk from wherever the reader is standing. */
export function walkKeys(walks: number[][], ids: number[]): { surah: number; ayah: number }[] {
  const keys = new Set<number>();
  for (const id of ids) for (const key of walks[id] ?? []) keys.add(key);
  return [...keys].sort((a, b) => a - b).map((key) => unpack(key * 1000));
}
