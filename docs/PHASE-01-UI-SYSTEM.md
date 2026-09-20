# Phase 01 — Immersion UI System

**Goal:** design the shared visual/interaction language for all Interstellar
Quran experiences, and get the owner's explicit approval *before* any
experience is built.

**Phase 1 output:** this proposal (kept current) + an interactive prototype
demonstrating the system on 2–3 sample experiences. The prototype is the
approval gate.

## 1. Design tokens

| Token family | Notes |
|---|---|
| Palette | Night-sky base (deep indigo/near-black), warm paper tone for the text layer, one accent for apparatus (amber), one for interactive state. Light/dark both first-class — no light-only palettes. |
| Typography | Arabic display face (Amiri / Amiri Quran for ʿUthmānī rasm), a Kufi for headings, IBM Plex Mono for coordinates/apparatus. Arabic line-height ≥ 1.9; RTL is the default direction, not a variant. |
| Spacing / scale | Verse text at reading scale; apparatus (coordinates, weights, labels) at margin scale — typographically *subordinate*, never competing with the line. |
| Elevation / glass | Starfield canvas sits behind everything; content floats as glass panels with blur. Panels never obscure the text layer's margins. |

## 2. Component inventory

- **Starfield** — the shared background canvas (WebGL or canvas 2D): stars,
  constellations, slow drift. One instance per page; experiences tint it but
  never replace it.
- **Stations** — the atomic unit of a journey: a locus (sūrah:āyah[:word]),
  its text, its margin apparatus. Rendered pure: text first, apparatus in the
  margin.
- **Journey rail** — the path through stations: progress, scrubber, jump
  points. Controls are named for the constructs they operate on (cf. Sayyarah's
  البُرُوج / مواقع النجوم / الفَلَك), never generic player chrome.
- **Construct-named controls** — every control gets its name from a Qur'anic
  construct with a witness verse (per the Sayyarah covenant §4). Examples from
  the references: السِّراج (how far the isnād burn reaches), القمر المنير
  (the paired āyah held beside this one), الفَلَك (auto-advance/orbit).
  New controls must carry a witness.
- **Margin apparatus** — coordinates ⟨sūrah:āyah⟩, edge weights, cause labels
  (سبب), type badges (نصّي / إدراكي). Collapsible; never in the text line.
- **RTL typography layer** — the verse renderer: ʿUthmānī rasm, word-occurrence
  addressing, optional diacritic/word highlighting driven by data attributes.
- **Entry plate** — how a visitor enters an experience (cf. isnaad's الاستعاذة
  gate and mirtal's onboarding from 11:41). One respectful threshold, no
  chrome, no account wall.
- **Apparatus drawer** — "what the system claims" panel: every measurement
  shown with its provenance; guesses labeled as guesses; failed heuristics
  listed as findings.

## 3. Motion language

- **Drift, not slide.** Transitions feel like moving through space: slow
  cross-fades, parallax starfield, stations arriving rather than snapping in.
- **Return-to-anchor.** Every journey closes by returning to its seed locus
  (cf. mirtal's رجوع). The motion vocabulary includes a recognizable
  "homecoming" beat.
- **Respectful pacing.** No auto-play audio, no scroll-jacking. Auto-advance
  (الفَلَك) is opt-in and clearly signposted; any motion can be stilled.
- **60fps budget on mid phones.** Starfield degrades to static gradient
  below a perf threshold; text never waits on canvas.

## 4. Accessibility

- Full keyboard navigation: stations, rail, controls all operable; visible
  focus; documented shortcuts (space, ←/→, ↑/↓, m, f — cf. isnaad's الفرقان).
- `prefers-reduced-motion`: starfield becomes static, transitions become cuts.
- Screen-reader: verse text as real text (never canvas-rendered), apparatus
  as labeled complementary content, journey position announced.
- Contrast: body text ≥ 7:1 on both themes; apparatus ≥ 4.5:1.
- Arabic-first: UI strings in Arabic; no translation layer to maintain.

## 5. The approval gate — what "approved" means

The phase is done when the owner reviews the prototype and says so,
explicitly, in chat. Concretely the prototype must demonstrate:

1. The full component inventory, live, on 2–3 sample experiences.
2. The covenant visibly honored: pure verse lines, apparatus in the margin,
   Arabic-only, citational paths (every transition explainable by a cause).
3. The design tokens applied consistently across both color themes.
4. Keyboard + reduced-motion + screen-reader pass (checklist in the repo).
5. A written list of what is *deliberately excluded* from the system (the
   Sayyarah-style refusals for this surface).

Until approval: iterate on the system. After approval: phase 2 (experience
registry + rendering engine) may begin — not before.

## 6. Build decisions (recorded during the Phase-1 prototype build)

The prototype lives under `prototype/`; full verification record in
`prototype/QA_NOTES.md`. Decisions made while implementing, kept current
here per the covenant:

**Reconciliation (BUILD_PROMPT §2): canvas coordinates vs. ⟨sūrah:āyah⟩.**
The new spec-ui blueprint's canvas geometry governs — 15 fixed lanes,
addressed 1–15, sequence sacred. This project's apparatus convention
governs the margin content on top of that: every lane's margin cell also
carries its real ⟨sūrah:āyah⟩ locus. Both hold at once — lane *n* is the
address, ⟨sūrah:āyah⟩ is the citation. Nothing in this system uses an
anonymized "line n" with no real referent; that would violate "citational
walks" (CLAUDE.md's covenant §1).

**Typography.** IBM Plex Mono (named in §1's token table for apparatus) is
substituted with the system monospace stack — vendoring a third webfont
was judged unnecessary weight against the 60fps/bundle-size budget for a
Phase-1 prototype. Amiri Quran (ʿUthmānī rasm) and Noto Kufi Arabic
(headings) are vendored read-only from `references/isnaad/public/fonts`.

**Sample pages.** One lane = one āyah, for all three sample pages — not a
reproduction of any real mushaf's actual line-breaks (no per-line dataset
is vendored anywhere in `references/`). Pages: Sūrah 55:1–15 (root
repetition → echo-trajectory demo), Sūrah 18:60–74 (dialogue-dense →
rupture/shift lenses), Sūrahs 114+113+112 (15 āyāt across three short
sūrahs → gentle onboarding page). Full rationale in
`prototype/QA_NOTES.md` §Sample-page decision.

**Lane-state values are a fixture.** No real isnaad-detector or
al-Mirtāl-edge run exists against these specific loci — product-spec/01's
ingestion pipeline is not connected in Phase 1 (per product-spec/06 stage
3, explicitly not this stage). `prototype/scripts/gen-fixtures.mjs`
computes intensity/friction/axis/lens honestly from real per-word
morphology instead (root repetition on the page, person-tag axis blend,
direct-speech-verb detection), and labels every page `provenance.isFixture:
true` with the exact method. A lane with no qualifying signal carries
`lens: null` — product-spec/01's "the absence is data" rule, not a forced
guess.

**F02/F03/F05/F07/F08 are generic, live-computed activations** (nearest
shared-root lane, page's highest-word-count lane, etc.) rather than
pre-tagged fixture values like F01/F04/F06/F09 — see
`prototype/src/features/lensRail.ts`. This keeps all nine lenses
exercisable (DoD requirement) without inventing detector classifications
the reference projects never actually produced for this material.

**Row-split sub-rows** fork at the word-count midpoint (no per-word
ignition-point signal exists in the fixture) — a documented visual
approximation, not a claim about exactly where a voice turns.

**Orbit mode** bends lanes via a per-lane CSS transform (not literal
circular text reflow, which real DOM text can't do without per-character
SVG and a real accessibility cost) — see `echoTrajectory.ts`.

**The equilibrium governor respects measured natural content height.**
A long āyah word-wraps at mobile width; the fixed legibility floor alone
under-sized some lanes, letting wrapped text visually and functionally
overlap the gutter/lane beneath it (caught by hit-testing during
verification, not by eye). The governor now takes each lane's actual
rendered height as an additional per-lane floor every render pass — text
is never compressed below what it needs to avoid overlapping its
neighbors. This is the concrete shape "sacred legibility minimum" takes
once real, variable-length citation text is on the page instead of
placeholder lines.

**Scroll-driven focus is gated on a real user scroll event** (plus a short
settle debounce) before it can move focus or engage the path-trace lock.
An early version wired the visibility observer straight into focus/lock;
layout settling right after the onboarding overlay closed produced
spurious intersection changes that walked focus across several lanes —
including through a deep checkpoint — with no reader input at all. Also
caught by Playwright, not by hand-testing.

**What's deliberately excluded (§5.5's written list):** no translation, no
interpretation of meaning, no auto-play/scroll-jacking/gamification, no
network/accounts/backend, no full-corpus import or registry beyond the 3
sample pages, no margin content ever on the letterforms. Full list with
citations in `prototype/QA_NOTES.md`.

## 7. Post-approval-gate: the full build (FINALITY_PROMPT.md, 2026-09-20)

The owner's standing order revoked the approval gate above and commanded
executing `FINALITY_PROMPT.md` end to end — the whole Quran readable,
lexicons wired, الفهرس as the app's home, 3354 experiences browsable plus
generative ones, all without stopping for review. This section (§5's gate)
is kept verbatim as the historical record of Phase 1's own acceptance
criteria, which the full build still satisfies (every Phase-1 behavior
re-verified passing, not just left alone — see `prototype/QA_NOTES.md`'s
"FINALITY_PROMPT" section for the complete build record, the data-layer
verification, every reduction from the Phase-1 heuristic honestly
documented, and the full verification pass). The design tokens, component
inventory, motion language, and accessibility posture in §§1–4 above
describe the *reading canvas* specifically and still hold; they were
extended (real corpus, real lexicon, real experiences) rather than
replaced.
