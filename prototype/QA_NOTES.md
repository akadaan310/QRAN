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
