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
