import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/motion.css";
import "./styles/layout.css";
import "./styles/app.css";

import { Router } from "./app/router";
import { setRouter, goto } from "./app/routerInstance";
import { fehresScreen } from "./app/fehresScreen";
import { readerScreen } from "./app/readerScreen";
import { wordPageScreen } from "./app/wordPageScreen";
import { rootPageScreen } from "./app/rootPageScreen";
import { experiencesScreen } from "./app/experiencesScreen";
import { experienceScreen } from "./app/experienceScreen";
import { qalamScreen } from "./app/qalamScreen";
import { archetypeScreen } from "./app/archetypeScreen";
import { screenStartForSurah, screenStartForPage, screenStartForJuz } from "./data/nav";

const app = document.getElementById("app")!;

function buildEntryPlate(onEnter: () => void): void {
  const plate = document.createElement("div");
  plate.className = "entry-plate";
  plate.innerHTML = `
    <div>
      <div class="entry-plate__mark">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَٰنِ الرَّجِيمِ</div>
      <button class="entry-plate__enter hit-44">ادخل</button>
    </div>`;
  app.appendChild(plate);
  plate.querySelector("button")!.addEventListener("click", () => {
    plate.remove();
    onEnter();
  }, { once: true });
}

function buildGlobalSettings(): void {
  const btn = document.createElement("button");
  btn.className = "settings-btn hit-44";
  btn.textContent = "⚙";
  btn.setAttribute("aria-label", "الإعدادات");
  document.body.appendChild(btn);

  const menu = document.createElement("div");
  menu.className = "drawer";
  menu.style.maxHeight = "40dvh";
  menu.innerHTML = `<div class="drawer__grip"></div><div class="drawer__title">المظهر</div>`;
  const themeRow = document.createElement("div");
  themeRow.style.display = "flex";
  themeRow.style.gap = "8px";
  for (const [label, value] of [["ليلي", "dark"], ["نهاري", "light"], ["النظام", ""]] as const) {
    const b = document.createElement("button");
    b.className = "onboarding__btn hit-44";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (value) document.documentElement.setAttribute("data-theme", value);
      else document.documentElement.removeAttribute("data-theme");
    });
    themeRow.appendChild(b);
  }
  menu.appendChild(themeRow);
  document.body.appendChild(menu);
  btn.addEventListener("click", () => { menu.dataset.open = menu.dataset.open === "1" ? "0" : "1"; });
  menu.addEventListener("click", (e) => { if (e.target === menu || (e.target as HTMLElement).classList.contains("drawer__grip")) menu.dataset.open = "0"; });
}

function boot(): void {
  const router = new Router(app);
  setRouter(router);

  router.on("", fehresScreen);
  router.on("fehres", fehresScreen);
  router.on("read/:idx", readerScreen);
  router.on("word/:key", wordPageScreen);
  router.on("root/:root", rootPageScreen);
  router.on("experiences", experiencesScreen);
  router.on("experience/:id", experienceScreen);
  router.on("qalam/:n", qalamScreen);
  router.on("qalam/:n/:offset", qalamScreen);
  router.on("archetype/:key", archetypeScreen);
  router.on("archetype/:key/:offset", archetypeScreen);

  router.on("surah/:n", async (params) => {
    const idx = await screenStartForSurah(Number(params.n));
    goto(`read/${idx}`);
  });
  router.on("page/:n", async (params) => {
    const idx = await screenStartForPage(Number(params.n));
    goto(`read/${idx}`);
  });
  router.on("juz/:n", async (params) => {
    const idx = await screenStartForJuz(Number(params.n));
    goto(`read/${idx}`);
  });

  buildGlobalSettings();
  router.start();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => { /* offline shell degrades to normal fetch */ });
  });
}

buildEntryPlate(boot);
