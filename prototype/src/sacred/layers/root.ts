/**
 * ❖ — the root (§7.2 / §9).
 *
 * The bare root letterforms at the head, then every ayah in which anything
 * grown from that root occurs, with those words lit. The lexicon's glosses,
 * classical definitions and maṣādir stay canonical in `data/lexicon` and are
 * deliberately not rendered: §9 revoked definition prose, and the Quran
 * defines its roots by using them. This layer *is* that definition.
 */

import { corpus } from "../corpus";
import { openLayer, shimmer, stillness } from "../layer";
import { mountOccurrences } from "../occurrences";

export interface RootLayerContext {
  host: HTMLElement;
  rasm: boolean;
  onJump: (surah: number, ayah: number) => void;
}

export async function openRoot(context: RootLayerContext, root: string): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "root";
  const stop = shimmer(layer.body);

  try {
    const index = await corpus.rootOccurrences();
    stop();
    const head = document.createElement("div");
    head.className = "head head--root";
    head.dir = "rtl";
    // The root's letters, spaced apart: a root is not a word, and showing it
    // as one would be a small lie about what the reader is looking at.
    head.textContent = [...root].join(" ");
    layer.body.appendChild(head);

    mountOccurrences(layer.body, {
      packed: index[root] ?? [],
      rasm: context.rasm,
      onJump: context.onJump,
    });
  } catch {
    stop();
    stillness(layer.body, () => void openRoot(context, root));
  }
}
