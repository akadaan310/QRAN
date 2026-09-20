import { el } from "./shell";
import { goto } from "./routerInstance";
import { renderedAyahWords, ayahByLocus, surahByNumber } from "../data/loaders";
import { screenStartForLocus } from "../data/nav";

export type OrderMode = "mushaf" | "surah" | "juz" | "page";
const ORDER_LABELS: Record<OrderMode, string> = { mushaf: "مصحفي", surah: "بالسورة", juz: "بالجزء", page: "بالصفحة" };

const PAGE_SIZE = 40;

/**
 * The shared "every occurrence, rendered as real ayah text, tappable to
 * jump" list — §7.2's word and root pages both use this. Orderable, lazily
 * paginated (some words/roots run into the hundreds of occurrences).
 */
export function renderOccurrenceList(
  container: HTMLElement,
  loci: [number, number, number][], // [surah, ayah, wordPos][]
  countLabel: (n: number) => string,
): void {
  const header = el("div");
  header.style.margin = "6px 0";
  header.style.fontFamily = "var(--font-apparatus)";
  header.style.fontSize = "12px";
  header.style.color = "var(--color-text-quiet)";
  header.textContent = countLabel(loci.length);
  container.appendChild(header);

  const tabs = el("div", "order-tabs");
  container.appendChild(tabs);
  const list = el("div");
  container.appendChild(list);

  let mode: OrderMode = "mushaf";
  let shown = PAGE_SIZE;

  function paintTabs() {
    tabs.innerHTML = "";
    (Object.keys(ORDER_LABELS) as OrderMode[]).forEach((m) => {
      const b = el("button", "order-tab hit-44");
      b.dataset.active = m === mode ? "1" : "0";
      b.textContent = ORDER_LABELS[m];
      b.addEventListener("click", () => { mode = m; shown = PAGE_SIZE; paintTabs(); void paintList(); });
      tabs.appendChild(b);
    });
  }

  async function groupKeyAndLabel(locus: [number, number, number]): Promise<{ key: string; label: string }> {
    const [s, a] = locus;
    if (mode === "surah") {
      const surah = await surahByNumber(s);
      return { key: `s${s}`, label: surah ? `${surah.n}. ${surah.ar}` : String(s) };
    }
    const row = await ayahByLocus(s, a);
    if (mode === "juz") return { key: `j${row?.[2]}`, label: `الجزء ${row?.[2] ?? "؟"}` };
    if (mode === "page") return { key: `p${row?.[3]}`, label: `صفحة ${row?.[3] ?? "؟"}` };
    return { key: "flat", label: "" };
  }

  async function paintList(): Promise<void> {
    list.innerHTML = "";
    const ordered = [...loci];
    if (mode !== "mushaf") {
      // stable sort by the grouping key's natural order, which for
      // surah/juz/page all coincide with ascending [surah, ayah] already
      ordered.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
    }
    const slice = ordered.slice(0, shown);
    let lastKey: string | null = null;

    for (const locus of slice) {
      if (mode !== "mushaf") {
        const { key, label } = await groupKeyAndLabel(locus);
        if (key !== lastKey) {
          lastKey = key;
          const h = el("div", "list-row__meta");
          h.style.margin = "14px 2px 4px";
          h.style.color = "var(--color-accent)";
          h.textContent = label;
          list.appendChild(h);
        }
      }
      list.appendChild(await renderOccurrenceRow(locus));
    }

    if (shown < loci.length) {
      const more = el("button", "onboarding__btn onboarding__btn--primary hit-44");
      more.style.width = "100%";
      more.style.marginTop = "10px";
      more.textContent = `أظهر المزيد (${loci.length - shown} متبقّ)`;
      more.addEventListener("click", () => { shown += PAGE_SIZE; void paintList(); });
      list.appendChild(more);
    }
  }

  paintTabs();
  void paintList();
}

async function renderOccurrenceRow(locus: [number, number, number]): Promise<HTMLElement> {
  const [surah, ayah, pos] = locus;
  const row = el("div", "occurrence-row hit-44", { role: "button", tabindex: "0" });
  const words = await renderedAyahWords(surah, ayah);
  const html = words
    ? words.map((w) => (w.i === pos ? `<mark>${escapeHtml(w.tokens.join(" "))}</mark>` : escapeHtml(w.tokens.join(" ")))).join(" ")
    : "";
  row.innerHTML = `<div class="occurrence-row__locus">${surah}:${ayah}</div><div class="occurrence-row__text" dir="rtl">${html}</div>`;
  row.addEventListener("click", () => void jumpTo(surah, ayah));
  return row;
}

async function jumpTo(surah: number, ayah: number): Promise<void> {
  const idx = await screenStartForLocus(surah, ayah);
  goto(`read/${idx}`);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
