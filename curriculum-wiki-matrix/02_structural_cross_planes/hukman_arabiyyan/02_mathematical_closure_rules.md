> **[Cross_Plane_Layer]:** `closure-rule`
> **[Core_Pillar]:** حكماً عربياً — Hukman Arabiyyan
> **[Unified_Dependency]:** System Invariants → Substrate Array

# Mathematical Closure Rules

## [Runway]

Mathematical closure rules state which operations map the Substrate Array back
into itself: the alphabet as an addressable ring, weight as a sum indifferent
to order, substitution and permutation as closed transforms. Layer 14's table
has a row for length that is invariant under every column, and every string in
a permutation orbit carries one weight in every era, necessarily. For this
pillar, closure is what makes the system computable rather than merely
describable: an operation that leaves the alphabet is not an operation of
عربي.

## [Excavator]

- **[R3] `spec/14-composition.md`** — the commutation table: which operations commute, which do not; the invariance table with length invariant under every column.
- **[R3] `spec/03-order.md`** — the alphabet as an addressable ring, not a bag.
- **[R3] `spec/10-weight.md`** — every string carries a number; every number carries back; weight is orbit-constant under permutation.
- **[R3] `lib/engine/registry.ts`** — the registered observables × transforms the invariance table is computed over.
- **[R3] `lib/engine/operations.ts`** — the operations under test.
- **[R1] `ops.py`** — `jam` returns `None` unless the union is attested: closure under attestation; `daght` compresses a path to its endpoints: closure under compression.
- **[R1] `generate.py`** — `Generator` floors (`min_bits`, `min_score`): admission as a closed gate.
- **[R2] `src/lib/engine/graph.ts`** — the relation graph over the substrate.
- **[R2] `src/lib/numerals.ts`** — `arabicNumber`: the numeric channel of the studio.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Closed transforms | `jam` attested-union; `daght` endpoint compression | `graph.ts` relations stay inside the substrate | Substitution and permutation closed; weight orbit-constant | Forces closure proofs: each transform must map the substrate back into itself or be rejected from the architecture. |
| Commutation | Eight acts compose over citation-sequences in a fixed algebra | Detector pipeline order: morphology → isnād → detectors → cosmos | `spec/14`: which operations commute, measured per cell | Forces commutation tables: order-dependence must be measured cell by cell, never assumed. |
| Numeric invariants | وَزْن in bits: `log2(N/n)` per candidate | `arabicNumber`; contour glosses (`glossContour`) | Weight; pulse: the binary rhythm separable from letters (`spec/11`) | Forces numeric channels: every architecture must expose at least one number its transforms cannot change. |
