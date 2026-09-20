# spec-ui/ — File-by-File Directory Layout

The complete contents of this proposal folder. Files are numbered in reading
order; the numbers are part of the contract — a future addition takes the
next free number, never inserts between.

```
spec-ui/
├── README.md                      # Blueprint overview, premise, reading guide,
│                                  # standing disciplines, feature-registry note
├── 00_design_pillars.md           # The four master transformations:
│                                  # 15-vector array, margins as track,
│                                  # inter-row substrate, bound equilibrium
├── 01_fifteen_line_canvas.md      # Canvas spec: geometry schematic, coordinate
│                                  # discipline, lane state model (5 values),
│                                  # equilibrium rule
├── 02_feature_registry.md         # F01–F20: nine lenses, four instruments,
│                                  # four deep interactions (F14–F17 fully
│                                  # specified), three page systems
├── 03_interaction_matrix.md       # Uniform 4-layer matrix × 20 features:
│                                  # physical / typography / HUD / cognitive
├── 04_hud_taxonomy.md            # Margin instruments, six HUD states,
│                                  # four taxonomy rules
├── 05_typography_system.md       # Weight, spacing, row heights, depth,
│                                  # row-splitting mechanics, rasm canvas,
│                                  # Arabic-first law
├── 06_cognitive_program.md       # Habit-disruption map (12 habits),
│                                  # compounding sequences, system refusals
├── 07_operational_spec_sheet.md   # 15-Line Operational Spec Sheet: six stages
│                                  # from 0:00 onboarding to deep tracking
├── 08_directory_layout.md         # This file: the file-by-file layout
├── build_spec.py                  # Renders all 10 documents as one file
└── ui-blueprint.html              # The whole proposal as one readable HTML
```

## Conventions for future additions

- **New files** take the next integer (`09_...`), in reading order, with a
  one-line purpose entry added to the tree above.
- **No code** enters this folder. Schematics are ASCII/text; behaviors are
  prose. If an implementation begins, it lives elsewhere.
- **Abstract language** holds in every file: canvas coordinates (line 1–15)
  only; no verse markers, no historical names.
- **Cross-references** use file numbers (`see 04_hud_taxonomy.md`), never
  bare names, so the folder stays navigable if files are ever renamed.
- **The gate holds:** this folder is specification. Nothing here authorizes
  implementation beyond the UI system.
