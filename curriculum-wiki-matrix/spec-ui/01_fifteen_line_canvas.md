# The 15-Line Canvas — Spatial Spec

The canvas is a coordinate field, not a picture. Everything on it is
addressable: every lane, every margin cell, every gutter.

## Geometry

```
┌──────────────────────────────────────────────────────────┐
│ MARGIN RAIL │  lane 01  ·······························  │ MARGIN RAIL │
│  (prox idx) │ ─ ─ ─ ─ ─ gutter (lens) ─ ─ ─ ─ ─ ─ ─ ─  │ (attr vec)  │
│  (rigidity) │  lane 02  ·······························  │ (friction)  │
│  (timeline) │ ─ ─ ─ ─ ─ gutter (lens) ─ ─ ─ ─ ─ ─ ─ ─  │ (checkpts)  │
│             │  lane 03  ·······························  │             │
│             │     ·  ·  ·                               │             │
│             │  lane 15  ·······························  │             │
└──────────────────────────────────────────────────────────┘
      ▲                        ▲                              ▲
  operating                 15-vector                      operating
    track                     array                          track
```

- **Lanes 1–15.** Independent vector lanes. Fixed order, fixed count, fluid
  internal dimensions. Each lane exposes: structural intensity (from ledger
  node density), friction coefficient, viewpoint-axis position, dominant
  anomaly lens.
- **Gutters (14).** The inter-row substrate. Inert at rest; lens-active under
  pressure (three speeds — connections, skeleton, root threads).
- **Margin rails (2).** Operating tracks, one per side. Left rail: proximity
  indices, rigidity coefficients, timeline checkpoints. Right rail:
  attribution vectors, friction meter, depth cursor. Rails are per-line
  aligned: margin cell *n* always corresponds to lane *n*.
- **Page bound.** The outer rectangle is immutable across every state of the
  system. Zoom never rescales the page; it rescales attention within it.

## Coordinate discipline

- Lines are addressed 1–15 (canvas coordinates). These are positions on the
  matrix, not verse markers.
- The vertical axis is sequence (order preserved absolutely). The horizontal
  axis is the line's internal span. Depth (z) is structural intensity.
- No content may ever render in the margins; no instrumentation may ever
  render over the letterforms. The two domains are separated by law.

## Lane state model

Each lane carries exactly five live values:

1. **intensity** — structural weight from ledger anomaly density on the line.
2. **friction** — the line's aggregated friction coefficient.
3. **axis** — viewpoint-axis position (address / speaker / absent blend).
4. **lens** — the dominant anomaly lens active on the line (F01–F09, or none).
5. **depth** — z-position derived from friction, driving DOF rendering.

All typography behaviors (`05_typography_system.md`), all HUD readouts
(`04_hud_taxonomy.md`), and all feature matrices (`03_interaction_matrix.md`)
are functions of these five values. Nothing on the canvas is decorative.

## Equilibrium rule

Total page height H is constant. If lane *i* expands by Δ, the governor
distributes −Δ across the lowest-intensity lanes. Expansion is therefore
always a *claim* a line makes against the page, visibly paid for by its
neighbors — the reader sees structural importance as a zero-sum economy of
space.
