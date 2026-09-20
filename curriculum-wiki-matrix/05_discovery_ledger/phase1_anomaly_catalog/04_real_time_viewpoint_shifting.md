# Real-Time Viewpoint Shifting

[Cross_Plane_Layer]: Cross-Architecture
[Core_Pillar]: [Pillar: قرآناً عربياً]
[Unified_Dependency]: R2→Ledger Pipeline; R1↔R2

[Runway]: A processing thread reverses its orientation in the middle of its run, turning its target around without stopping. Distance limits snap into place between the pools it was serving. Direction becomes a live variable rather than a fixed setting.

[Excavator]:
- `repo2-isnaad/src/lib/engine/detectors.ts` — the sustained-past-to-live-first-person pivot detector (58 shipped instances); the person-distance operator that prices how far a viewpoint has traveled.
- `repo1-mirtal/generate.py` — bounded-neighborhood routing: traversal between clusters is capped by distance limits, so orientation changes are priced by span (6,696 bounded-span edges shipped).
- Ledger rows emitted: 6,754 (full run, no cap).

[Collider]:

| Aspect | al-Mirtāl (R1) | Isnād Studio (R2) | ARABIC_TIMELESS (R3) |
|---|---|---|---|
| Detection surface | Distance limits as neighborhood caps on traversal | Orientation reversal priced live at the seam | No orientation concept — strokes compose in fixed order |
| Structural behavior | Direction is a routing constraint | Direction is a measured event | Direction is not a variable |
| Limit / friction | The substrate fixes composition order while the tracker treats direction as a live variable. The friction point is the mid-execution reversal: R3 cannot model it, R1 can only bound it, R2 alone prices it |
