import { renderTopbar, el } from "./shell";
import { getRouter, goto } from "./routerInstance";
import { loadFehres, loadLexiconWords } from "../data/loaders";
import type { LexiconWordRow } from "../data/types";

type TabId = "surahs" | "juz" | "pages" | "roots" | "experiences";
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "surahs", label: "السور", icon: "📖" },
  { id: "juz", label: "الأجزاء", icon: "◐" },
  { id: "pages", label: "الصفحات", icon: "▤" },
  { id: "roots", label: "الجذور", icon: "🌳" },
  { id: "experiences", label: "التجارب", icon: "✦" },
];

/**
 * الفهرس — the app's home (Phase C). Five sections, plain Arabic + icons,
 * every row a direct jump into the reading canvas or a browsable page. No
 * invented vocabulary — see docs/PHASE-01-UI-SYSTEM.md §6.
 */
export function fehresScreen(_params: Record<string, string>, container: HTMLElement): void {
  renderTopbar(container, getRouter(), "الفهرس", { back: false });

  const body = el("div", "page-body");
  container.appendChild(body);

  const search = el("input", "fehres-search", { type: "search", placeholder: "ابحث عن كلمة، جذرًا، أو سورة…", dir: "rtl" }) as HTMLInputElement;
  body.appendChild(search);

  const searchResults = el("div");
  body.appendChild(searchResults);

  const tabsEl = el("div", "fehres-tabs", { role: "tablist" });
  body.appendChild(tabsEl);
  const content = el("div");
  body.appendChild(content);

  let active: TabId = "surahs";
  const rendered = new Set<TabId>();

  function paintTabs() {
    tabsEl.innerHTML = "";
    for (const t of TABS) {
      const b = el("button", "fehres-tab hit-44", { role: "tab" });
      b.dataset.active = t.id === active ? "1" : "0";
      b.innerHTML = `<span class="fehres-tab__icon">${t.icon}</span><span>${t.label}</span>`;
      b.addEventListener("click", () => { active = t.id; paintTabs(); showTab(t.id); });
      tabsEl.appendChild(b);
    }
  }

  const panels = new Map<TabId, HTMLElement>();
  function showTab(id: TabId) {
    for (const [pid, panel] of panels) panel.hidden = pid !== id;
    if (!panels.has(id)) {
      const panel = el("div");
      panels.set(id, panel);
      content.appendChild(panel);
      mountTab(id, panel);
    }
  }

  async function mountTab(id: TabId, panel: HTMLElement) {
    if (rendered.has(id)) return;
    rendered.add(id);
    const fehres = await loadFehres();
    if (id === "surahs") renderSurahs(panel, fehres);
    else if (id === "juz") renderJuz(panel, fehres);
    else if (id === "pages") renderPages(panel, fehres);
    else if (id === "roots") renderRoots(panel, fehres);
    else if (id === "experiences") renderExperiencesTab(panel);
  }

  paintTabs();
  showTab(active);

  let searchTimer = 0;
  search.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => runSearch(search.value.trim(), searchResults, content, tabsEl), 220);
  });
}

const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
function bare(s: string): string {
  return s.normalize("NFC").replace(HARAKAT, "").replace(/[آأإٱ]/g, "ا").replace(/ى/g, "ي");
}

async function runSearch(qRaw: string, resultsEl: HTMLElement, content: HTMLElement, tabs: HTMLElement): Promise<void> {
  resultsEl.innerHTML = "";
  if (qRaw.length < 2) { content.hidden = false; tabs.hidden = false; return; }
  content.hidden = true; tabs.hidden = true;

  const q = bare(qRaw);
  const words = await loadLexiconWords();
  const matches: LexiconWordRow[] = [];
  for (const row of words) {
    if (bare(row[0]).includes(q)) matches.push(row);
    if (matches.length >= 40) break;
  }

  if (matches.length === 0) {
    resultsEl.appendChild(el("div", "empty-note")).textContent = "لا نتائج — لم يُعثر على هذه الكلمة في المعجم.";
    return;
  }
  for (const [text, root] of matches) {
    const row = el("div", "list-row hit-44", { role: "button", tabindex: "0" });
    row.innerHTML = `<span class="list-row__main">${text}</span>${root ? `<span class="list-row__badge">جذر: ${root}</span>` : ""}`;
    row.addEventListener("click", () => goto(`word/${encodeURIComponent(text)}`));
    resultsEl.appendChild(row);
  }
}

function renderSurahs(panel: HTMLElement, fehres: Awaited<ReturnType<typeof loadFehres>>): void {
  for (const s of fehres.surahs) {
    const row = el("div", "list-row hit-44", { role: "button", tabindex: "0" });
    row.innerHTML = `
      <span class="list-row__main">${s.n}. ${s.ar}</span>
      <span style="display:flex;gap:8px;align-items:center">
        <span class="list-row__meta">${s.ayahs} آية</span>
        <span class="list-row__badge">${s.type === "مكية" ? "مكية" : "مدنية"}</span>
      </span>`;
    row.addEventListener("click", () => goto(`surah/${s.n}`));
    panel.appendChild(row);
  }
}

function renderJuz(panel: HTMLElement, fehres: Awaited<ReturnType<typeof loadFehres>>): void {
  for (const j of fehres.juz) {
    const row = el("div", "list-row hit-44", { role: "button", tabindex: "0" });
    row.innerHTML = `<span class="list-row__main">الجزء ${j.n}</span><span class="list-row__meta">${j.s}:${j.a} — صفحة ${j.page}</span>`;
    row.addEventListener("click", () => goto(`juz/${j.n}`));
    panel.appendChild(row);
  }
}

function renderPages(panel: HTMLElement, fehres: Awaited<ReturnType<typeof loadFehres>>): void {
  const grid = el("div", "page-grid");
  fehres.pages.forEach((p) => {
    const btn = el("button");
    btn.textContent = String(p[0]);
    btn.addEventListener("click", () => goto(`page/${p[0]}`));
    grid.appendChild(btn);
  });
  panel.appendChild(grid);
}

function renderRoots(panel: HTMLElement, fehres: Awaited<ReturnType<typeof loadFehres>>): void {
  const input = el("input", "root-search", { type: "search", placeholder: "رشّح الجذور بحسب الحروف…", dir: "rtl" }) as HTMLInputElement;
  panel.appendChild(input);
  const list = el("div");
  panel.appendChild(list);

  function paint(filter: string) {
    list.innerHTML = "";
    const f = bare(filter);
    const rows = fehres.root_rank.filter(([r]) => !f || bare(r).includes(f)).slice(0, 300);
    for (const [root, count] of rows) {
      const row = el("div", "list-row hit-44", { role: "button", tabindex: "0" });
      row.innerHTML = `<span class="list-row__main">${root}</span><span class="list-row__meta">${count} ورودًا</span>`;
      row.addEventListener("click", () => goto(`root/${encodeURIComponent(root)}`));
      list.appendChild(row);
    }
    if (rows.length === 0) list.appendChild(el("div", "empty-note")).textContent = "لا جذور مطابقة.";
  }
  paint("");
  let t = 0;
  input.addEventListener("input", () => { window.clearTimeout(t); t = window.setTimeout(() => paint(input.value), 150); });
}

function renderExperiencesTab(panel: HTMLElement): void {
  const btn = el("button", "surprise-btn hit-44");
  btn.textContent = "تصفّح ٣٬٣٥٤ تجربة →";
  btn.addEventListener("click", () => goto("experiences"));
  panel.appendChild(btn);
  const note = el("div", "empty-note");
  note.style.textAlign = "start";
  note.textContent = "اكتشافات، أنماط متكررة، وصيغ عابرة للسور — كلٌّ منها بلغته العربية الخاصة، ومرتبط بنصّه الحقيقي.";
  panel.appendChild(note);
}
