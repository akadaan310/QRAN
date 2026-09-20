# QA_NOTES — Phase 1 prototype build record

## Build plan (written before implementation, per BUILD_PROMPT §6)

1. Scaffold Vite + TS, no framework; PWA shell; design tokens + typography
   from `docs/PHASE-01-UI-SYSTEM.md` and `spec-ui/05`.
2. Canvas: 15 lanes / 14 gutters / 2 margin rails as real DOM (text must stay
   real, screen-readable — never canvas-rasterized); equilibrium governor
   (measure → claim → redistribute, ~400ms ease, sacred legibility minimum).
3. Store: one explicit viewport-state record (`src/store/state.ts`) matching
   product-spec/02 §State model; five lane values (intensity, friction, axis,
   lens, depth) are the only inputs typography/HUD/features may read.
4. Gestures: the four signature flows first (lane focus, 3-speed gutter
   press, echo-trajectory orbit, rasm pinch), then the remaining 14 from the
   product-spec/03 dictionary, each with a named dismissal/fallback.
5. HUD: six states (Rest/Tracking/Locked/Lens/Orbit/Rasm), seven rail
   instruments, non-covering law enforced (threads pass behind text only).
6. Features F01–F20 wired to lane state per spec-ui/02+03's 4-layer matrix.
7. Onboarding: 4 compressible beats (page-as-page → first lens → first
   perspective shift → first skeleton reveal) per spec-ui/07 stages 1–4.
8. Persistence: IndexedDB, 4 stores (Discovery/Checkpoint/NavigationState/
   PageSession) per product-spec/05, local-only, additive merge for authored
   work, debounced nav writes.
9. Fixtures: 3 real sample pages vendored from `references/isnaad`'s Uthmani
   text + QAC-style morphology (not invented text); lane-state values are
   heuristic derivations, explicitly labeled fixtures; 2–3 passages pinned as
   `npm run verify` acceptance tests.
10. Verification pass, update `docs/PHASE-01-UI-SYSTEM.md` with decisions
    made during the build, literature-grade commit. Then stop for approval.

## Reconciliation decision (BUILD_PROMPT §2)

Canvas geometry follows the new spec-ui blueprint exactly: 15 fixed lanes,
canvas-coordinate addressing (lane *n*, not verse-indexed). Margin apparatus
follows the project covenant instead of abstract coordinates: each lane's
margin cell additionally carries its real ⟨sūrah:āyah⟩ locus (citational
honesty — every lane is a real, attributable verse, never an anonymized
"line n"). Both are true at once: lane *n* is the canvas address; ⟨sūrah:āyah⟩
is what that lane cites. Recorded in `docs/PHASE-01-UI-SYSTEM.md` §6.

## Sample-page decision

The 15-line canvas is *not* a reproduction of any specific historical
mushaf's real line-breaks (no such per-line dataset is vendored in
`references/`). For the prototype, one lane = one āyah. This is declared
explicitly here and in the fixture data's `provenance.method` field — it is
a layout simplification for Phase 1, not a claim about how any printed
mushaf actually breaks lines. Real per-line typesetting is out of scope for
Phase 1 (see docs/ARCHITECTURE.md's "what this is NOT").

Three sample pages, each exactly 15 āyāt, chosen for real structural
variety the lenses can honestly demonstrate (root repetition, dialogue/
nested-speech shifts, thematic unity), all Makkan and short enough to keep
the fixture generator legible:

- **Page 1** — Sūrah 55 (الرحمٰن), āyāt 1–15. Root "و-ز-ن" recurs at āyāt
  7/8/9 — real material for the echo-trajectory demo (F15/US-2.1).
- **Page 2** — Sūrah 18 (الكهف), āyāt 60–74. Dense direct-speech switching
  (قال) — real material for the rupture/shift lenses (F01/F04/F14/US-1.4).
- **Page 3** — Sūrahs 114 + 113 + 112 (الناس، الفلق، الإخلاص), 6+5+4 = 15
  āyāt. Short, well-known, varied rhetorical shape (refuge formula repeated
  3× across two sūrahs) for a gentler onboarding-stage page.

## System decisions made during the build

These are also recorded in `docs/PHASE-01-UI-SYSTEM.md` §6 (kept current per
the covenant); listed here with the reasoning:

1. **IBM Plex Mono → system monospace stack.** Vendoring a third webfont
   for apparatus text was judged unnecessary weight against the 60fps/
   bundle-size budget for a Phase-1 prototype; Amiri Quran (rasm) and Noto
   Kufi Arabic (headings) are vendored from `references/isnaad`.
2. **Rasm skeleton is a visual approximation, not a paleographic claim.**
   `scripts/gen-fixtures.mjs`'s `toSkeleton()` strips harakat and folds
   dotted letters onto a shared base stroke via a documented grouping
   table. It is good enough to *demonstrate* substrate independence (F17);
   it is not a scholarly rasm authority. See `data/SOURCES.md`.
3. **Lane-state values are a fixture, not detector output.** No real
   isnaad/al-Mirtāl run exists against these specific loci. Values are
   computed live from real per-word morphology (root repetition, person-tag
   axis blend, `قول` detection) and every page's `provenance` says so
   explicitly. A lane with no qualifying signal gets `lens: null` — per
   product-spec/01, the absence is data.
4. **F02/F03/F05/F07/F08 are generic, computed activations**, not
   pre-tagged in the fixture (unlike F01/F04/F06/F09, which are). Toggling
   one of these five lens chips while a lane is focused computes its target
   live (nearest shared-root lane, page's max-word-count lane, etc.) —
   `src/features/lensRail.ts` documents the exact rule per lens. This keeps
   all 20 features exercisable without fabricating detector classifications
   the reference projects never actually ran here.
5. **One lane = one āyah** for all three sample pages (not a reproduction
   of any real mushaf's line-breaks — see §Sample-page decision above).
6. **Lane height respects measured natural content height.** A long āyah
   word-wraps at mobile width; the equilibrium governor's fixed legibility
   floor (`LANE_MIN_H`) is not enough on its own to prevent that wrapped
   text from overlapping neighboring lanes/gutters. `CanvasView.render()`
   measures each lane's actual rendered height every pass and feeds it to
   the governor as a per-lane floor (`governor.ts`'s `naturalMinHeight`) —
   text is never compressed below what it needs to avoid overlapping its
   neighbors. This was caught by Playwright hit-testing during verification
   (below), not by visual inspection alone: the overlap didn't look wrong
   in a static screenshot, but broke pointer targeting on the gutter
   beneath the overflowing lane.
7. **Row-split before/after sub-rows split at the word-count midpoint**,
   not at a detected pivot word — no per-word ignition-point signal exists
   in the fixture. Documented in `render.ts` at the point words are built.
8. **Orbit "bending into concentric arcs" is a per-lane CSS transform**
   (translateX + rotate, amplitude by distance from hub, phase-shifted by
   drag), not literal circular text layout — reflowing real DOM glyphs onto
   a circle isn't something CSS can do without per-character SVG text,
   which would cost both the 60fps budget and the "verse text as real DOM
   text" accessibility requirement.
9. **Scroll-driven focus is gated on an actual user scroll event** (with a
   short settle debounce) before it can move focus or trigger a lock. An
   earlier version routed the IntersectionObserver straight into focus and
   the lock guard; layout settling right after onboarding closed (fonts,
   the overlay disappearing) fired spurious intersection changes that
   walked focus across lanes — including straight through a deep
   checkpoint — before the reader had touched anything. Caught by
   Playwright, not by hand-testing (see below).

## Known limitations (kept, not hidden — measurement honesty)

- Checkpoint "deep/shallow" classification is a friction-threshold proxy
  (`friction ≥ 0.7` / `≥ 0.4`), not a real chronological-boundary detector;
  said so in `data/SOURCES.md`.
- The lens rail's F02/F03/F05/F07/F08 pick their target lane automatically
  (nearest/first match) rather than through a dedicated 2-lane selection
  gesture, to stay within the product-spec/03 18-gesture dictionary rather
  than inventing a 19th/20th gesture. Documented in `lensRail.ts`.
- Multi-device sync (product-spec/05's "Universal State Synchronization
  Engine") is explicitly out of scope per product-spec/06 stage 5 and
  CLAUDE.md's working rules; only the local-device half is implemented.
- Track (Runway/Excavator/Collider) auto-switching is a simple interaction
  counter (3 deep interactions ⇒ Excavator), not the full "dwell time,
  gesture depth, session stage" inference product-spec/02 describes — a
  reasonable first cut for Phase 1, not tuned against real readers.

## Verification pass

`npm run build` (tsc --noEmit + vite build) — clean, zero errors, zero
warnings. `npm run verify` — all 15 pins hold (3 pinned passages + 3
cross-page invariants × 3 pages; see `scripts/verify.mjs` output).

Manual + Playwright-driven verification against a static `dist/` build
(mobile viewport, both color schemes, `prefers-reduced-motion`), zero
console/page errors throughout:

- [x] Entry plate renders, blocks interaction until "ادخل", then mounts the canvas.
- [x] 15 lanes / 14 gutters render as real DOM text (not canvas), RTL, Amiri Quran.
- [x] US-1.1 — first paint is calm/static; tour names the 3 zones; tap lifts a lane within a frame.
- [x] US-1.2/1.3 — gutter press escalates filaments → skeleton → root strands (verified speed reaches 1 at 250ms, 2 at 550ms per the dwell-time fallback thresholds; release reverses).
- [x] US-1.4 — focusing an F04/F01 lane fires tint (`data-warm`) + split (`data-split`) + seam together; tap seam merges.
- [x] US-1.5 — two-pointer pinch on the lanes area sets rasm state; skeleton layer shows, rails dim.
- [x] US-2.1/2.2 — double-tap a rooted word raises beacons on its other page occurrences, draws trajectories, enters orbit mode; drag rotates; beacon tap jumps with a trailing thread; fling-distance tap dismisses.
- [x] US-3.1/3.2/3.3 — tapping into a deep-checkpoint lane engages the lock (toast narrates); forward taps refused; exactly 3 reverse taps release it; checkpoint glow logic present on the rail.
- [x] US-4.1 — friction bars render per lane, scaled to page max; tap isolates + opens the audit.
- [x] US-4.2 — audit drawer shows superposition/survivors/loss/closure + provenance note; "save this discovery" writes to IndexedDB.
- [x] US-4.3 — long-press on an empty left-rail cell authors a checkpoint (verified: `data-authored="1"`, toast confirms); persisted via `Persistence.addCheckpoint`.
- [x] US-5.1 — lens rail refuses (a) more than 2 stacked lenses and (b) the named F02+F09 pair, with a rail toast naming the reason; never silent, never a crash.
- [x] US-5.2 — no popups/banners/modals anywhere in the implementation (toast rail is the only narration surface, auto-dismissing); Rest state reachable (HUD controller).
- [x] US-5.3 — rasm reveal and the lock both work on first trigger with no setup beyond the gesture itself.
- [x] Keyboard fallback: ↑/↓ move focus, ←/→ cycle gutter speed, space toggles rasm, `m` cycles rail density, `f` opens the audit, Escape dismisses orbit/audit.
- [x] `prefers-reduced-motion` degrades the starfield to the static CSS gradient (`data-degraded="1"` confirmed) and collapses all transition durations to 1ms.
- [x] Light and dark themes both render (tokens.css); manual toggle available in the settings corner.
- [x] Service worker registers and reaches `activated` state on a static-served build.
- [x] `npm run build` output is served directly by a static file server with no other server dependency (`http-server dist`).

Not exhaustively device-tested (no physical touch device in this
environment): real touch-force pressure escalation (`PressEscalator`'s
force branch), on-device haptics (none implemented — visual detent only,
per "no gesture waits on data" the compression itself *is* the feedback),
and true multi-touch pinch on a physical screen (verified via synthetic
multi-pointer events in Playwright, which exercises the same code path as
real touch but isn't a substitute for a physical device pass).

## What's deliberately excluded from this system (Sayyarah-style refusals)

Per PHASE-01-UI-SYSTEM.md §5 requirement for a written exclusion list:

1. No translation, anywhere, in any state — Arabic-first is structural, not a toggle.
2. No interpretation of the text's meaning — the system reveals structure; reading it remains the reader's work (product-spec/00 principle 3, spec-ui/06 refusals).
3. No auto-play, no scroll-jacking, no gamification (streaks/scores/leaderboards) — spec-ui/06 "what the system refuses to do".
4. No network calls, no accounts, no backend — everything in this prototype runs from the static build with vendored data.
5. No full-corpus import, no experience registry beyond these 3 sample pages, no deployment beyond the prototype's own needs — the standing gate (BUILD_PROMPT §2 scope contract).
6. No content ever renders in the margins; no instrumentation ever covers the letterforms — enforced structurally (DOM order + `pointer-events`), not just by convention.

---

# QA_NOTES — the sacred interface (FINALITY_PROMPT §§1–9)

Everything above this line is the Phase-1 record and stays true of the Phase-1
modules, which are still in the tree. This section records the build that
§§7–9 ordered: the whole Quran, the lexicon by usage, generative journeys, and
an interface whose only words are the Quran's own.

## What §9 superseded, and what that cost

§9 ("the sacred interface", owner directive 2026-09-20, FINAL) states the law
plainly: **the only words rendered anywhere in the app are Quranic Arabic.**
That revokes, in order: the Phase-1 entry plate, settings corner, toasts,
onboarding sentences and track glyph labels (§8 had already rejected the
card-and-chip look); §4 Phase B's opt-in English translation layer; §4 Phase B
and §7.2's rendering of classical definitions, maṣādir and glosses; §4 Phase
C's Arabic-labelled فهرس sections; §4 Phase D's four-way experiences browser
with its category, surah and archetype filters and its "فاجئني" button; and
§5's in-app About screen.

Three of those deserve to be named as real costs rather than tidied away:

1. **The lexicon's prose is in the repo and not on the screen.** `data/lexicon`
   still carries all 1642 roots with their Arabic and English glosses, their
   book-attributed classical definitions and their maṣādir, and the build still
   regenerates them. The app renders none of it. What ❖ shows instead is every
   ayah the root grows a word in — the Quran defining by usage. This is a
   faithful reading of §9 ("the UI shows roots through their occurrences"), but
   a reader who wants Lisān al-ʿArab's entry on a root will not find it here.

2. **Attribution moved out of the interface.** §5 requires the `data/SOURCES.md`
   attributions to be surfaced in-app; §9 forbids the words that would take. The
   resolution: `dist/data/SOURCES.md` ships with every build (the corpus
   directory is copied wholesale), so the attributions travel with the app and
   are one URL away at `/data/SOURCES.md` — but they are not on a screen, and a
   reader who never looks at the data directory will not see them. Recorded
   here rather than resolved silently, because it is §5 giving way to §9, not
   §5 being met.

3. **The experiences are reachable but not browsable.** All 3354 survive as
   walks and every one of them is anchored to at least one of 4848 ayahs, where
   it appears as a ◈ in the margin (`npm run verify` pins exactly this: a walk
   nothing anchors would be content that exists and cannot be reached). But
   there is no way to ask "show me the motifs" — discovery is composed from
   where the reader is standing, which is what §8.4 demands and what a reader
   looking for a specific catalogued discovery will find frustrating.

The Phase-1 modules (`src/canvas`, `src/features`, `src/gestures`, `src/hud`,
`src/onboarding`, `src/store/state.ts`) are **kept, not deleted**: still
type-checked by `npm run build`, still pinned by `npm run verify`'s fixture
tests. They are no longer mounted. `src/main.ts` boots `src/sacred/` instead.

## Decisions made during this build

1. **One screen is one Madani page.** The 604-page division in `ayat.json` is
   real, so the app navigates it directly rather than inventing a grouping.
   The text then *flows* and is fitted so a page occupies roughly the fifteen
   lines a Madani muṣḥaf prints. **The page division is real; the line breaks
   inside it are the browser's** — no per-line typesetting dataset is vendored,
   and the app does not claim otherwise. (This supersedes the Phase-1 "one lane
   = one āyah" simplification with a truer one, but it is still a
   simplification.)

2. **No surah headings, no basmala insertion.** A surah's *name* is not in the
   Quran's own text, so §9 admits none. A new surah opening mid-page is shown
   as a break — space and a hairline. The basmala is rendered only where
   `ayat.json` actually carries it as an ayah (al-Fātiḥa 1); it is not inserted
   at the head of the other 112 that traditionally print it, because that would
   be the app adding text to the muṣḥaf.

3. **The corpus is served from `data/`, not copied into `prototype/public/`.**
   A `vite` plugin serves `/data/…` from the repo's canonical directory in dev
   and copies it into `dist/data/` at build. A second committed copy would be a
   generated artifact living next to its own source.

4. **The eight glyphs are a closed canon** (`src/sacred/glyphs.ts`). Adding a
   ninth would need the owner's directive to change. The four ordering marks
   (▪ ▮ ▬ ▭), ✕ and ↻ are listed in the same file for the same reason.

5. **Grouping is shown as seams, not headings.** ✦ and ❖ order their
   occurrences four ways, and all four orders are ascending — what differs is
   where the groups break. A heading would be a word, and a bare group number
   would be a numeral outside the two places §9 allows them, so the four
   orderings differ by the hairlines between blocks and nothing else. This is
   an honest rendering of "grouped by", and it is also a weaker signal than a
   heading would be.

6. **The dagger alef is genuinely ambiguous, so both foldings are indexed.**
   In غُلَـٰمٌ the mark stands for the alef of غلام; in ٱلرَّحْمَـٰنِ it sits over a
   name written الرحمن. Every lookup tries both foldings
   (`scripts/build-data/build_infinite.py`'s `variants`, mirrored in
   `src/sacred/normalize.ts`). Before this was handled, marker 6 (غلام)
   resolved to nothing at all.

7. **Marker anchors resolve in three widening passes, and the pass is
   recorded.** `exact` (the anchor is a word form the Quran uses), then `root`,
   then `contains`. Every anchor in `data/markers/markers.json` carries the
   pass that found it, so the app never has to guess how solid a field is, and
   an anchor that survives none of the three is listed under `unresolved` and
   contributes nothing. Marker 4's parenthesis (تعقيل) is a maṣdar the Quran
   never uses; markers whose heading anchors all fail fall back to the Arabic
   the owner quoted in the marker's body, and that fallback is recorded as
   `source: "body"`.

8. **Vocative construct heads are derived, not stipulated.** A vocative head is
   treated as needing its complement (يَـٰٓأَيُّهَا ٱلنَّاسُ, not يَـٰٓأَيُّهَا) iff, in
   the whole corpus, it never ends an ayah and every token following it is a
   noun, proper noun or relative pronoun. يَـٰمُوسَىٰ (which ends ayahs) and
   يَـٰقَوْمِ (followed by verbs) correctly fail the test. The test keys on the
   *raw* form, because يَـٰبَنِىٓ (construct) and يَـٰبُنَىَّ ("O my son", already
   complete) fold to the same string and are not the same word.

9. **✧ prefers the rarest root.** Composing from an ayah takes an addressal it
   carries, else a marker it anchors, else its **least common** root. Preferring
   the least common one is what keeps ✧ from landing on قول every time.

10. **The page rail's ✧ seeds from the page's first ayah**, not from a
    "current" ayah — the whole page is on screen at once, so there is no
    scroll position to read a current ayah from. ✧ reached from inside a walk
    seeds from that walk's own ayah.

11. **A second IndexedDB, not a version bump.** Kept places and the last-read
    place live in `qran-sacred`; the Phase-1 `interstellar-quran-phase1`
    database and its four stores are left exactly as they were. Every call
    degrades to a no-op when storage is blocked: the reader loses memory
    between sessions, not the ability to read.

## Bugs this build found and fixed

Four of these were found by the Playwright walk, not by looking at the screen.

1. **110 ayahs carry a leading or doubled space** — 2:1's text is `" الٓمٓ"`.
   Splitting the ayah text on a single `" "` shifts every alignment span in
   those ayahs by one, rendering an empty word span and leaving the real word
   attached to nothing and untappable. The rule is to split on runs of
   whitespace, discarding empties; `data/README.md`'s normative rule now says
   so exactly, and `npm run verify` pins it.

2. **`prefers-reduced-motion` was making the text as large as possible.**
   `motion.css` set `transition-duration: 1ms !important` on `*`, and
   `transition-property` defaults to `all` — so *font-size* transitioned too,
   and the page's fit read the previous size every time it probed, accepted
   every probe, and settled at its maximum. Reduced motion now means `0s`, not
   a very short duration, and `.page__body` names its transitionable property
   explicitly. Nothing about this was visible in a screenshot of the default
   context.

3. **Margin marks stacked on top of each other.** Several ayahs can begin on
   one line — the short sūras stack four or five — and marks placed at their
   raw line tops made all but the last untappable. Cells are now placed below
   one another, each clearing the glyphs the previous one holds.

4. **The fit measured the wrong element.** `scrollHeight` never reports less
   than the box, so a page that badly under-filled the screen measured exactly
   as tall as one that fitted, and the fit could not tell "too small" from
   "just right". The text now lives in its own block inside the scroller and
   that block is what gets measured.

5. **`justify-content: center` put the top of a long page out of reach.** A
   block taller than a centered flex scrollport overflows *both* ends and the
   start cannot be scrolled back to. Now `safe center`.

6. **The service worker never cached the app's own bundle.** It registers on
   `load`, by which time the hashed JS and CSS have already been fetched, so the
   fetch handler never saw them and a first-visit reader who went offline got a
   blank page. The worker now reads the asset names out of `index.html` during
   activation and caches them, which keeps it independent of the bundler.

7. **A CSS line-clamp was printing an ellipsis** in the compass's surah cells —
   a mark that is neither Quranic nor one of the eight. The openings are now
   cut to whole words when they are built, so nothing clips and no ellipsis
   appears.

## Verification

`npm run build` — clean, zero errors, zero warnings.

`npm run verify` — all pins hold: the 15 Phase-1 fixture pins, plus new
corpus-level pins (the whitespace regression above; one alignment span per
word for all 6236 ayahs; the eight spellings on which the word stream and the
ayah text disagree, and the one that survives a spelling-blind folding) and
infinite-layer pins (77,429 occurrences indexed across 21,295 forms and 1,642
roots, no dangling loci anywhere; 74 addressals derived; all 30 markers
resolved, with marker 12's الصخرة landing on الكهف:٦٣ and nowhere else; all
3,354 walks present and every one of them anchored to a reachable ◈).

`npm run walk` — 54 pins, the two §9 verifications together:

- **The wordless audit.** Every token rendered on every reachable surface is
  checked against the canonical corpus: the page, the last page, ✦, ❖, ◈, ◉,
  ⬔, the page as rasm, the compass, the compass with results, the compass with
  kept places, and a composed journey. Glyphs from the canon, the ۝ rosette,
  and Eastern numerals inside end-markers and on the compass are admitted;
  anything else fails. Placeholder and input values are collected separately,
  since a text-node walk cannot see them. The rasm surface is audited against
  the rasm of the corpus, using the folding table parsed out of
  `src/sacred/rasm.ts` so the audit and the app cannot drift apart.
- **The glyph walk.** Any page → tap a word → ❖ → an occurrence jump → ◈ → ◉ →
  ⬔ → ◐ → ◍ → ✧ → ✕, plus page turning, the compass reaching 114:6, search by
  letters, absence shown as stillness, keeping an ayah and finding it again,
  the silent return after a reload, the light scheme, `prefers-reduced-motion`,
  and reading with the network cut. Zero console errors throughout.

## Honest limitations

- **Line breaks are the browser's**, not a muṣḥaf's (decision 1 above).
- **Not device-tested.** Multi-touch, real touch-force and on-device haptics
  are as untested as they were in Phase 1; there is no physical device here.
  The walk drives a mobile-emulated Chromium.
- **Marker fields vary enormously in tightness**, and the app shows this
  without comment: marker 12 (الصخرة) resolves to a single ayah, marker 4 —
  which fell back to the Arabic quoted in its body — to 1605. Both are honest
  outputs of the same rule. A reader cannot tell them apart from inside the
  app; the difference is recorded in `data/markers/markers.json`.
- **Search is substring matching on folded forms**, ranked by shortest form
  first, capped at 40 forms and 400 occurrences. It is not a morphological
  search: typing a root finds words containing those letters in that order,
  which is usually but not always the same thing.
- **The wordless lesson teaches four gestures**, not eight. ✦, ◈, ◍ and ◐ are
  pointed at; ❖, ◉, ⬔ and ✧ are left to be found, because they only exist
  inside surfaces the first four open.
- **The 750 single-ayah experiences** open onto one ayah and offer ✧ rather
  than a walk. They are kept rather than dropped, but a reader who taps one of
  those ◈ marks gets less than one who taps any other.
