import { windowLoci, totalAyahCount, screenStartContaining, SCREEN_SIZE, pageOfLocus, juzOfLocus } from "../data/nav";
import { buildScreen } from "../data/screenBuilder";
import { mountCanvasScreen } from "./canvasHost";
import { goto } from "./routerInstance";

/**
 * Hosts the reading-canvas engine (unchanged from Phase 1: Store,
 * CanvasView, governor, gestures, HUD, features) against a real,
 * consecutive window of the corpus instead of a fixture page. Phase A.
 */
export async function readerScreen(params: Record<string, string>, container: HTMLElement): Promise<() => void> {
  const startIndex = Math.max(0, Number(params.idx) || 0);
  const total = await totalAyahCount();
  const alignedStart = Math.min(screenStartContaining(startIndex), Math.max(0, total - 1));

  const loci = await windowLoci(alignedStart, SCREEN_SIZE);
  const page = await buildScreen(`screen-${alignedStart}`, loci);

  const first = loci[0];
  const [pageNo, juzNo] = first ? await Promise.all([pageOfLocus(first.surah, first.ayah), juzOfLocus(first.surah, first.ayah)]) : [null, null];

  return mountCanvasScreen(container, page, {
    onPrev: alignedStart > 0 ? () => goto(`read/${Math.max(0, alignedStart - SCREEN_SIZE)}`) : undefined,
    onNext: alignedStart + SCREEN_SIZE < total ? () => goto(`read/${Math.min(total - 1, alignedStart + SCREEN_SIZE)}`) : undefined,
    locusText: `صفحة ${pageNo ?? "؟"} · الجزء ${juzNo ?? "؟"}`,
  });
}
