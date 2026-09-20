# Recursive Timeline Rollbacks

[Cross_Plane_Layer]: Cross-Architecture
[Core_Pillar]: [Pillar: عربي]
[Unified_Dependency]: R2→Ledger Pipeline; R1↔R2↔R3

[Runway]: Forward execution drifts past recovery, so the engine abandons the forward path and walks its own input trail backwards. Each step back discards a broken operation until the lost anchor is found. Synchronization is restored not by pushing forward but by retreating exactly.

[Excavator]:
- `repo2-isnaad/src/lib/engine/detectors.ts` — the root-return detector: 226 shipped instances of a lexical root crossing a boundary and tracing backwards to an earlier anchor.
- `repo3-arabic/lib/engine/collapse.ts` — the terminal check: after filters run, the engine verifies the true reading survived; a failure is a rollback trigger with the skip-report as the trail.
- `repo1-mirtal/sabab.py` — the width-cap repair: an earlier behavior silently hid the most interesting destinations; the fix re-walks the widths, a rollback over the engine's own past decisions (18,135 root/lemma return edges shipped).
- Ledger rows emitted: 18,361 (full run, no cap).

[Collider]:

| Aspect | al-Mirtāl (R1) | Isnād Studio (R2) | ARABIC_TIMELESS (R3) |
|---|---|---|---|
| Detection surface | Silent hiding discovered, then repaired by re-walking | 226 backward root-traces to lost anchors | Skip-reports that make the backward walk auditable |
| Structural behavior | Rollback as repair: the engine revisits its own past decisions | Rollback as detection: the root returns across the boundary | Rollback as audit: every filter declares what it discarded |
| Limit / friction | Rollback is the one operation all three perform that none of their operator algebras can name. It runs backwards through forward-only machinery — join, lift, permute have no inverse for a retreat |
