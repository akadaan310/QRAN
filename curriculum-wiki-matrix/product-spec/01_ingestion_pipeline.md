# 01 — Ingestion Pipeline

> **Runway.** Raw material enters through three repositories and exits as five live numbers per lane. Repository 3 supplies the unmediated typography that forms the Substrate Array; repositories 1 and 2 supply the vector analytics that price every lane's intensity, friction, and viewpoint position. This document traces that journey stage by stage, with the provenance of every value preserved.

## Stage A — The Substrate Array (from Repository 3)

Repository 3 (ARABIC_TIMELESS) is the invariant pole: it is ingested, never scored. Its unmediated typography — the dotless skeleton and the fully marked text as two separable layers — forms the base **Substrate Array**: fifteen ordered lanes per page, fourteen gutters, two margin rails, one rigid bound.

What the pipeline takes from Repository 3:

- **The skeleton layer.** Bare structural strokes, the substrate everything else attaches to. Ingested as the ground truth of shape.
- **The marking layer.** Vocalization marks and reading aids, ingested as a separate, re-attachable layer — never fused with the skeleton. This separability is what makes the rasm reveal and its self-healing possible.
- **The layer contract.** Substrate independence (the skeleton needs nothing) and accounted loss (every transformation declares its cost). These become runtime laws, not documentation.
- **Page geometry.** The fifteen-line footprint, alignment boundaries, and margin proportions, ingested as immutable constants.

Output of Stage A: a page object with fifteen lanes, each carrying its skeleton strokes, its mark attachments, and its geometric slot. No analytics yet — pure substrate.

## Stage B — Vector Analytics Overlay (from Repositories 1 and 2)

**Repository 1 (al-Mirtāl)** contributes relational structure: tens of thousands of typed edges between source blocks, edge weights from structural scoring, viewpoint-axis deltas for cross-array links, and seam positions where perspective ignites. **Repository 2 (Isnād Studio)** contributes detector findings: thousands of classified discoveries (rupture seams, rollback trails, pivot arcs, elevation events) with composite scores, plus hundreds of contour motifs with occurrence maps.

The overlay maps these onto lanes:

| Analytic | Source | Becomes lane value |
|---|---|---|
| Edge-weight density per line region | R1 edges | **intensity** (structural weight) |
| Lexical continuity × viewpoint-axis delta | R1 weights + R2 scores | **friction** (the coefficient) |
| Speaker-position blends per finding | R2 detectors | **axis** (address / speaker / absent) |
| Dominant anomaly class per line region | R2 discoveries + ledger rows | **lens** (F01–F09, or none) |
| Friction-derived lift | computed | **depth** (z-position) |

Aggregation rules: intensity is the normalized density of analytic weight touching the lane; friction is the lane's mean friction coefficient across its ledger rows; axis is the score-weighted blend of viewpoint positions; lens is the highest-weight anomaly class present, with ties broken toward the higher-friction class. All aggregations are precomputed per page and cached; lens changes trigger a live recompute of friction and depth only.

## Stage C — Lane-State Publication

Each lane publishes exactly five live values — intensity, friction, axis, lens, depth. These five are the *only* inputs the typography system, the HUD, and the feature matrix may read. Nothing downstream reaches past them into the repositories, which keeps the runtime decoupled from the ingestion sources.

**Provenance chain.** Every lane value carries its lineage: repository, file, and ledger row identifiers. Selecting any typographic effect (a heavy span, a lifted lane, a split row) can be traced back through the five values to the exact repository material that earned it. The invertibility audit (F11) is the user-facing end of this chain.

**Refresh cadence.** Page geometry and base analytics are precomputed and shipped with the page. Live recompute happens only on lens change or orbit entry, and only for friction and depth — the two values lenses are allowed to move. Intensity, axis, and base lens assignments are stable per page load.

## Pipeline integrity

- Repository 3 is never scored, only ingested. Scoring the invariant pole against itself would be circular.
- Zero-match results are preserved, not forced. If an anomaly class has no rows on a page, the lane simply carries no lens — the absence is data.
- The pipeline is append-only and resumable: new repository passes produce new page datasets; old datasets are never mutated. Deltas between passes are reported as new results.
