/**
 * ✧ — composing (§7.4 / §8.4 / §9).
 *
 * Not a "surprise me" button and not a shuffle over a fixed list: a journey
 * built from where the reader is standing. The seed is the ayah on screen,
 * and the composition is drawn from that ayah's own material, in this order
 * of preference:
 *
 *   1. an addressal the seed carries      — the arc of everyone it calls;
 *   2. a marker whose anchor the seed uses — that marker's whole field;
 *   3. the seed's least common root        — everywhere else it grows.
 *
 * Rule 3 always has an answer for any ayah with a rooted word, so ✧ is never
 * a dead end. Preferring the *least* common root is what makes composing feel
 * like discovery rather than like landing on قول every time: a rare root
 * carries the reader somewhere they would not otherwise have gone.
 */

import { corpus } from "../corpus";
import { openLayer, shimmer, stillness, breathe } from "../layer";
import { mountOccurrences } from "../occurrences";
import { variants } from "../normalize";
import { toRasm } from "../rasm";

export interface ComposeContext {
  host: HTMLElement;
  rasm: boolean;
  onJump: (surah: number, ayah: number) => void;
}

export async function openCompose(context: ComposeContext, surah: number, ayah: number): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "compose";
  const stop = shimmer(layer.body);

  try {
    const [words, addressals, markers, roots] = await Promise.all([
      corpus.ayahWords(surah, ayah),
      corpus.addressals(),
      corpus.markers(),
      corpus.rootOccurrences(),
    ]);
    stop();

    // 1 — an addressal this ayah carries
    const addressal = addressals.find((entry) => entry.loci.some(([s, a]) => s === surah && a === ayah));
    if (addressal) {
      const head = document.createElement("div");
      head.className = "head head--phrase";
      head.dir = "rtl";
      head.textContent = context.rasm ? toRasm(addressal.phrase) : addressal.phrase;
      layer.body.appendChild(head);
      mountOccurrences(layer.body, {
        loci: addressal.loci.map(([s, a, p]) => [s, a, [p]] as [number, number, number[]]),
        rasm: context.rasm,
        onJump: context.onJump,
      });
      breathe(layer.root);
      return;
    }

    // 2 — a marker anchored by one of this ayah's words
    const folded = new Set(words.flatMap((row) => variants(row[2])));
    const marker = markers.find((entry) =>
      entry.anchors.some((anchor) => variants(anchor.anchor).some((key) => folded.has(key)))
    );
    if (marker && marker.loci.length > 1) {
      mountOccurrences(layer.body, {
        loci: marker.loci as [number, number, number[]][],
        rasm: context.rasm,
        onJump: context.onJump,
      });
      breathe(layer.root);
      return;
    }

    // 3 — the seed's least common root
    const rooted = words
      .map((row) => row[3])
      .filter((root): root is string => Boolean(root) && (roots[root!]?.length ?? 0) > 1);
    if (rooted.length === 0) {
      stillness(layer.body, () => void openCompose(context, surah, ayah));
      return;
    }
    const rarest = rooted.reduce((best, root) => (roots[root].length < roots[best].length ? root : best), rooted[0]);
    const head = document.createElement("div");
    head.className = "head head--root";
    head.dir = "rtl";
    head.textContent = [...rarest].join(" ");
    layer.body.appendChild(head);
    mountOccurrences(layer.body, {
      packed: roots[rarest],
      rasm: context.rasm,
      onJump: context.onJump,
    });
    breathe(layer.root);
  } catch {
    stop();
    stillness(layer.body, () => void openCompose(context, surah, ayah));
  }
}
