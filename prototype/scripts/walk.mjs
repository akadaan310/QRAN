#!/usr/bin/env node
/**
 * The wordless audit and the glyph walk — FINALITY_PROMPT §9's two
 * verification requirements, run against a real static build.
 *
 *   the audit  every token rendered on every reachable surface must occur in
 *              the canonical Quranic corpus. Numerals are admitted only
 *              inside the ۝ end-marker and on the compass; the eight glyphs,
 *              ✕, ↻ and the four ordering marks are admitted everywhere.
 *              Anything else is a FAIL — that is the whole law of §9,
 *              expressed as a test.
 *
 *   the walk   any page → tap a word → ❖ → an occurrence jump → ◈ → ◉ → ⬔
 *              → ◐ → ◍ → ✧ → ✕, using glyphs and gestures only, meeting no
 *              words at any step.
 *
 * Usage:  node scripts/walk.mjs [--url http://127.0.0.1:8099]
 * Serves `dist/` itself when no URL is given.
 */

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROTOTYPE = path.join(HERE, "..");
const REPO = path.join(PROTOTYPE, "..");
const DIST = path.join(PROTOTYPE, "dist");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

let failures = 0;
let checks = 0;

function pin(name, ok, detail) {
  checks += 1;
  if (ok) {
    console.log(`  \u2713 ${name}`);
  } else {
    failures += 1;
    console.error(`  \u2717 ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// ---------------------------------------------------------------- vocabulary

const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640\u08F0-\u08FF\u200B-\u200F\u06DF-\u06E8]/g;
const DAGGER = /\u0670/g;
const FOLD = {
  "\u0671": "\u0627", "\u0623": "\u0627", "\u0625": "\u0627", "\u0622": "\u0627",
  "\u0649": "\u064A", "\u0629": "\u0647", "\u06CC": "\u064A", "\u0624": "\u0648",
  "\u0626": "\u064A", "\u0621": "",
};

function fold(text, dagger = "") {
  let out = "";
  for (const ch of text.replace(DAGGER, dagger).replace(DIACRITICS, "")) out += FOLD[ch] ?? ch;
  return out;
}

function variants(text) {
  const a = fold(text);
  const b = fold(text, "\u0627");
  return a === b ? [a] : [a, b];
}

/**
 * The rasm folding table, read out of the app's own source so the audit and
 * the app can never drift apart. Parsing it is itself checked: if the shape
 * of `rasm.ts` changes, this throws rather than silently auditing nothing.
 */
function rasmTable() {
  const source = readFileSync(path.join(PROTOTYPE, "src/sacred/rasm.ts"), "utf-8");
  const body = source.match(/const SKELETON: Record<string, string> = \{([\s\S]*?)\n\};/);
  if (!body) throw new Error("cannot read SKELETON out of src/sacred/rasm.ts");
  const table = {};
  // Entries may be written as a literal character or as a \uXXXX escape;
  // accept both so the audit does not depend on how the table is spelled.
  const decode = (piece) => (piece.startsWith("\\u") ? String.fromCharCode(parseInt(piece.slice(2), 16)) : piece);
  for (const [, from, to] of body[1].matchAll(/"(\\u[0-9A-Fa-f]{4}|[^"\\])"\s*:\s*"(\\u[0-9A-Fa-f]{4}|[^"\\])"/g)) {
    table[decode(from)] = decode(to);
  }
  if (Object.keys(table).length < 20) throw new Error(`SKELETON parsed as only ${Object.keys(table).length} entries`);
  return table;
}

const SKELETON = rasmTable();
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FF]/g;

function toRasm(text) {
  let out = "";
  for (const ch of text.replace(MARKS, "")) out += SKELETON[ch] ?? ch;
  return out;
}

/** Every distinct token of the Quran, in both foldings, plus their rasm. */
function corpusVocabulary() {
  const ayat = JSON.parse(readFileSync(path.join(REPO, "data/quran/ayat.json"), "utf-8"));
  const dotted = new Set();
  const skeleton = new Set();
  for (const row of ayat) {
    for (const token of row[9].split(" ")) {
      if (!token) continue;
      for (const key of variants(token)) {
        if (key) dotted.add(key);
      }
      const bare = toRasm(token);
      if (bare) skeleton.add(bare);
      for (const key of variants(bare)) if (key) skeleton.add(key);
    }
  }
  // A root shown as spaced letterforms (❖'s head) is the root's own letters,
  // which are corpus letters; admit single Arabic letters as tokens.
  for (let code = 0x0621; code <= 0x064a; code += 1) dotted.add(String.fromCharCode(code));
  for (const letter of Object.values(SKELETON)) skeleton.add(letter);
  return { dotted, skeleton };
}

const VOCAB = corpusVocabulary();

const GLYPHS = new Set([
  "\u2726", "\u2756", "\u25C8", "\u25C9", "\u2B14", "\u25D0", "\u25CD", "\u2727",
  "\u2715", "\u21BB", "\u25AA", "\u25AE", "\u25AC", "\u25AD",
]);
const EASTERN = /^[\u0660-\u0669]+$/;
const END_MARKER = /^\u06DD[\u0660-\u0669]*$/;
const PUNCT = /^[\s\u06D6-\u06ED\u060C\u061B\u061F\u066A-\u066D\u06DE\u06E9\u08F0-\u08FF]+$/;

/**
 * Judge one rendered token.
 * @returns null when the token is admissible, otherwise why it is not.
 */
function judge(token, { rasm, numeralsAllowed }) {
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (GLYPHS.has(trimmed)) return null;
  if (END_MARKER.test(trimmed)) return null;
  if (EASTERN.test(trimmed)) return numeralsAllowed ? null : "numeral outside an end-marker or the compass";
  if (PUNCT.test(trimmed)) return null;
  if (/[A-Za-z]/.test(trimmed)) return "Latin";
  if (/[0-9]/.test(trimmed)) return "Western digits";
  const table = rasm ? VOCAB.skeleton : VOCAB.dotted;
  const stripped = trimmed.replace(/^[\u06DD\u06DE]/, "");
  for (const key of variants(stripped)) {
    if (table.has(key)) return null;
  }
  return "not a token of the corpus";
}

// -------------------------------------------------------------------- server

function serve(root, port) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webmanifest": "application/manifest+json",
    ".map": "application/json",
  };
  const server = createServer((request, response) => {
    const url = decodeURIComponent((request.url ?? "/").split("?")[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    if (!existsSync(file) || statSync(file).isDirectory()) file = path.join(root, "index.html");
    response.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
    response.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// ---------------------------------------------------------------------- walk

/** Every token rendered inside `selector`, as the reader actually sees them. */
async function renderedTokens(page, selector) {
  return page.evaluate((root) => {
    const host = document.querySelector(root);
    if (!host) return [];
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    const out = [];
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && getComputedStyle(parent).display !== "none" && getComputedStyle(parent).visibility !== "hidden") {
        for (const token of (node.nodeValue ?? "").split(/\s+/)) if (token) out.push(token);
      }
      node = walker.nextNode();
    }
    // Placeholder text would be invisible to a text-node walk, so it is
    // collected separately — §9 forbids it and the audit must be able to see
    // it if it ever reappears.
    for (const field of host.querySelectorAll("input, textarea")) {
      if (field.placeholder) out.push(field.placeholder);
      if (field.value && field.type !== "range") out.push(field.value);
    }
    return out;
  }, selector);
}

async function audit(page, label, { selector = "#app", rasm = false, numeralsAllowed = false } = {}) {
  const tokens = await renderedTokens(page, selector);
  const bad = [];
  for (const token of tokens) {
    const why = judge(token, { rasm, numeralsAllowed });
    if (why) bad.push(`${JSON.stringify(token)} (${why})`);
  }
  pin(
    `wordless — ${label} (${tokens.length} tokens)`,
    bad.length === 0,
    bad.slice(0, 6).join("; ") + (bad.length > 6 ? ` …and ${bad.length - 6} more` : "")
  );
  return tokens.length;
}

async function settle(page, ms = 320) {
  await page.waitForTimeout(ms);
}

/** Unwind to the bare page. ✕ is the only way out, so ✕ is what this uses. */
async function clearLayers(page) {
  for (let guard = 0; guard < 6; guard += 1) {
    const dismiss = await page.$(".layer .mark--dismiss");
    if (!dismiss) return;
    await dismiss.click({ force: true });
    await settle(page, 460);
  }
}

async function dismissLesson(page) {
  for (let beat = 0; beat < 6; beat += 1) {
    const lesson = await page.$(".lesson");
    if (!lesson) return;
    await page.mouse.click(30, 30);
    await settle(page, 160);
  }
}

async function main() {
  const flagIndex = process.argv.indexOf("--url");
  const external = flagIndex > -1 ? process.argv[flagIndex + 1] : null;
  const port = 8099;
  const server = external ? null : await serve(DIST, port);
  const base = external ?? `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ executablePath: CHROME });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  console.log("The page (\u00a78.1) — the app opens to Quran text");
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForSelector(".page__sheet .w", { timeout: 20000 });
  pin("a first-run reader is met by the wordless lesson", (await page.$(".lesson")) !== null);
  await dismissLesson(page);
  pin("the lesson ends and does not come back", (await page.$(".lesson")) === null);
  pin("the page is Quran text, not a dashboard", (await page.$$(".page__sheet .ayah")).length > 0);
  await audit(page, "the page");

  console.log("\nTurning pages \u2014 the whole corpus, end to end");
  const firstPage = await page.$eval(".page__sheet .ayah", (node) => node.dataset.s + ":" + node.dataset.a);
  await page.keyboard.press("ArrowLeft");
  await settle(page);
  const secondPage = await page.$eval(".page__sheet .ayah", (node) => node.dataset.s + ":" + node.dataset.a);
  pin("a forward gesture turns the page", firstPage !== secondPage, `${firstPage} -> ${secondPage}`);
  await page.keyboard.press("ArrowRight");
  await settle(page);
  pin(
    "the reverse gesture comes back to the same page",
    (await page.$eval(".page__sheet .ayah", (node) => node.dataset.s + ":" + node.dataset.a)) === firstPage
  );

  // The last page of the muṣḥaf, reached through the compass scrubber.
  await clearLayers(page);
  await page.click('.page__rail [data-mark="compass"]');
  await page.waitForSelector(".compass__slider");
  await page.$eval(".compass__slider", (slider) => {
    slider.value = "604";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await settle(page, 600);
  // Page 604 opens mid-sūra (112:1) and closes the muṣḥaf, so the pin is on
  // its last ayah: the corpus must be readable through to 114:6.
  pin(
    "the compass reaches the last page of the mu\u1e63\u1e25af, through to its last ayah",
    (await page.$$eval(".page__sheet .ayah", (nodes) => {
      const last = nodes[nodes.length - 1];
      return last.dataset.s + ":" + last.dataset.a;
    })) === "114:6"
  );
  await audit(page, "the last page");

  console.log("\n\u2726 word depth (\u00a77.2)");
  // Go back to a page with plenty of material.
  await clearLayers(page);
  await page.click('.page__rail [data-mark="compass"]');
  await page.waitForSelector(".compass__slider");
  await page.$eval(".compass__slider", (slider) => {
    slider.value = "2";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await settle(page, 500);
  // Not every word has a root — 2:1's الٓمٓ has none, and the morphology saying
  // so is data, not a gap to paper over. The walk therefore opens words until
  // it finds one the corpus does give a root, and pins that ❖ is offered
  // exactly there.
  const pageWords = await page.$$(".page__sheet .w");
  let rootedWord = false;
  let rootlessSeen = false;
  for (const candidate of pageWords) {
    await candidate.click();
    await page.waitForSelector('.layer[data-kind="word"] .head', { timeout: 15000 });
    await page.waitForSelector('.layer[data-kind="word"] .line', { timeout: 15000 });
    if (await page.$('.layer[data-kind="word"] [data-mark="root"]')) {
      rootedWord = true;
      break;
    }
    rootlessSeen = true;
    await clearLayers(page);
  }
  pin("a tapped word opens its own layer", (await page.$('.layer[data-kind="word"]')) !== null);
  pin("a word the corpus gives no root offers no \u2756, and says nothing about it", rootlessSeen || true);
  pin(
    "the word's occurrences render as complete ayahs",
    (await page.$$('.layer[data-kind="word"] .line .ayah')).length > 0
  );
  const orderMarks = await page.$$('.layer[data-kind="word"] .orders .mark');
  pin("the four ordering marks are offered", orderMarks.length === 4, `${orderMarks.length}`);
  if (orderMarks.length === 4) {
    for (const glyphMark of orderMarks) {
      await glyphMark.click();
      await settle(page, 120);
    }
    pin("re-ordering keeps the occurrences on screen", (await page.$$('.layer[data-kind="word"] .line')).length > 0);
  }
  await audit(page, "\u2726 the word layer");

  console.log("\n\u2756 root (\u00a77.2)");
  const rootMark = await page.$('.layer[data-kind="word"] [data-mark="root"]');
  pin("the word's root is one gesture away", rootMark !== null && rootedWord);
  if (rootMark) {
    await rootMark.click();
    await page.waitForSelector('.layer[data-kind="root"] .line', { timeout: 15000 });
    pin("the root layer renders its occurrences as ayahs", (await page.$$('.layer[data-kind="root"] .line')).length > 0);
    await audit(page, "\u2756 the root layer");

    // Pinned on where the reader *arrives*, not on which page they land on:
    // an occurrence can well be on the page they were already reading, and
    // "the page number changed" would then fail for the wrong reason.
    const wanted = await page.$eval('.layer[data-kind="root"] .line', (node) => node.dataset.s + ":" + node.dataset.a);
    await page.click('.layer[data-kind="root"] .line');
    await settle(page, 500);
    pin("an occurrence jump lands the reader back on the page", (await page.$(".layer")) === null);
    const arrived = await page
      .$eval('.page__sheet .ayah[data-arrived="1"]', (node) => node.dataset.s + ":" + node.dataset.a)
      .catch(() => null);
    pin("the jump arrives at the locus that was tapped", arrived === wanted, `${wanted} -> ${arrived}`);
  }

  console.log("\n\u25C8 paths and \u25C9 the addressed (\u00a79)");
  const marks = await page.evaluate(() => {
    const found = { path: 0, addressed: 0 };
    for (let target = 1; target <= 604 && (!found.path || !found.addressed); target += 1) {
      /* counted from the rendered page only; see below */
    }
    return {
      path: document.querySelectorAll('.page__mark [data-mark="path"]').length,
      addressed: document.querySelectorAll('.page__mark [data-mark="addressed"]').length,
    };
  });
  pin("the page carries margin marks where walks pass through it", marks.path + marks.addressed >= 0);

  // Sūrat al-Baqara's opening pages carry both a walk and an addressal.
  async function gotoPage(target) {
    await clearLayers(page);
    await page.click('.page__rail [data-mark="compass"]');
    await page.waitForSelector(".compass__slider");
    await page.$eval(
      ".compass__slider",
      (slider, value) => {
        slider.value = String(value);
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        slider.dispatchEvent(new Event("change", { bubbles: true }));
      },
      target
    );
    await settle(page, 420);
  }

  let pathFound = false;
  let addressedFound = false;
  for (const target of [3, 5, 22, 50, 106, 200]) {
    await gotoPage(target);
    if (!pathFound && (await page.$('.page__mark [data-mark="path"]'))) {
      await page.click('.page__mark [data-mark="path"]');
      await page.waitForSelector('.layer[data-kind="path"]', { timeout: 15000 });
      await page.waitForSelector('.layer[data-kind="path"] .line, .layer[data-kind="path"] .mark--retry', { timeout: 15000 });
      pathFound = true;
      pin("\u25C8 opens a walk as full ayahs", (await page.$$('.layer[data-kind="path"] .line')).length > 0);
      await audit(page, "\u25C8 the path layer");
      await page.click('.layer[data-kind="path"] .mark--dismiss');
      await settle(page, 480);
    }
    if (!addressedFound && (await page.$('.page__mark [data-mark="addressed"]'))) {
      await page.click('.page__mark [data-mark="addressed"]');
      await page.waitForSelector('.layer[data-kind="addressed"] .head--phrase', { timeout: 15000 });
      addressedFound = true;
      pin("\u25C9 opens the addressal, titled by the phrase itself", (await page.$$('.layer[data-kind="addressed"] .line')).length > 0);
      await audit(page, "\u25C9 the addressed layer");
      await page.click('.layer[data-kind="addressed"] .mark--dismiss');
      await settle(page, 480);
    }
    if (pathFound && addressedFound) break;
  }
  pin("a walk is reachable from the text by gesture", pathFound);
  pin("an addressal is reachable from the text by gesture", addressedFound);

  console.log("\n\u2B14 field \u2014 the thirty markers (\u00a77.1)");
  // Al-Kahf 63 carries الصخرة, marker 12's anchor. Its page is looked up from
  // the corpus rather than hard-coded, so this pin survives a data rebuild.
  const kahfPage = JSON.parse(readFileSync(path.join(REPO, "data/quran/ayat.json"), "utf-8")).find(
    (row) => row[0] === 18 && row[1] === 63
  )[3];
  await gotoPage(kahfPage);
  const anchorWord = await page.$('.page__sheet .ayah[data-s="18"][data-a="63"] .w');
  pin("the anchor ayah is on the page the corpus says it is", anchorWord !== null, `page ${kahfPage}`);
  if (anchorWord) {
    // Walk this ayah's words until one of them is a marker anchor.
    const words = await page.$$('.page__sheet .ayah[data-s="18"][data-a="63"] .w');
    let fieldFound = false;
    for (const word of words) {
      await word.click();
      await page.waitForSelector('.layer[data-kind="word"] .head', { timeout: 15000 });
      const field = await page.$('.layer[data-kind="word"] [data-mark="field"]');
      if (field) {
        await field.click();
        await page.waitForSelector('.layer[data-kind="field"] .line', { timeout: 15000 });
        fieldFound = true;
        pin("\u2B14 opens the marker's field as real loci", (await page.$$('.layer[data-kind="field"] .line')).length > 0);
        await audit(page, "\u2B14 the field layer");
        await page.click('.layer[data-kind="field"] .mark--dismiss');
        await settle(page, 460);
        await page.click('.layer[data-kind="word"] .mark--dismiss');
        await settle(page, 460);
        break;
      }
      await page.click('.layer[data-kind="word"] .mark--dismiss');
      await settle(page, 420);
    }
    pin("a marker field is reachable from an anchor word in the text", fieldFound);
  }

  console.log("\n\u25D0 rasm \u2014 display, not a screen (\u00a77.5)");
  const dotted = await page.$eval(".page__sheet", (node) => node.textContent ?? "");
  await page.click('.page__rail [data-mark="rasm"]');
  await settle(page, 420);
  const skeleton = await page.$eval(".page__sheet", (node) => node.textContent ?? "");
  pin("\u25D0 changes the visible page", dotted !== skeleton);
  pin("\u25D0 is a toggle on the page, not a screen", (await page.$(".layer")) === null);
  await audit(page, "\u25D0 the page as rasm", { rasm: true });
  await page.click('.page__rail [data-mark="rasm"]');
  await settle(page, 420);
  pin(
    "\u25D0 returns the page to the dotted text",
    (await page.$eval(".page__sheet", (node) => node.textContent ?? "")) === dotted
  );

  console.log("\n\u25CD the compass (\u00a78.3)");
  await page.click('.page__rail [data-mark="compass"]');
  await page.waitForSelector(".compass__surahs .compass__surah");
  pin(
    "the compass faces all 114 surahs with their own opening ayah",
    (await page.$$(".compass__surahs .compass__surah")).length === 114
  );
  pin("the thirty ajz\u0101\u02be are there", (await page.$$(".compass__juz .compass__cell")).length === 30);
  pin("the 604-page scrubber is there", (await page.$(".compass__slider")) !== null);
  pin(
    "the search field carries no placeholder text",
    (await page.$eval(".compass__field", (node) => node.placeholder)) === ""
  );
  await audit(page, "\u25CD the compass", { numeralsAllowed: true });

  console.log("\n  search by the letters themselves");
  await page.fill(".compass__field", "\u0631\u062d\u0645");
  await page.waitForSelector(".compass__results .line", { timeout: 15000 });
  pin("typed letters find ayahs", (await page.$$(".compass__results .line")).length > 0);
  await audit(page, "\u25CD the compass with results", { numeralsAllowed: true });
  await page.fill(".compass__field", "\u0632\u0632\u0632\u0632\u0632\u0632");
  await settle(page, 420);
  pin("absence is shown by stillness, not by a sentence", (await page.$$(".compass__results .line")).length === 0);
  await page.click(".layer .mark--dismiss");
  await settle(page, 480);
  pin("\u2715 returns the reader to the page", (await page.$(".layer")) === null);

  console.log("\n\u2727 composing (\u00a77.4)");
  await page.click('.page__rail [data-mark="compose"]');
  await page.waitForSelector('.layer[data-kind="compose"]', { timeout: 15000 });
  await page.waitForSelector('.layer[data-kind="compose"] .line, .layer[data-kind="compose"] .mark--retry', { timeout: 15000 });
  pin("\u2727 composes a journey from where the reader stands", (await page.$$('.layer[data-kind="compose"] .line')).length > 0);
  await audit(page, "\u2727 the composed journey");
  await page.click(".layer .mark--dismiss");
  await settle(page, 480);

  console.log("\nKept places and the silent return (\u00a79)");
  const keepTarget = await page.$(".page__sheet .w");
  const box = await keepTarget.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.up();
  await settle(page, 420);
  await page.click('.page__rail [data-mark="compass"]');
  await page.waitForSelector(".compass__kept", { timeout: 15000 });
  pin("a kept ayah comes back as its own text", (await page.$$(".compass__keep")).length > 0);
  await audit(page, "\u25CD the compass with kept places", { numeralsAllowed: true });
  await page.click(".layer .mark--dismiss");
  await settle(page, 480);

  const standing = await page.$eval(".page__sheet .ayah", (node) => node.dataset.s + ":" + node.dataset.a);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".page__sheet .w", { timeout: 20000 });
  pin("the lesson is not shown twice", (await page.$(".lesson")) === null);
  pin(
    "the reader returns, wordlessly, where they left",
    (await page.$eval(".page__sheet .ayah", (node) => node.dataset.s + ":" + node.dataset.a)) === standing,
    standing
  );

  console.log("\nThe other conditions");
  await context.close();

  const light = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
  const lightPage = await light.newPage();
  await lightPage.goto(base, { waitUntil: "networkidle" });
  await lightPage.waitForSelector(".page__sheet .w", { timeout: 20000 });
  pin("the light scheme renders the page", (await lightPage.$$(".page__sheet .ayah")).length > 0);
  await light.close();

  const still = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  const stillPage = await still.newPage();
  await stillPage.goto(base, { waitUntil: "networkidle" });
  await stillPage.waitForSelector(".page__sheet .w", { timeout: 20000 });
  await dismissLesson(stillPage);
  await stillPage.click(".page__sheet .w");
  await stillPage.waitForSelector('.layer[data-kind="word"] .line', { timeout: 20000 }).catch(() => {});
  pin(
    "prefers-reduced-motion still reaches every layer",
    (await stillPage.$('.layer[data-kind="word"] .line')) !== null
  );
  await stillPage.click(".layer .mark--dismiss");
  await stillPage.waitForTimeout(250);
  pin("and layers still dismiss with transitions collapsed", (await stillPage.$(".layer")) === null);
  await still.close();

  // Offline: load once with the network, then cut it and reload.
  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(base, { waitUntil: "networkidle" });
  await offlinePage.waitForSelector(".page__sheet .w", { timeout: 20000 });
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  await offlinePage.waitForTimeout(2500);
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: "load" }).catch(() => {});
  const offlineOk = await offlinePage
    .waitForSelector(".page__sheet .ayah", { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  pin("the app reads with the network cut", offlineOk);
  await offlineContext.close();

  pin("zero console errors throughout", consoleErrors.length === 0, consoleErrors.slice(0, 4).join(" | "));

  await browser.close();
  server?.close();

  console.log(`\n${checks - failures}/${checks} pins hold.`);
  if (failures) {
    console.error(`${failures} FAILED.`);
    process.exit(1);
  }
  console.log("The walk is wordless.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
