# QRAN — Interstellar Quran Web App

The working repo for the Interstellar Quran web app, currently in **Phase 1**:
design the Immersion UI System and get it approved. Phase 1 output is a written
UI-system proposal plus an interactive prototype demonstrating the system on a
small set of sample experiences. The prototype is the approval gate.

## Start here

1. `CLAUDE.md` — session brief: mission, covenant, conventions, working rules.
2. `BUILD_PROMPT.md` — the one-shot build brief for the mobile-only prototype.
3. `docs/` — Phase-1 UI system proposal, target architecture, references guide.

## Layout

```
QRAN/
├── CLAUDE.md                  # session brief (read first)
├── BUILD_PROMPT.md            # one-shot prototype build brief
├── docs/                      # PHASE-01-UI-SYSTEM.md, ARCHITECTURE.md, REFERENCES.md
├── curriculum-wiki-matrix/    # design specs: spec-ui/ (10 docs), product-spec/ (7 docs),
│                              # discovery ledger, curriculum wikis
├── references/                # read-only reference material (never edit in place)
│   ├── isnaad/                # Isnād Studio — structural detectors
│   ├── mirtal/                # al-Mirtāl — formal planner layer
│   ├── mirtal-bundle/         # reverted features (reference ideas only)
│   └── sayyarah/              # Sayyarah proposal
└── prototype/                 # the mobile web app (built by the session)
```

## The gate

Nothing beyond the UI system gets built until the owner explicitly says
"approved". See `CLAUDE.md` and `BUILD_PROMPT.md` §2.
