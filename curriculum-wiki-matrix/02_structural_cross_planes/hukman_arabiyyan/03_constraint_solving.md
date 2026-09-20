> **[Cross_Plane_Layer]:** `constraint-solver`
> **[Core_Pillar]:** حكماً عربياً — Hukman Arabiyyan
> **[Unified_Dependency]:** System Invariants → Rigidity Coefficient

# Constraint Solving

## [Runway]

Constraint solving is reading as pruning: expand the candidate set, apply
filters in cost order, and check at the end whether the true reading
survived. ARABIC_TIMELESS makes this literal in `collapse.ts`, where each
filter records what it removed so the pruning is auditable step by step
rather than delivered as verdict. For this pillar, a solution is not a guess
that survived but a candidate that every constraint failed to kill — which is
why the engine never pretends a filter is available when it has no data to
run on.

## [Excavator]

- **[R3] `lib/engine/collapse.ts`** — `collapse()`: expand the skeleton into everything it could denote, run filters (lexical, segmental, morphological, prosodic, syntactic, semantic, intentional) in cost order, check whether the true reading survived; `CollapseOptions` caps the candidate set.
- **[R3] `spec/06-collapse.md`** — the core statement: "Reading is an act performed on the text."
- **[R3] `spec/08-substitution.md`** — substitution as a constrained transform.
- **[R1] `generate.py`** — `Generator` floors (`min_bits`, `min_score`); `CROSS_BAR`: a crossing must clear fourteen bits to be admitted at all.
- **[R2] `src/lib/engine/assembler.ts`** — assembles recitations from mined findings under the engine's constraints.
- **[R2] `src/lib/composition.ts`** — composition logic; **`src/app/api/assemble/route.ts`** — the assembly endpoint.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Pruning order | `min_bits` / `min_score` floors; `CROSS_BAR` admission bar | Assembler constraints gate what may be composed | Filters run in cost order; `CollapseOptions` caps candidates | Forces ordered pruning: constraints must declare their cost and run cheapest first, in every architecture. |
| Auditability | Every candidate carries typed evidence (نصّي settled by text, إدراكي declared) | Discoveries carry scores and seams | Each filter records what it removed; pruning is auditable step by step | Forces audit trails: every elimination must name the constraint that killed it. |
| Honest skipping | `tajanus` is typed إدراكي precisely because the text alone cannot settle it | Detectors never interpret what the morphology does not show | A filter with no data is reported skipped, with the reason | Forces declared limits: an unavailable constraint must be reported, never silently applied or silently skipped. |
