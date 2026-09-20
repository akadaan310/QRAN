> **[Cross_Plane_Layer]:** `layer-contract`
> **[Core_Pillar]:** عربي — Arabi
> **[Unified_Dependency]:** System Invariants → Rigidity Coefficient

# Layer Contract Validation

## [Runway]

Layer contract validation is the admission test every layer must pass:
substrate independence, closure, independence, accounted loss, and
hand-verifiability, with failures cut rather than excused. ARABIC_TIMELESS
closes every layer document by checking itself against all five conditions,
and Isnād Studio pins its engine to three exemplar passages so that any
change that stops finding them is wrong by definition. For this pillar, the
contract is what makes عربي cumulative: nothing is allowed to stand on
authority, only on re-derivation.

## [Excavator]

- **[R3] `README.md`** — the five Layer Contract conditions: substrate independence, closure, independence, accounted loss, hand-verifiability; "A layer that fails a condition is cut, not excused."
- **[R3] `docs/engine-sdk/ARCHITECTURE.md`** — the engine SDK architecture the contract governs.
- **[R3] `lib/engine/__tests__/*.test.ts`** — `engine`, `engine-sdk-invertibility`, `compose`, `corpus`, `reader` suites; **`packages/*/index.test.ts`** — per-package suites; `vitest.config.ts`.
- **[R2] `scripts/verify-exemplars.ts`** — pins the engine to Hūd 29, Qāf 2, al-Qaṣaṣ 4–5.
- **[R2] `scripts/verify-cosmos.ts`** — pins the cosmos build.
- **[R2] `README.md`** — "`npm run verify` pins the engine to all three. If a change stops finding them, the change is wrong."
- **[R1] `build.py`** — rebuilds `mirtal.html`, `awwal.html`; **`words_table.py`**, **`edges_table.py`** — the table checks.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Admission test | `build.py` plus the table scripts check the shipped artifacts | `verify-exemplars.ts` and `verify-cosmos.ts` gate every change | The five Layer Contract conditions; vitest suites per package | Forces explicit admission: each architecture must state, in checkable form, what a component must satisfy to exist. |
| Failure policy | Tables are rebuilt, not patched by hand | A change that loses the exemplars is wrong by definition | A failing layer is cut, not excused | Forces a failure doctrine: every architecture must say what happens to a component that stops verifying. |
| Re-derivation | `bundle.json` is rebuilt by `bundle.py` from sources | `/data` is committed, so a fresh clone runs with no network and no database | Computed constants are derived, never tabulated (`spec/20-invariance.md`) | Forces reproducibility: shipped artifacts must be rebuildable from sources the other architectures can inspect. |
