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
