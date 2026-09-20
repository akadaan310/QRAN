# BUILD_PROMPT — One-Shot Claude Code Session Brief

**Mission:** build the mobile-only interactive prototype of the 15-line Immersion UI System.
This is the Phase 1 prototype defined in `CLAUDE.md`: the approval gate. Nothing beyond
the UI system gets built. The owner has **not** said "approved" — do not pre-build phase 2.

**Working directory:** this repo root.
Build the prototype under `prototype/`. Never edit `references/` in place.

---

## 1. Read first, in this order

1. `CLAUDE.md` — session brief, mission, covenant, working rules.
2. `docs/PHASE-01-UI-SYSTEM.md` — design tokens, component inventory, motion language, accessibility.
3. `docs/ARCHITECTURE.md` — target architecture (post-Phase-1; do **not** build it — read for direction only).
4. `docs/REFERENCES.md` — what each reference project contributes.
5. The new design sources (under `curriculum-wiki-matrix/`):
   - `spec-ui/README.md`, then `spec-ui/00_design_pillars.md` through `spec-ui/08_directory_layout.md` (10 docs: the 15-line UI blueprint — 4 pillars, 15-line canvas spec, F01–F20 feature registry, 4-layer interaction matrix, HUD taxonomy, typography system, cognitive program, operational spec sheet).
   - `product-spec/00_executive_summary.md` through `product-spec/06_deployment_roadmap.md` (7 docs: ingestion pipeline, runtime architecture, UX dictionary, HUD instrumentation, sync schema, roadmap). Implement **00–04** as the UI system; implement **05** as local-only persistence honoring the schema (no server, no network); treat **06** as plan-only.
   - `product-spec/user-journey.html` — the 16 user stories (US-1.1–US-5.3); these are your acceptance criteria.
   - `curriculum-wiki-matrix/05_discovery_ledger/wiki/curriculum-wiki.html` — reference for real ledger measurements behind the fixture data.
6. Reference material (read-only — vendor what you need, never edit in place):
   - `references/isnaad/` — the eight structural detectors and the acceptance-test discipline (`npm run verify` pattern: pin sample passages as tests so a change that stops finding them is wrong).
   - `references/mirtal/` — formal planner layer, information-weighted edges.
   - `references/sayyarah/index.html` — the 24 verb-named operations, the four refusals, the "describe what you stand on" rule.

---

## 2. Scope contract — the gate, in writing

**IN SCOPE (UI system only):**
- Mobile-only web app prototype: the 15-line canvas, all 20 features (F01–F20) as front-end behaviors, the 18-gesture dictionary with dismissals and fallbacks, the 6 HUD states, the 4-beat onboarding, local persistence per the 05 schema.
- 2–3 sample pages with vendored fixture data under `prototype/data/`. Fixtures are clearly labeled as fixtures (measurement honesty — a guess is a finding, not a fact).
- Static build (`npm run build`) + local preview. PWA manifest + service worker for offline use of vendored data.

**OUT OF SCOPE (do not build):**
- Full corpus import. Backend, accounts, cloud sync, or any network service.
- Experience registry beyond the 2–3 samples. Deployment beyond prototype needs.
- Anything in `docs/ARCHITECTURE.md` marked post-Phase-1.
- Spending money, signing up for services, or changing anything outside this repo — ask first.

**Reconciliation note:** where the new 15-line specs and `docs/PHASE-01-UI-SYSTEM.md` disagree (e.g., lane coordinates 1–15 vs. the project's ⟨sūrah:āyah⟩ margin convention), follow the project's covenant for apparatus, follow the new specs for canvas geometry, and **document the decision** in `docs/PHASE-01-UI-SYSTEM.md` (it is kept current).

---

## 3. Mobile-only target — hard requirements

- Portrait-first layout; landscape must not break. `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`; safe-area insets on all chrome.
- Touch-first: Pointer Events throughout; press-pressure via touch force where available with dwell-time fallback; `touch-action` set deliberately per region. **No hover-dependent interaction** — every gesture has the tap fallback from the 03 dictionary.
- 60fps budget on mid-range phones: text layer never waits on canvas/effects; heavy layers degrade gracefully (effects dim before text does).
- Arabic-first: no translations anywhere in the UI. RTL is the default direction. Amiri / Amiri Quran for ʿUthmānī rasm (line-height ≥ 1.9), Kufi for headings, IBM Plex Mono for margin apparatus. Apparatus typographically subordinate — never competing with the line.
- Motion language: drift, not slide; return-to-anchor beat on journey close; respectful pacing (no auto-play, no scroll-jacking, any motion stillable).

---

## 4. What to build — implementation checklist

**Canvas** (`spec-ui/01`): 15 lanes, 14 gutters, 2 margin rails, rigid page bound. Equilibrium governor: measure → claim → redistribute, constant total page height, sacred legibility minimum, ~400 ms eased breathing. Lane state = 5 values (intensity, friction, axis, lens, depth) from fixture JSON — the only inputs typography/HUD/features may read.

**Features F01–F20** (`spec-ui/02`, `spec-ui/03`): nine anomaly lenses, four instruments (friction meter, invertibility audit, rigidity rail, proximity axis HUD), four deep interactions, three page systems. Every feature broken across the 4-layer matrix (physical / typography / HUD / cognitive).

**Four signature gestures** (`product-spec/03`): 15-vector lane changes · 3-speed gutter press (filaments → skeleton → root strands, rail shows 1/2/3) · echo-trajectory orbit (double-tap word → beacons → filaments nearest-first → radial arcs → outward-fling dismissal, trailing thread never lost) · rasm pinch (marks dissolve epicenter-outward ~500 ms → gray skeleton canvas → spread heals dot-by-dot with ripples).

**HUD states** (`spec-ui/04`, `product-spec/04`): Rest, Tracking, Locked, Lens, Orbit, Rasm — with entry/exit conditions, per-state rail appearance, and the non-covering law (no metric ever touches the letterforms; threads cross lanes *behind* the text layer only).

**Onboarding** (`spec-ui/07` stages 1–4): page-as-page → first lens → first perspective shift → first skeleton reveal. Compressible guided tour; the 60-minute arc is the content model.

**Persistence** (`product-spec/05`, local-only): Discovery / Checkpoint / NavigationState / PageSession in IndexedDB (or localStorage with justification), honoring the schema's merge rules (additive for authored work, last-writer-wins per field for nav state, debounced nav writes, immediate authored writes).

**Data** (`prototype/data/`): 2–3 sample pages. Vendor page text + per-lane analytics fixtures derived from the references; label every fixture as fixture; pin 2–3 sample passages as acceptance tests in the isnaad spirit (`npm run verify` or equivalent — a change that stops finding them is wrong).

---

## 5. Suggested stack (justify any deviation)

Vite + TypeScript, **no UI framework** (vanilla DOM + CSS custom properties — this is a gesture-heavy single-canvas UI; keep the bundle small for the 60fps budget). Web Animations API for the eased transitions. One tiny explicit store matching the viewport state record in `product-spec/02` (focused lane, lenses, HUD density, orbit hub, rasm, lock, track). Repo-relative paths only. Reproducible builds; derived artifacts regenerate from source — never hand-edit generated JSON/HTML.

**Scaffold:**
```
prototype/
├── index.html
├── manifest.webmanifest
├── src/
│   ├── main.ts            # boot, store, wiring
│   ├── canvas/            # lanes, gutters, rails, governor
│   ├── gestures/          # pointer handling, 18-gesture dictionary
│   ├── hud/               # 6 states, rail instruments
│   ├── features/          # F01–F20 behaviors
│   ├── onboarding/        # 4-beat guided tour
│   ├── store/             # viewport state record + local persistence
│   └── styles/            # tokens, typography, motion
├── data/                  # vendored sample pages + lane fixtures
├── scripts/               # fixture generators (source of truth for data/)
└── QA_NOTES.md            # your verification pass (write it as you go)
```

---

## 6. Build order (one shot, in this sequence)

1. Read everything in §1. Write a 10-line plan in `prototype/QA_NOTES.md` and proceed.
2. Scaffold Vite + TS + PWA shell; tokens + typography from `docs/PHASE-01-UI-SYSTEM.md`.
3. Canvas: lanes/gutters/rails, rigid bound, governor breathing on fixture data.
4. Gestures: the 4 signature flows first, then the full 18-gesture dictionary with dismissals + fallbacks.
5. HUD: 6 states + rail instruments + non-covering law.
6. Features F01–F20 wired to lane state.
7. Onboarding 4 beats.
8. Local persistence per 05 schema.
9. Fixture data for 2–3 sample pages + acceptance-test pins.
10. Verification pass (§7). Update `docs/PHASE-01-UI-SYSTEM.md` with system decisions. Commit with literature-grade messages.

---

## 7. Definition of done

- [ ] `npm run build` clean; static output serves locally with no server dependency beyond static files.
- [ ] All **16 user stories** (US-1.1–US-5.3 in `product-spec/user-journey.html`) demonstrable on a mobile viewport, touch only.
- [ ] All 18 gestures fire with correct dismissals and fallbacks; all 6 HUD states reachable.
- [ ] Onboarding completable; page footprint unbroken in every state (spot-check via the acceptance-test pins).
- [ ] Fixtures labeled as fixtures; `references/` untouched; no full-corpus import; no backend.
- [ ] `prototype/QA_NOTES.md` records the verification pass, including anything that didn't work (kept failures are findings).
- [ ] `docs/PHASE-01-UI-SYSTEM.md` updated with decisions made during the build.

**Then stop.** The prototype is the approval gate. Await the owner's explicit "approved" before anything else.
