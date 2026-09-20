# FINALITY PROMPT — the complete immersive Quran explorer

**Standing order from the owner (2026-09-20): NO APPROVALS. JUST BUILD AND
PROSPER.** The old approval gate is revoked. Execute this prompt end to end,
verify everything yourself, commit, and push. Do not stop to ask for approval
at any stage.

## 1. Mission

Finish the QRAN immersive Quran explorer: the **entire Quran**, rendered in
full and navigable end to end; **thousands of specialty immersive experiences**
discoverable and browsable; **complete lexicons** (Arabic words, roots, root
translations, classical definitions); and a **dynamic, navigable فهرس**
(index). One coherent app. Everything real — no placeholder text, no invented
content, no dead ends.

## 2. What failed last time — correct all five

The Phase-1 prototype proved the interaction model (15-line canvas, rails,
gestures, HUD) but is not a usable explorer:

1. **Too many invented words.** F01–F20, runway/excavator/collider,
   lane/gutter and similar jargon must NEVER appear in user-facing UI.
   Navigation must work **regardless of language**: Arabic-first labels,
   universal icons, and gestures. A stranger must navigate the whole app
   without learning any new vocabulary. (Internal code/docs may keep
   engineering names; the user never sees them.)
2. **Only 3 sample pages.** The entire Quran — 114 surahs, 6236 ayahs —
   must be rendered and navigable throughout. No truncation, no "demo
   content".
3. **No experiences.** The 3354 catalogued experiences must be discoverable
   and browsable (by category, by surah, by archetype, by shuffle).
4. **No lexicons.** Wire in the full lexicon: every word tappable → its
   root, lemma, translation; every root browsable → glosses, classical
   definitions, masadir, all occurrences.
5. **No فهرس.** Build one dynamic index screen: surahs, ajza, 604 pages,
   roots, word search, experiences — all jumping straight into the reading
   canvas at the right locus.

## 3. What you have (do not rebuild what exists)

- `prototype/` — working Vite+TS app: real-DOM 15-line canvas, equilibrium
  governor, 18-gesture dictionary, 6 HUD states, 7 rail instruments, 4-beat
  onboarding, IndexedDB persistence, offline PWA shell. **Extend it, don't
  rewrite it.** Keep every currently-passing behavior passing
  (`prototype/QA_NOTES.md`, `docs/PHASE-01-UI-SYSTEM.md` §6).
- `data/` — the complete data layer (see `data/README.md`):
  - `data/quran/` — 6236 ayahs (Uthmani), per-surah word streams with
    root/lemma/POS/EN-translation/transliteration, and `align.json`
    (word→text-token spans). **Rendering rule is normative** — follow it
    exactly; never re-derive alignment at runtime.
  - `data/lexicon/` — 1642 roots (Arabic + English glosses, classical
    definitions, masadir) and 21,295 unique words (translation,
    transliteration, root, frequency).
  - `data/fehres/fehres.json` — 114 surahs, 30 juz starts, **604 page
    starts (Madani)**, root frequency ranking, corpus stats.
  - `data/experiences/` — **3354 experiences** (2500 isnaad discoveries with
    real loci + Arabic notes, 400 motifs with occurrences, 454 recurring
    phrases across the Quran) + 8 plain-language archetypes.
  - `data/SOURCES.md` — provenance, licenses, attribution. **Keep it
    accurate; surface attributions in-app (About screen).**
- `references/` — read-only upstream snapshots (isnaad, mirtal, sayyarah).
- `docs/` — architecture, product spec, UI blueprint, journey.

## 4. Build phases

**Phase A — Full-Quran reading canvas.**
Replace the 3 fixture pages with the whole corpus. Navigation: surah picker
(from فهرس) → ayahs flow through the 15-line canvas (~416 screens of 15
ayahs); prev/next screen, jump to surah:ayah, jump to page (1–604), jump to
juz. Every screen keeps the canvas contract: Arabic text is the absolute
primary visual material; rails show live instruments on margins only; every
mode reversible with a named dismissal. Lazy-load: `fehres.json` + surah
metadata upfront; per-surah `words/NNN.json` on demand; `ayat.json` once
(1.5 MB) cached by the service worker. 60fps scroll, no jank on the
longest surah.

**Phase B — Word & root interactivity (the lexicon, in the reading flow).**
Tap any word → word card: the word, its root, lemma, English translation
(opt-in layer, off by default — Arabic-first), transliteration. Tap the root
→ root page: Arabic gloss, English gloss, 1–3 classical definitions (book
attributed), masadir, and the full occurrence list (every surah:ayah,
tappable → jumps the canvas there). Root occurrences highlight across the
current screen (this is the echo-trajectory feature, now powered by real
data instead of fixtures). Long-press a word → pin it as a checkpoint
(reuses the existing checkpoint store).

**Every word also gets a full word page** (see §7.2): the word rendered
large in Uthmani at the top, root/lemma/POS/transliteration, opt-in
translation and glosses, then **every occurrence in the Quran, each rendered
as its complete ayah text** with the word highlighted and tappable to jump
the canvas there. Occurrences are orderable: mushaf order (default),
grouped by surah, by juz, by page. The root page gets the same treatment:
gloss, book-attributed definitions, masadir, all occurrences rendered and
orderable.

**Phase C — الفهرس (the dynamic index).**
One screen, five sections, all in plain Arabic with icons: السور (114, with
ayah counts + Meccan/Medinan), الأجزاء (30 → first ayah + page), الصفحات
(604 → first ayah), الجذور (1642, frequency-ranked, searchable),
التجارب (3354, by category). Plus word search across the 21,295-word
lexicon (Arabic input, normalized). Every row deep-links into the canvas
at its locus. This screen is also the app's home — the entry plate and
onboarding lead here, de-jargoned (no invented terms; the 4 beats stay:
open → first tap → first root → first experience).

**Phase D — Experiences browser.**
The 3354 experiences, browsable four ways: by category (discovery kinds in
their own Arabic terms, motifs, recurring phrases), by surah (experiences
touching this surah), by archetype (the 8 plain-language lenses), and
shuffle ("فاجئني"). Each experience page: its title, its loci rendered as
real ayah text (from `data/quran`, not copied prose), and one-tap jumps
into the canvas at each locus. Discovery notes render verbatim (they are
real Arabic scholarship-adjacent notes from isnaad, quoted as such).

**Experiences are generative, not finite** (see §7.4): the browser offers the
3354 seeded experiences *and* composes more — QALAM marker scenarios,
archetype-addressee journeys, word journeys — and "فاجئني" (surprise me)
generates genuinely new experiences from real data instead of cycling a
fixed list. The count is never presented as a ceiling; the UI never implies
the field is closed.

**Phase E — Language-agnostic pass.**
Audit every user-facing string: remove ALL invented vocabulary (F-numbers,
runway/excavator/collider, lane/gutter, "substrate", "friction", etc.).
Replace with plain Arabic labels + icons. English appears only as an opt-in
subtitle layer (word translations, root glosses) — never as navigation
vocabulary. Test: a user who speaks no English and has never seen this app
must reach any surah, any root, and any experience without instruction.

**Phase F — Verification & ship.**
`npm run build` clean; Playwright smoke on a mobile viewport across: full
surah traversal (first/middle/last surah), فهرس jumps (surah, juz, page,
root, experience), word card → root page → occurrence jump, experiences
shuffle, both themes, offline (service worker serving all data), keyboard
navigation, `prefers-reduced-motion`. Zero console errors. Record every
simplification and every fixture-vs-real decision in `prototype/QA_NOTES.md`
and `docs/PHASE-01-UI-SYSTEM.md` §6 (measurement-honesty covenant — the
reason the owner trusts this repo). Commit and push to this branch.

## 5. Non-negotiables

- **Arabic text is the absolute primary visual material.** Instrumentation
  never covers letterforms. Arabic-first; translations are opt-in only.
- **No invented terminology in UI.** Content labels from the sources
  (isnaad's Arabic discovery titles, classical book names) are fine and
  stay quoted/attributed; your own new words are not.
- **No fabricated content.** Every experience, gloss, definition, and locus
  comes from `data/` or `references/`. If something is missing, the UI says
  so — it never invents.
- **Performance:** 60fps, lazy per-surah loading, service-worker offline.
- **Persistence:** keep the existing IndexedDB stores; checkpoints,
  bookmarks, and last-read survive.
- **Provenance:** About screen carries the `data/SOURCES.md` attributions
  (Quran.com CC-BY-4.0, QAC, Hawramani lexicon, isnaad, al-Mirtal).
- **Owner-proposed lenses stay proposed.** The 30 QALAM markers and any
  archetype readings are the owner's proposed framework, quoted and
  attributed as such. The app never presents them as tafsīr, tajwīd,
  qirāʾāt, linguistics, or doctrine.
- **The dotless rasm view is a render-time display transform** of the
  canonical string: derived, never stored as Quran text, never canonical,
  never a historical manuscript claim. It is offered as beholding, not
  explanation.
- **Addressals are quoted verbatim.** Archetype titles are the addressal
  phrases themselves, exactly as they appear in the text. The app invents
  no character names and no backstories.

## 6. Done means

The whole Quran readable end to end; 3354 experiences browsable four ways
*plus* newly generated ones without a ceiling; every word tappable to its
lexicon entry **and** to a full orderable word page; every root explorable
to all its occurrences; the فهرس jumping anywhere; zero invented words in
the UI; zero console errors; build green; committed and pushed. **Then stop
— the work is the message.**

## 7. The infinite layer — owner directive 2026-09-20

The finite catalog (3354 experiences) is the seed, not the ceiling. The app
must open an effectively **infinite** field of experiences generated from
the Quran itself. Five requirements:

**7.1 The 30 QALAM markers as scenario engines.**
`references/qalam-30-markers.md` holds the owner's 30 proposed QALAM
markers, saved verbatim from his framework text — proposed readings, not
established tajwīd, qirāʾāt, linguistics, or doctrine, and the app never
presents them as such. Each marker names a linguistic geometry (the
غلام/فتى shift, the الصخرة null-zone, سيروا في الأرض, …) anchored to real
loci. Build a **scenario engine**: for each marker, derive its loci from
`data/` (word/root occurrence search on the marker's anchor words) and
render the marker as an explorable scenario — the anchor ayahs as real
text, the marker's reading shown as the owner's proposed lens (quoted,
attributed, never as tafsīr), with traversal into every connected locus.
30 markers × their loci × traversal paths = an unbounded browsable field.
New scenarios compose; nothing is a dead end.

**7.2 Every word gets its own page.**
Tapping a word opens a **full word page**, not just a card: the word
rendered large in Uthmani; root, lemma, POS, transliteration; translation
and glosses on the opt-in layer; then **every occurrence in the Quran,
each as its complete ayah text** with the word highlighted, tappable to
jump the canvas there. Occurrences are **orderable**: mushaf order
(default), grouped by surah, by juz, by page. The root page mirrors this:
gloss, book-attributed classical definitions, masadir, all occurrences
rendered and orderable.

**7.3 Archetype addressees — choose who you are.**
The Quran addresses its reader directly, again and again: يَا بَنِي آدَمَ،
يَا أَيُّهَا الرُّسُلُ، يَا أَيُّهَا النَّاسُ، يَا أَيُّهَا الَّذِينَ آمَنُوا،
يَا مُوسَىٰ، يَا دَاوُودُ, and many more. **Derive every vocative addressal
from the corpus** (يا + its addressee, computed from the word stream — no
invented names). Each addressal is an **archetype the user can choose to
be**: entering it renders the Quran through that witnessing — every ayah
carrying the addressal, in order, as one continuous journey through the
canvas. **The addressal phrase itself is the title** of the experience,
quoted verbatim. No invented character names, no backstories.

**7.4 Experiences are generative, not finite.**
The experiences browser offers the 3354 seeded experiences **and**
generates more on demand: marker scenarios (§7.1), archetype journeys
(§7.3), word journeys (§7.2), and a "فاجئني" (surprise me) that **composes
new experiences from real data** — a root's journey, an addressal's arc, a
marker's field — rather than cycling a fixed list. The count is never
presented as a ceiling; the UI never says "all experiences" as if the
field were closed.

**7.5 The rasm as sacred display.**
Add a **script view**: the current text rendered as its dotless skeleton —
the rasm without iʿjām (dots) — beside or toggled against the dotted
Uthmani. This is a **display layer derived at render time from the
canonical string**, not an alternative text and not a historical claim; it
is offered as beholding, not explanation — a way to witness the power
carried by the Arabic letters themselves, pre-dots and post-dots, as
display. Label it plainly as a derived view. Never store it as Quran text;
never present it as a manuscript.

## 8. The reader is the app — zero jargon, UI as architecture (owner directive 2026-09-20)

The prototype's card-and-chip look is rejected. The app is a **Quran reader first**: the full 15-line Uthmani page fills the screen, edge to edge, and every research aspect is reached **from the text by gesture** — never through taxonomy screens, filter bars, or Latin labels. It must feel like a muṣḥaf that can think, not a database with verses pasted in.

**8.1 The page is the interface.**
The app opens to Quran text, not a dashboard. No home screen of cards, no feature grid, no onboarding tour of labeled panels. Arabic Uthmani calligraphy is the primary visual material, full-bleed, with quiet margins and a reverent dark/light palette. Instrumentation never covers letterforms.

**8.2 Everything is a layer over the text, reached by gesture.**
- **Tap any word** → its word page (§7.2): large Uthmani header, root/lemma/POS/transliteration, opt-in translation, every occurrence as complete ayah text, orderable by mushaf/surah/juz/page.
- **From the word page → its root page**: glosses, book-attributed classical definitions, maṣādir, all occurrences.
- **Ayahs anchoring experiences** carry a quiet margin mark (a dot, a hairline — never covering letterforms). Tapping it opens the experience **as a journey over the text**, not as a document card.
- **The 30 QALAM markers are not a list.** Each is an explorable path entered from its anchor words in the text; the marker phrase — quoted, attributed to Abed — is the path's title.
- **Every vocative addressal** (يا أيها الناس…, يا موسى…) is an entry point: from any addressal ayah, follow the addressed to traverse the Quran through that witnessing, titled by the addressal phrase itself.
- **Dotless rasm is a display toggle on the page** — beside or over the dotted Uthmani — not a separate feature screen.

**8.3 Navigation is a compass, not a menu.**
One bottom handle or gesture opens the فهرس — 114 surahs, 30 ajzāʾ, 604 pages — Arabic-first, icon- and gesture-driven, fully usable with zero literacy in any Latin script. Word search is Arabic-first.

**8.4 Zero jargon anywhere the user can see.**
No F-numbers, no runway/excavator/collider, no lane/gutter, no substrate/friction — and **no Latin transliteration chips** (no "raj-al-jidhr", no "istihdar", no "mirtāl"), no taxonomy filter bars ("التصنيفات / الأنماط الأساسية / بالسورة"), no "فاجئني" button as a feature. Discovery is **composed from the reader's position** — the current ayah or word is the seed of every generated journey. Curator-written labels appear only where §7.1/§7.3 require them, quoted and scoped.

**8.5 Sheets and layers, not screens.**
Word, root, experience, marker, and addressal journeys open as overlays rising over the page and dismiss back to it. The reader never leaves the Quran. The back action always returns to the exact ayah and scroll position.

**8.6 Content requirements stand; surfacing changes.**
§1–§7 define *what* exists (full corpus, 3,354+ generative experiences, lexicon, markers, addressals, rasm display, فهرس). This section governs *how it surfaces*. Rule of done: **if a feature cannot be reached from the text by gesture, it is not done.** Verify by walking: open to any page, tap a word, reach its root, follow an experience mark, open the فهرس, return — without ever seeing a Latin label or a taxonomy bar.


## 9. The sacred interface — the only words are Quranic (owner directive 2026-09-20, final)

**The law (absolute): the only words rendered anywhere in the app are Quranic Arabic — the Uthmani text itself.** No UI labels in any language — and no Arabic UI vocabulary either (no فهرس، تجارب، جذر، كلمة، التالي، تخطَّ، no headings, no toasts, no onboarding sentences). No Latin anywhere: no transliteration, no POS tags, no transliterated chips, no F-numbers. No translations (revoked entirely — they are other words). No classical-definition prose rendered as text (the data stays canonical in the repo; the UI shows roots through their occurrences — the Quran defines by usage). Eastern Arabic numerals only inside traditional ayah end-markers and the compass, never as labeled counts. **The entire interface is Quranic text + a fixed canon of glyphs + gestures + space + motion.**

**The canon of marks** — exactly eight glyphs, sacred-geometric, identical everywhere, learned once by hand in a wordless ~20-second first-run lesson (pulsing hints, tap to learn, no words): ✦ word depth (tap any word → its layer: the word large in Uthmani, every occurrence as complete ayah text, 4-glyph ordering by mushaf/surah/juz/page); ❖ root (bare root letterforms, all occurrences as full ayahs); ◈ path (quiet margin mark on ayahs anchoring experiences — opens the journey as a walkable constellation of full ayahs, no cards, no titles; the seed ayah is the title); ◉ the addressed (on addressal ayahs — traverses every ayah carrying that addressal phrase, titled by the phrase itself, e.g. يَا أَيُّهَا النَّاسُ); ⬔ field (the 30 QALAM markers, entered from anchor words, titled by anchor ayah text — the marker's quoted phrase is never printed); ◐ rasm (toggles the visible page between dotted Uthmani and derived dotless skeleton — display, not a screen); ◍ compass (the wordless index: 114 nodes faced by their surahs' opening ayah text, 30 juz segments, 604-page scrubber — recognition by the text itself, since surah names are other words); ✧ compose (generates a new journey from the reader's current position — root journey, addressal arc, marker field; no "surprise me" button). ✕ dismisses any layer, always returning to the exact ayah and scroll position — the reader never leaves the Quran.

**Architectures:** the Page (app opens to full-bleed 15-line Uthmani, no dashboard); layers not screens (everything rises over the page); the compass; word depth; root; paths (the 3,354 seeds are entry points via ◈, never a catalog screen); fields; the addressed; rasm beholding; composing; search by the letters themselves (Arabic keyboard, typed Quranic letters, results as ayahs — no placeholder text, absence shown by stillness); kept places & silent return (saved ayahs as text previews, last-read restores wordlessly).

**State without words:** loading is a shimmer; offline/failure is stillness then a retry glyph (↻); completion is a single breath animation. Nothing is announced in words.

**Verification — the wordless audit (must pass before done):** screenshot every reachable surface and extract every rendered token — every word must occur in the canonical Quranic corpus (numerals only in end-markers/compass); any other token is a FAIL. Then the full walk using glyphs and gestures only: any page → tap word → ❖ → occurrence jump → ◈ → ◉ → ⬔ → ◐ → ◍ → ✧ → ✕ — encountering no words at any step.

**This supersedes §8's "Arabic-first labels" allowance in full: there are no labels at all now.** §§1–7 content stands minus the prose renderings this law excludes. Rule of done: **if the only words on screen are not Quranic, it is not done.**
