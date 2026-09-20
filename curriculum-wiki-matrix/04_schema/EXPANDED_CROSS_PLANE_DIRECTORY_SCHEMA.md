# Expanded Cross-Plane Directory Schema

> **Provenance note:** no schema document was attached to the task. This
> schema is derived from the task's execution instructions and is itself
> part of the scaffold. Amend it by editing this file; every structural
> file must re-validate against it afterwards.

## 1. Directory layout

| Directory | Contents |
|---|---|
| `00_unified_nomenclature/` | The nomenclature system: global equivalents, definitions, usage rules. |
| `01_unified_directory_tree/` | The single unified directory tree: all three repository indexes merged under the nomenclature planes. |
| `02_structural_cross_planes/` | Structural files, grouped by pillar: `quran/`, `quranan_arabiyyan/`, `arabi/`, `hukman_arabiyyan/`. |
| `03_collider_matrices/` | Cross-architecture comparison matrices (per-concept detail lives in each file's Collider tier; the master matrix lives here). |
| `04_schema/` | This schema. |

## 2. File naming

- Structural files: `NN_snake_case.md`, where `NN` is the order within the pillar (`01_`, `02_`, …).
- Pillar `INDEX.md` files summarize the pillar and obey the same header and tier contracts.
- Pillar directories use ASCII transliteration slugs; the Arabic pillar name lives in the `[Core_Pillar]` metadata, never in the path.

## 3. Metadata header contract

Every file under `02_structural_cross_planes/` opens with a metadata block
carrying exactly these three fields:

- **`[Cross_Plane_Layer]`** — the structural plane, from the controlled vocabulary below.
- **`[Core_Pillar]`** — exactly one of the four pillars, Arabic-first.
- **`[Unified_Dependency]`** — the dependency chain in global nomenclature terms.

Controlled `[Cross_Plane_Layer]` vocabulary:

`pillar-index`, `navigation`, `motif-mining`, `proximity-routing`,
`text-alignment`, `text-tracking`, `continuity-balance`, `rasm-mechanics`,
`stroke-gesture`, `shape-class`, `layer-contract`, `system-invariant`,
`closure-rule`, `constraint-solver`, `error-code`.

## 4. Velocity tier contract

- **`[Runway]`** — exactly three sentences. Defines the concept and shows how it serves its specific pillar. No abbreviations that break sentence counting; no new claims beyond the pillar scope.
- **`[Excavator]`** — exact reference hooks to parent repository files, as repo-relative paths verified against public HEAD 2026-09-20. Each hook carries a one-line gloss of what it contributes. Local repository terms are permitted here and only here.
- **`[Collider]`** — a markdown table with one row per interface pressure and exactly these columns: `Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced`. Each row must name something the concept forces the three architectures to expose, compare, or check against one another.

## 5. Pillar tagging rules

- Every node under `02_structural_cross_planes/` carries exactly one `[Core_Pillar]`.
- Pillar scopes (fixed):
  - **[Pillar: قرآن]** — operational recitational navigation, motif mining (مثاني), proximity axis routing.
  - **[Pillar: قرآناً عربياً]** — continuous unmediated text alignment, text tracking, motion-continuity balances.
  - **[Pillar: عربي]** — dotless rasm mechanics, stroke gestures, shape classes, layer contract validation.
  - **[Pillar: حكماً عربياً]** — System Invariants, mathematical closure rules, constraint solving, error-correcting codes.

## 6. Nomenclature enforcement

- All new prose uses the global equivalents from `00_unified_nomenclature/NOMENCLATURE.md`.
- A file that uses a retired local term outside an Excavator hook fails validation.

## 7. Validation

A structural file is accepted only if: the three metadata fields are present,
the three tiers are present, `[Runway]` is exactly three sentences, every
`[Excavator]` hook resolves to a real path in the pinned HEAD inventory, and
the `[Collider]` table has the five required columns.
