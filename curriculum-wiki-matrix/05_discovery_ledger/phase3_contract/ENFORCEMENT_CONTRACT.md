# Phase 3 — Enforcement & Execution Contract

Binding rules for the Infinite Generative Discovery Ledger. These hold for the
founding run and every future pass.

## 1. Continuity

- Generation does not stop after a fixed number of rows. Every pass runs the
  computation loop over the **entire corpus substrate** — all parsed sequences,
  no cap, no sampling.
- The pipeline is resumable (`state.json` per family; `--resume`). An
  interrupted pass continues; it never restarts silently and never double-emits.
- The ledger is append-only. Corrections are new rows, never edits to shipped rows.

## 2. Runway discipline

- Every entry's `Runway_Definition` is **exactly three sentences** of clean,
  non-technical structural language.
- Universally accessible: no jargon, no code identifiers, no repository terms.
- Enforced by assertion at emit time — a malformed Runway fails the run, it does
  not ship.

## 3. Friction-table requirement

- Every page content body **must** isolate the systemic friction points where
  the structural rules of the dotless engine (R3) limit or conflict with the
  dynamic calculations of the tracking engines (R1/R2).
- The table is per anomaly profile (nine tables, three friction points each),
  rendered into every row of that profile. The conflict column must name the
  precise structural tension — never a vague "they differ."

## 4. Abstract-language mandate

- No verse numbers, no historical proper names, no localized chapter markers, no
  fixed thematic labels — in Runways, rationales, or bodies. Code-level
  identifiers (detector names, file paths) are permitted in dependency lists and
  Excavator hooks only.
- Enforced by pattern assertion at emit time.

## 5. Dependency honesty

- Every `Codebase_Dependency` path must resolve against the pinned repository
  clones at emit time. An unresolvable path fails the run.
- Dependencies are evidence of provenance, not claims of integration.

## 6. Defined vs executed

- Colliders and friction tables define interfaces and cross-verification
  pressures. They do **not** claim those integrations were executed.
- Operationalizations (Friction Coefficient, Data Loss, per-kind deltas) are
  documented in `phase2_pipeline/PIPELINE.md` and the engine docstring. A proxy
  is a proxy: declared, never disguised as a measurement of the thing itself.
- Zero-match profiles are recorded as findings, not patched with forced rows.

## 7. Re-running

A future pass re-ingests the repositories (new HEADs), recomputes metrics,
and emits a new run directory. Comparison between runs is itself a ledger-level
operation and belongs in a future `runs/<stamp>/RUN_REPORT.md`, not in edits to
past runs.
