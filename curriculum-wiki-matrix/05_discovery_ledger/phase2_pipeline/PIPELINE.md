# Phase 2 — The Endless Generative Computation Pipeline

Executable implementation: `engine/ledger_engine.py`.
Ingested metrics: `engine/metrics.json`. Run outputs: `runs/<utc-stamp>/`.

## The three-stage loop

For every parsed data sequence in the corpus substrate, the engine runs:

**Step 1 — Friction Vector.**
`Friction Coefficient = Lexical Continuity × Viewpoint Axis Delta.`
Lexical Continuity is operationalized per family: R2 discoveries use the engine's
own composite score (0.68–1.0); R2 motifs use `min(1, occurrences/8)`; R1 edges
use `min(1, wazn_bits/22.2)`. Viewpoint Axis Delta is grounded in the proximity
axis (address = 0.0, speaker = 0.5, absent = 1.0): discoveries use a per-kind
delta table; motifs compute max–min person distance across their contour pattern
symbols; edges use 1.0 for cross-array links and 0.25 for within-array links.

**Step 2 — Invertibility Audit.**
`Data Loss = ((Superposition − Survivors) / Superposition) × 28 mod 28.`
Integer Closure = 28, the alphabet count the dotless engine closes over.
Superposition is the count of substrate units folded into one record
(discovery: words spanned → 1 finding; motif: occurrences → 1 pattern key;
edge: the source block's candidate list → this edge). Survivors is 1 by
construction: every row is a record of what a folding operation kept.

**Step 3 — Sovereign Notion Rows.**
Any sequence matching a Phase 1 anomaly profile, or yielding non-zero friction,
is emitted as a ledger row with the contractual payload: `Database_Target`,
`Name` (Self-Discovery Node + UUID4), `Theory_Type`, `Runway_Definition`
(exactly three sentences, assertion-checked), `Codebase_Dependency`
(every path verified against the pinned clones at emit time), `Friction_Value`,
`Invertibility_Audit`, and `Page_Content_Body` rendering the comparative
collider friction table.

## Classification contract

| Sequence family | Classifier | Anomaly profile |
|---|---|---|
| R2 discovery: istihdar, tabaqat-al-isnad | detector kind | Internal Rupture Mechanics |
| R2 discovery: jisr-al-naba | detector kind | Real-Time Viewpoint Shifting |
| R2 discovery: raj-al-jidhr | detector kind | Recursive Timeline Rollbacks |
| R2 discovery: ribat | detector kind | Radial Spatial Dissolution |
| R2 discovery: alsinat-al-khalq | detector kind | Gravitational Node Elevation |
| R2 discovery: rusul-echo | detector kind | Spatial Horizon Convergence |
| R2 motif | contour pattern | Temporal State Collapsing |
| R1 edge: formula | evidence prefix | Temporal State Collapsing |
| R1 edge: adjacent | evidence match | Linear Object Passivity |
| R1 edge: near (±N) | evidence prefix | Real-Time Viewpoint Shifting |
| R1 edge: lem:/root: | evidence prefix | Recursive Timeline Rollbacks |
| R1 edge: ishtimal (⊂/⊃) | evidence mark | Gravitational Node Elevation |

## Design decisions (recorded, not hidden)

- **R3 is the invariant pole.** ARABIC_TIMELESS contributes its metrics and its
  structural rules — which appear in every row's friction table — but its layers
  are not scored as sequences. Scoring the contract against itself would be
  circular; the dotless engine is what the tracking engines are measured against.
- **Proxies are declared.** Lexical Continuity and the per-kind deltas are
  operationalizations, documented here and in the engine docstring — defined
  interfaces, not executed verifications.
- **Zero-match profiles are findings.** Dynamic Distance Shielding emits no rows
  because the behavior lives in operator rules (R1 modes, the R3 contract), not
  in parsed sequences. That is recorded in its catalog entry rather than forced.
- **Abstract language is enforced by assertion**, not by hope: any verse
  coordinate (`\d+:\d+`) in a Runway or body fails the run.
- **The run is resumable and uncapped**: `state.json` checkpoints per family;
  `--resume` continues; there is no row limit — the loop runs the entire
  substrate (40,095 sequences in the founding pass).
