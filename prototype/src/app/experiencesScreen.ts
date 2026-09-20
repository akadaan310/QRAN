import { renderTopbar, el } from "./shell";
import { getRouter, goto } from "./routerInstance";
import { loadExperiences, loadArchetypes, loadSurahs, loadQalamMarkers, loadVocatives } from "../data/loaders";
import type { Experience } from "../data/types";

type Tab = "categories" | "surah" | "archetypes" | "qalam" | "vocatives";
const PAGE_SIZE = 30;

export const CAT_LABELS: Record<string, string> = {
  discovery: "اكتشافات",
  motif: "أنماط متكررة",
  formula: "صيغ عابرة للسور",
  // discovery sub-categories: isnaad's own internal slugs (Latin) mapped to
  // the real Arabic category name shared by every title in that category
  // (verified against the data, not invented — see QA_NOTES.md).
  istihdar: "استحضار الغائب إلى الخطاب",
  ribat: "رِباط الملتقى",
  "raj-al-jidhr": "رجع الجذر",
  "jisr-al-naba": "جسر النبأ إلى الزمن الحاضر",
  "alsinat-al-khalq": "مقعد الإسناد",
  "tabaqat-al-isnad": "قولٌ في جوف قول",
  "rusul-echo": "لسان الرسل",
};

/**
 * Phase D — the experiences browser. Browsable by category (the source
 * projects' own Arabic-rooted kinds), by surah, by the 8 archetype
 * profiles (reference cards — see note below), and shuffled. §7.1/§7.3
 * extend the same hub with the 30 QALAM scenarios and the vocative
 * addressal journeys, both generated live from real corpus search rather
 * than drawn from the 3354-item catalog.
 */
export async function experiencesScreen(_params: Record<string, string>, container: HTMLElement): Promise<void> {
  renderTopbar(container, getRouter(), "التجارب");
  const body = el("div", "page-body");
  container.appendChild(body);

  const surprise = el("button", "surprise-btn hit-44");
  surprise.textContent = "فاجئني ✦";
  body.appendChild(surprise);

  const tabsEl = el("div", "exp-filters");
  body.appendChild(tabsEl);
  const content = el("div");
  body.appendChild(content);

  const [experiences, archetypes] = await Promise.all([loadExperiences(), loadArchetypes()]);
  surprise.addEventListener("click", () => surpriseMe(experiences));

  const tabs: { id: Tab; label: string }[] = [
    { id: "categories", label: "التصنيفات" },
    { id: "surah", label: "بالسورة" },
    { id: "archetypes", label: "الأنماط الأساسية" },
    { id: "qalam", label: "علامات القلم" },
    { id: "vocatives", label: "النداءات" },
  ];
  let active: Tab = "categories";

  function paintTabs() {
    tabsEl.innerHTML = "";
    for (const t of tabs) {
      const b = el("button", "fehres-tab hit-44");
      b.dataset.active = t.id === active ? "1" : "0";
      b.textContent = t.label;
      b.addEventListener("click", () => { active = t.id; paintTabs(); void paintContent(); });
      tabsEl.appendChild(b);
    }
  }

  async function paintContent() {
    content.innerHTML = "";
    if (active === "categories") renderCategories(content, experiences);
    else if (active === "surah") await renderBySurah(content, experiences);
    else if (active === "archetypes") renderArchetypes(content, archetypes);
    else if (active === "qalam") await renderQalamList(content);
    else if (active === "vocatives") await renderVocativesList(content);
  }

  paintTabs();
  void paintContent();
}

function renderExperienceCard(exp: Experience): HTMLElement {
  const card = el("div", "exp-card hit-44", { role: "button", tabindex: "0" });
  const kindLabel = exp.kind === "discovery" ? (CAT_LABELS[exp.cat] ?? exp.cat) : exp.kind === "motif" ? "نمط متكرر" : "صيغة متكررة";
  card.innerHTML = `
    <div class="exp-card__title">${exp.title}</div>
    <div class="exp-card__meta">${kindLabel} · ${exp.loci.length} موضعًا</div>
    ${exp.note ? `<div class="exp-card__note">${exp.note}</div>` : ""}`;
  card.addEventListener("click", () => goto(`experience/${encodeURIComponent(exp.id)}`));
  return card;
}

function renderCategories(container: HTMLElement, experiences: Experience[]): void {
  const cats = [...new Set(experiences.map((e) => (e.kind === "discovery" ? `discovery:${e.cat}` : e.kind)))];
  const filterRow = el("div", "exp-filters");
  container.appendChild(filterRow);
  const list = el("div");
  container.appendChild(list);
  let shown = PAGE_SIZE;
  let currentCat = "all";

  function chip(id: string, label: string) {
    const b = el("button", "fehres-tab hit-44");
    b.dataset.active = currentCat === id ? "1" : "0";
    b.textContent = label;
    b.addEventListener("click", () => { currentCat = id; shown = PAGE_SIZE; paint(); paintChips(); });
    return b;
  }
  function paintChips() {
    filterRow.innerHTML = "";
    filterRow.appendChild(chip("all", `الكل (${experiences.length})`));
    for (const c of cats) {
      const [kind, sub] = c.split(":");
      const label = sub ? CAT_LABELS[sub] ?? sub : CAT_LABELS[kind] ?? kind;
      const count = experiences.filter((e) => (e.kind === "discovery" ? `discovery:${e.cat}` : e.kind) === c).length;
      filterRow.appendChild(chip(c, `${label} (${count})`));
    }
  }
  function paint() {
    list.innerHTML = "";
    const filtered = currentCat === "all" ? experiences : experiences.filter((e) => (e.kind === "discovery" ? `discovery:${e.cat}` : e.kind) === currentCat);
    for (const e of filtered.slice(0, shown)) list.appendChild(renderExperienceCard(e));
    if (shown < filtered.length) {
      const more = el("button", "onboarding__btn onboarding__btn--primary hit-44");
      more.style.width = "100%";
      more.textContent = `أظهر المزيد (${filtered.length - shown} متبقّ)`;
      more.addEventListener("click", () => { shown += PAGE_SIZE; paint(); });
      list.appendChild(more);
    }
  }
  paintChips();
  paint();
}

async function renderBySurah(container: HTMLElement, experiences: Experience[]): Promise<void> {
  const surahs = await loadSurahs();
  const select = el("select", "root-search") as HTMLSelectElement;
  select.innerHTML = surahs.map((s) => `<option value="${s.n}">${s.n}. ${s.ar}</option>`).join("");
  container.appendChild(select);
  const list = el("div");
  container.appendChild(list);
  function paint() {
    const n = Number(select.value);
    list.innerHTML = "";
    const filtered = experiences.filter((e) => e.loci.some((l) => l[0] === n));
    if (filtered.length === 0) { list.appendChild(el("div", "empty-note")).textContent = "لا تجارب مسجّلة تمسّ هذه السورة."; return; }
    for (const e of filtered.slice(0, PAGE_SIZE)) list.appendChild(renderExperienceCard(e));
  }
  select.addEventListener("change", paint);
  paint();
}

function renderArchetypes(container: HTMLElement, archetypes: Awaited<ReturnType<typeof loadArchetypes>>): void {
  const note = el("div", "empty-note");
  note.style.textAlign = "start";
  note.textContent = "الأنماط الثمانية التي يصنّفها التحليل البنيوي لهذا المشروع — بطاقات مرجعية بلغة عامّية مقصودة، لا تصنيفًا للتجارب أعلاه (مصدرها مختلف؛ انظر data/SOURCES.md).";
  container.appendChild(note);
  for (const a of archetypes) {
    const card = el("div", "exp-card");
    card.innerHTML = `<div class="exp-card__title">${a.name_ar}</div><div class="exp-card__meta">${a.name_en} · ${a.ledger_rows} سطرًا في السجل</div><div class="exp-card__note">${a.runway}</div>`;
    container.appendChild(card);
  }
}

async function renderQalamList(container: HTMLElement): Promise<void> {
  const markers = await loadQalamMarkers();
  const note = el("div", "empty-note");
  note.style.textAlign = "start";
  note.textContent = "٣٠ علامة اقترحها صاحب المشروع — قراءات مقترحة، منسوبة إليه، وليست تفسيرًا. كلٌّ منها مشهدٌ يُشتقّ مواضعه حيًّا من بحث الكلمة/الجذر.";
  container.appendChild(note);
  for (const m of markers) {
    const card = el("div", "exp-card hit-44", { role: "button", tabindex: "0" });
    card.innerHTML = `<div class="exp-card__title">${m.n}. ${m.title_en}</div><div class="exp-card__meta">${m.section}</div>`;
    card.addEventListener("click", () => goto(`qalam/${m.n}`));
    container.appendChild(card);
  }
}

async function renderVocativesList(container: HTMLElement): Promise<void> {
  const vocatives = await loadVocatives();
  const note = el("div", "empty-note");
  note.style.textAlign = "start";
  note.textContent = "كلّ نداء بصيغة «يا …» مُشتقّ من النصّ نفسه — لا أسماء مخترَعة. عنوان الرحلة هو عبارة النداء ذاتها.";
  container.appendChild(note);
  for (const v of vocatives.slice(0, 100)) {
    const card = el("div", "exp-card hit-44", { role: "button", tabindex: "0" });
    card.innerHTML = `<div class="exp-card__title" dir="rtl">${v.display}</div><div class="exp-card__meta">${v.count} موضعًا</div>`;
    card.addEventListener("click", () => goto(`archetype/${encodeURIComponent(v.key)}`));
    container.appendChild(card);
  }
}

/** §7.4 — "surprise me": composes a fresh experience from real data each
 * time rather than cycling the fixed 3354, so the field never reads as
 * closed. Picks one of: a catalog experience, a QALAM scenario, or a
 * vocative journey, uniformly at random. */
async function surpriseMe(experiences: Experience[]): Promise<void> {
  const roll = Math.random();
  if (roll < 0.5) {
    const e = experiences[Math.floor(Math.random() * experiences.length)];
    goto(`experience/${encodeURIComponent(e.id)}`);
  } else if (roll < 0.75) {
    const markers = await loadQalamMarkers();
    const m = markers[Math.floor(Math.random() * markers.length)];
    goto(`qalam/${m.n}`);
  } else {
    const vocatives = await loadVocatives();
    const v = vocatives[Math.floor(Math.random() * vocatives.length)];
    goto(`archetype/${encodeURIComponent(v.key)}`);
  }
}
