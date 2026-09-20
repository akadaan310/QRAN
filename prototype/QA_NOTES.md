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

# FINALITY_PROMPT — the complete immersive Quran explorer

**Standing order (2026-09-20, in chat, uploaded as `FINALITY_PROMPT.md`):**
"NO APPROVALS. JUST BUILD AND PROSPER." The approval gate above is revoked
by the owner's own explicit instruction, in the same conversation that
established it — this is the owner amending their own project's process,
not a third party overriding it. Everything below was built and verified
without pausing for review, per that instruction; nothing here was rubber-
stamped as "approved" and nothing needed to be.

**Extends, does not rewrite,** the Phase-1 engine: `canvas/`, `features/`,
`gestures/`, `hud/`, `store/` are untouched except where noted (governor's
natural-height floor, `GestureController.destroy()`, `onWordTap`). Every
Phase-1 acceptance criterion re-verified passing after this build (§Full
verification pass below) — the 3 fixture pages and `npm run verify` still
work exactly as before.

## Data verification (done before writing any app code)

The prompt claimed a complete data layer already existed at `data/` with
specific stats. It did not exist in the branch this session started from —
`git fetch && git merge origin/main` pulled it in from commits made
elsewhere in the same repo. Every claimed count was verified directly
against the files, not taken on faith: 114 surahs, 6236 ayahs (mushaf
order confirmed at surah boundaries), 114 per-surah word files, 1642 roots
with real classical definitions (spot-checked against `كتاب العين`, `تاج
العروس`, `المحكم والمحيط الأعظم`), 21,295 unique word-forms, 3354
experiences (2500+400+454), 8 archetypes, 604 mushaf pages. See
`data/SOURCES.md` for the full provenance chain (Quran.com CC-BY-4.0, QAC
v0.4 GPL, Hawramani lexicon GPL-3.0).

## Architecture added

- **`prototype/scripts/sync-data.mjs`** copies repo-root `data/` into
  `prototype/public/data/` (gitignored, regenerated by `predev`/`prebuild`)
  so the app fetches it as static assets at runtime instead of bundling it
  — `roots.json` alone is 5MB; ES-importing this layer the way the Phase-1
  fixtures were imported would defeat lazy loading entirely.
- **`prototype/scripts/build-index.mjs`** derives what the raw data layer
  doesn't provide: complete root/word occurrence indices (`roots.json` only
  carries a count, not loci), a word→root map, and the vocative-addressal
  index (§7.3). **`build-qalam.mjs`** parses the 30 QALAM markers into
  structured JSON. Both run before `sync-data`'s output is used.
- **`src/data/`** — typed loaders (`loaders.ts`, one `fetch` + in-memory
  cache per file, large lexicons lazy), the corpus navigator (`nav.ts`,
  global ayah-index arithmetic for prev/next/surah/juz/page jumps), the
  rasm transform (`rasm.ts`, ported from `scripts/gen-fixtures.mjs`), the
  lane-state heuristic (`laneState.ts`, see reduction below), and
  `screenBuilder.ts`, which assembles a real `PageFixture` — the *exact*
  type the Phase-1 engine already consumes — from any list of loci. This
  is what let the engine extend rather than rewrite: the reading canvas,
  QALAM scenarios (§7.1), and vocative journeys (§7.3) all just call
  `buildScreen()` with a different loci list.
- **`src/app/`** — the router (`router.ts`, a small hash router; handlers
  may be async, with a resolution token so a slow navigation's late
  cleanup never clobbers a screen the reader has since moved to), the
  الفهرس home (`fehresScreen.ts`), the reader (`readerScreen.ts` +
  `canvasHost.ts`, the shared engine-mounting code reader/QALAM/archetype
  screens all call), word/root pages (`wordPageScreen.ts`,
  `rootPageScreen.ts`, `occurrenceList.ts`), the experiences browser
  (`experiencesScreen.ts`, `experienceScreen.ts`), and the §7.1/§7.3
  journey screens (`qalamScreen.ts`, `archetypeScreen.ts`).

## Deliberate reductions (measurement honesty)

1. **Axis (address/speaker/absent) and F04 are never assigned on the real
   corpus.** The Phase-1 fixture heuristic computed these from the isnaad
   corpus's person/number/gender feature string; `data/quran/words/*.json`
   carries root/lemma/pos_tag but not that field. Rather than fabricate a
   person signal, `src/data/laneState.ts` reports axis as a neutral default
   and never fires F04 — documented in the module's own docstring. F01
   (قول detection), F06 (verbless lanes), F09 (root repetition), intensity,
   friction, and depth are all still computed from real signal.
2. **The equilibrium governor now takes each lane's measured rendered
   height as an additional floor**, not just the fixed constant — a real
   āyah can run to 20+ words and wrap to multiple lines at mobile width,
   which the Phase-1 constant (sized for short fixture lines) didn't
   anticipate. Caught by Playwright hit-testing (a click on lane 3 landed
   on lane 4's overflowing text), not by eye. `governor.ts`'s
   `naturalMinHeight` input; measured live in `render.ts` before every
   governor pass.
3. **Category labels for the 3354 experiences.** isnaad's own discovery
   `cat` field is a set of 7 Latin-transliterated slugs (`istihdar`,
   `raj-al-jidhr`, …). Each was mapped to a real Arabic label by finding
   the fixed portion shared by every title in that category (verified,
   not invented — e.g. every `istihdar`-tagged title is literally
   "استحضار الغائب إلى الخطاب"; `raj-al-jidhr` titles are all "رجع الجذر
   «X»" for varying X, so the category label is "رجع الجذر"). See
   `experiencesScreen.ts`'s `CAT_LABELS`.
4. **The 8 archetypes (`archetypes.json`) do not filter the 3354
   experiences.** They come from this project's own
   `curriculum-wiki-matrix` discovery-ledger run — a *different*
   classification scheme over the same three source repositories, not a
   tag on isnaad's discoveries. Presenting them as a cross-filter over the
   experience catalog would be an invented correlation the data doesn't
   support. They're shown as their own reference cards, quoted and
   attributed, explicitly labeled as a separate source in the UI itself.
5. **QALAM marker (§7.1) and vocative (§7.3) loci are capped** (200 and
   whatever the corpus actually contains, respectively) and, for markers,
   can include very common function words among the anchor terms (e.g.
   marker 18's anchor includes "من"), which dilutes how tightly connected
   a derived scenario's loci are to the marker's specific reading. Not
   filtered further given the time budget; noted rather than hidden.
6. **Vocative continuation is a documented heuristic, not a parser.** "يا"
   fuses orthographically with its addressee in this corpus (confirmed
   against `align.json`: `يَـٰمُوسَىٰٓ` is one space-delimited token in the
   real mushaf text, not two) — detected by an exact diacritic signature
   (ي + optional fatha + tatweel + dagger-alif), verified to produce zero
   false positives against hamza-initial verbs across the full corpus. A
   short list of "continuer" bases (أيها/بني/أهل/معشر/…) extends the
   phrase by one more token, and one further for a following
   الذين/الذي — this occasionally over-extends (يَـٰبَنِىَّ, the diminutive
   "O my dear son," gets padded with the next clause on its 2 occurrences)
   but correctly separates common constructs like بني إسرائيل from بني
   آدم. See `build-index.mjs`'s own comments.
7. **`onWordTap` reduces the word→lexicon lookup to exact surface-form
   matching** (`data/lexicon/words.json`'s own granularity, case-ending
   sensitive) rather than lemma-level grouping — so "ٱللَّهِ" and "ٱللَّهُ"
   are two different word pages with different occurrence counts, matching
   how the source lexicon itself is keyed, not collapsed further.

## Language-agnostic audit (Phase E) — findings and fixes

Not just an assertion that the ban list was honored — actually grepped for
it and found three real leaks, all fixed:

1. The lens-rail chips (F01–F09, an opt-in advanced layer inside the
   reading canvas, not primary navigation) carried `title="F01"` etc. as
   native tooltips — removed.
2. The invertibility-audit drawer showed raw lens codes ("F06") and
   English parentheticals ("التراكب (Superposition)") — replaced with the
   lens's Arabic label (`LENS_LABELS`, now exported from `lensRail.ts` and
   reused) and dropped the English entirely.
3. The old `main.ts`'s Runway/Excavator/Collider track-glyph display
   (`الممرّ`/`الحفّار`/`المصادِم`) was already dropped when `canvasHost.ts`
   was written from scratch — confirmed by grep, not reintroduced.

**Judgment call, not a violation:** the lens-rail's Arabic instrument names
(شرخ "rupture", انطواء "collapse", …) stay. They're real Arabic words, not
literal "F01"-style codes or the specific English terms the prompt bans by
name, and they live inside an optional advanced layer of the reading
canvas — not the السور/الجذور/الصفحات/التجارب navigation a stranger needs
to use the app at all. Flagged here rather than silently decided.

## Full verification pass

`npm run build` (prebuild data pipeline + tsc --noEmit + vite build) —
clean. `npm run verify` — all 15 Phase-1 pins still hold (unaffected;
different fixture files). Playwright against the built `dist/`, mobile
viewport, zero console/page errors throughout every one of the following:

- [x] الفهرس home: all 5 sections render (114 surahs, 30 juz, 604 pages, root search, experiences hub); word search (typed "رحمن" → 134 real matches).
- [x] Tap a surah → real reading canvas, 15 real ayahs, Phase-1 engine fully live (lens rail, HUD, gestures all present).
- [x] Word tap → sheet with real root/occurrence-count/opt-in translation; "صفحة الكلمة"/"صفحة الجذر" both navigate correctly.
- [x] Word page: 40+ real occurrences rendered as real ayah text with the word `<mark>`ed, orderable, paginated.
- [x] Root page: real classical definitions (3 books) render, occurrence list works identically to the word page.
- [x] Experiences browser: category/surah/archetype/QALAM/vocative tabs all populate from real data; single-experience page renders real loci text.
- [x] QALAM scenario (`qalam/6`, الغلام marker): derives 15 real loci live and mounts the full canvas engine on them.
- [x] Archetype journey (vocative, 79 real phrases found in the corpus): mounts the canvas engine on a non-consecutive loci list and pages through it.
- [x] `surah/:n`, `page/:n` (1–604), `juz/:n` (1–30) all resolve to the correct screen.
- [x] Next/prev screen crosses a surah boundary correctly (tested at البقرة↔آل عمران) and the true end of the Quran (سورة الناس) renders exactly 11 lanes — `6236 mod 15` — with "next" correctly disabled, not padded or truncated silently.
- [x] Checkpoint authoring persists to IndexedDB from the real reader (not just the old fixture pages).
- [x] Both color themes render with zero errors on a real corpus screen (`page/50`).
- [x] Service worker registers and reaches `activated` (confirmed earlier in this file for the underlying mechanism; unaffected by this build's changes since `data/` is same-origin GET and covered by the existing runtime-cache-everything strategy).

Not tested: a full 416-screen traversal start-to-finish (spot-checked at
multiple points instead — Fātiḥa, mid-Baqarah, end of Nās — given the time
budget), and the generative "فاجئني" button's three branches individually
beyond confirming it fires without error (it composes one of: a catalog
experience, a QALAM scenario, or a vocative journey, uniformly at random).

## What's deliberately excluded from this build (§5 non-negotiables, restated)

No fabricated content anywhere — every gloss, definition, locus, and
occurrence comes from `data/` or `references/`, or the app says nothing
rather than guess. The 30 QALAM markers and the 8 archetypes are shown
quoted and attributed as their authors' proposed readings, never as
tafsīr, tajwīd, qirāʾāt, or linguistics. The rasm skeleton (already built
in Phase 1 as the F17 pinch gesture) is a render-time transform of the
canonical string, never stored, never a manuscript claim. Archetype titles
are the vocative phrases themselves, exactly as found in the text — no
invented character names, no backstories. Translation is opt-in and off by
default everywhere it appears. No network calls beyond same-origin static
asset fetches; no accounts; no backend.
