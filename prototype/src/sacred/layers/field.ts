/**
 * ⬔ — a field (§7.1 / §9).
 *
 * One of the thirty QALAM markers, entered from an anchor word in the text.
 * The marker's own phrasing is the owner's proposed reading, not tajwīd,
 * qirāʾāt, linguistics, or doctrine — and §9 settles the matter completely:
 * it is never printed. What the reader gets is the field the marker points
 * at: every ayah its anchor words occur in, with those words lit, titled by
 * the anchor ayah's own text.
 *
 * The full marker text, its provenance and its attribution stay in
 * `references/qalam-30-markers.md`; `data/markers/markers.json` records which
 * of the three resolution passes found each anchor, so the app never has to
 * guess how solid a field is.
 */

import { corpus } from "../corpus";
import { renderAyah } from "../ayah";
import { openLayer, shimmer, stillness } from "../layer";
import { mountOccurrences } from "../occurrences";

export interface FieldLayerContext {
  host: HTMLElement;
  rasm: boolean;
  onJump: (surah: number, ayah: number) => void;
}

export async function openField(
  context: FieldLayerContext,
  number: number,
  seed?: { surah: number; ayah: number }
): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "field";
  const stop = shimmer(layer.body);

  try {
    const markers = await corpus.markers();
    stop();
    const marker = markers.find((entry) => entry.n === number);
    if (!marker || marker.loci.length === 0) {
      stillness(layer.body, () => void openField(context, number, seed));
      return;
    }

    // "Titled by anchor ayah text — the marker's quoted phrase is never
    // printed" (§9). The head is the ayah the reader entered from.
    if (seed) {
      const head = document.createElement("div");
      head.className = "head head--seed";
      head.dir = "rtl";
      head.appendChild(renderAyah(seed.surah, seed.ayah, { rasm: context.rasm, bare: true }));
      layer.body.appendChild(head);
    }
    mountOccurrences(layer.body, {
      loci: marker.loci as [number, number, number[]][],
      rasm: context.rasm,
      onJump: context.onJump,
    });
  } catch {
    stop();
    stillness(layer.body, () => void openField(context, number, seed));
  }
}
