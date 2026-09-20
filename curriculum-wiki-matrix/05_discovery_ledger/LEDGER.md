# Infinite Sovereign Discoveries Atlas — Ledger Index

The live database. Every row is one Self-Discovery Node: a detected structural
anomaly classified into a Phase 1 profile, priced by the Phase 2 pipeline, and
bound by the Phase 3 contract.

## Runs

| Run (UTC) | Rows | Substrate |
|---|---|---|
| `runs/run_2026-09-20T072345Z/` (founding pass) | 40,095 | R1: 37,195 edges · R2: 2,500 discoveries + 400 motifs · R3: invariant pole |

Each run directory holds `ledger.jsonl.gz` (one JSON row per line),
`RUN_REPORT.md` (per-profile and per-family statistics), and `state.json`
(resume checkpoint).

## Rows per anomaly profile (founding pass)

| Profile | Rows |
|---|---|
| Internal Rupture Mechanics | 1,458 |
| Temporal State Collapsing | 8,955 |
| Radial Spatial Dissolution | 704 |
| Real-Time Viewpoint Shifting | 6,754 |
| Dynamic Distance Shielding | 0 (operator-rule behavior; see catalog entry 05) |
| Linear Object Passivity | 3,785 |
| Gravitational Node Elevation | 70 |
| Spatial Horizon Convergence | 8 |
| Recursive Timeline Rollbacks | 18,361 |

## Querying the ledger

```python
import gzip, json
rows = [json.loads(l) for l in gzip.open(
    "phase2_pipeline/runs/run_2026-09-20T072345Z/ledger.jsonl.gz",
    "rt", encoding="utf-8")]
# highest-friction ruptures
top = sorted((r for r in rows if r["Theory_Type"] == "Internal Rupture Mechanics"),
             key=lambda r: -r["Friction_Value"])[:5]
for r in top:
    print(r["Friction_Value"], r["Invertibility_Audit"], r["Name"])
```

## Row schema

`Database_Target` · `Name` · `Theory_Type` · `Runway_Definition` (3 sentences) ·
`Codebase_Dependency[]` (verified paths) · `Friction_Value` ·
`Invertibility_Audit` {Superposition, Survivors, Data_Loss, Integer_Closure} ·
`Substrate_Family` · `Units_Folded` · `Page_Content_Body` (rationale + friction table).

## Map

- Phase 1 catalog: `phase1_anomaly_catalog/` — the nine anomaly profiles.
- Phase 2 pipeline: `phase2_pipeline/` — `PIPELINE.md`, `engine/ledger_engine.py`,
  `engine/metrics.json`, `runs/`.
- Phase 3 contract: `phase3_contract/ENFORCEMENT_CONTRACT.md`.
- **Curriculum wiki**: `wiki/curriculum-wiki.html` — the ledger rendered as a
  readable study wiki, one page per anomaly area with measured stats, friction
  distributions, friction tables, and the highest-friction nodes. Rebuild with
  `wiki/build_wiki.py` after any new run.
