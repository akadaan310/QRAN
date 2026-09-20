/**
 * ◉ — the addressed (§7.3 / §9).
 *
 * The Quran calls its reader by name, again and again. Every vocative
 * addressal is derived from the word stream at build time (يا fused to its
 * addressee in the Uthmani orthography), never from a list someone wrote.
 * Entering one renders every ayah that carries it, in order, as one
 * continuous journey — and the addressal phrase itself, quoted verbatim, is
 * the only heading there is.
 *
 * Where an ayah carries more than one addressal, all of them open: the ayah
 * is addressed more than once, and choosing for the reader would be an
 * invention.
 */

import { corpus } from "../corpus";
import { openLayer, shimmer, stillness } from "../layer";
import { mountOccurrences } from "../occurrences";
import { toRasm } from "../rasm";

export interface AddressedLayerContext {
  host: HTMLElement;
  rasm: boolean;
  onJump: (surah: number, ayah: number) => void;
}

export async function openAddressed(
  context: AddressedLayerContext,
  surah: number,
  ayah: number,
  only?: string
): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "addressed";
  const stop = shimmer(layer.body);

  try {
    const addressals = await corpus.addressals();
    stop();
    const carried = only
      ? addressals.filter((entry) => entry.key === only)
      : addressals.filter((entry) => entry.loci.some(([s, a]) => s === surah && a === ayah));

    if (carried.length === 0) {
      stillness(layer.body, () => void openAddressed(context, surah, ayah, only));
      return;
    }

    for (const entry of carried) {
      const head = document.createElement("div");
      head.className = "head head--phrase";
      head.dir = "rtl";
      head.textContent = context.rasm ? toRasm(entry.phrase) : entry.phrase;
      layer.body.appendChild(head);

      const block = document.createElement("div");
      block.className = "block";
      layer.body.appendChild(block);
      mountOccurrences(block, {
        loci: entry.loci.map(([s, a, position]) => [s, a, [position]] as [number, number, number[]]),
        rasm: context.rasm,
        onJump: context.onJump,
      });
    }
  } catch {
    stop();
    stillness(layer.body, () => void openAddressed(context, surah, ayah, only));
  }
}
