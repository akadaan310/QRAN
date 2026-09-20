> **[Cross_Plane_Layer]:** `pillar-index`
> **[Core_Pillar]:** حكماً عربياً — Hukman Arabiyyan
> **[Unified_Dependency]:** System Invariants → Rigidity Coefficient

# [Pillar: حكماً عربياً] — Index

The pillar of ruling. It holds the System Invariants that govern the other
three pillars, the closure rules that bound them, the constraint solving that
prunes them, and the error-correcting codes that let them survive damage.

## Cross-planes in this pillar

| File | Cross-plane | What it isolates |
|---|---|---|
| `01_system_invariants.md` | `system-invariant` | Admissible operations and what they cannot change |
| `02_mathematical_closure_rules.md` | `closure-rule` | Operations that map the Substrate Array back into itself |
| `03_constraint_solving.md` | `constraint-solver` | Reading as auditable pruning under floors |
| `04_error_correcting_codes.md` | `error-code` | Layers as codes for one another; damage taxonomy |

## [Runway]

حكماً عربياً is the pillar of ruling: the System Invariants that govern the
other three pillars, the closure rules that bound them, the constraint solving
that prunes them, and the error-correcting codes that let them survive damage.
It is where the matrix stops describing structures and starts enforcing them.
Every file here must state a rule, a bound, or a code — never an
interpretation.

## [Excavator]

- **[R3] `spec/20-invariance.md`** — what survives all nineteen layers: the six invariants and the computed constants.
- **[R3] `lib/engine/invariance.ts`** — the invariance table computed from the engine's own definitions, never copied from the document.
- **[R3] `lib/engine/collapse.ts`** — the reading procedure as constraint solving.
- **[R3] `spec/19-damage.md`** — the layers as error-correcting codes for one another.
- **[R1] `ops.py`** — `Mode.ISNAD` versus `Mode.TAWJIH`: admissibility as invariant.
- **[R2] `src/lib/engine/detectors.ts`** — eight detectors, `DEFAULT_OPTIONS`: the engine's invariant core.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Rule over description | `isqat` is forbidden in مقام الإسناد; `jam` requires attestation | Detectors report structure; none interpret | The Layer Contract cuts failing layers | Forces every architecture to state its rules as enforceable bounds, not as commentary. |
| Bound over claim | `CROSS_BAR`: a crossing must clear fourteen bits to be admitted | `minScore`: discoveries below threshold are dropped | Accounted loss: every operation inverts or its loss is exactly quantified | Forces bounds to be numeric and checkable: a rule without a number is a wish. |
| Survival over storage | The navigator rebuilds from `bundle.json` via `bundle.py` | `/data` committed; fresh clone runs offline | Computed constants derived, never tabulated | Forces survival by re-derivation: what cannot be recomputed cannot be trusted. |
