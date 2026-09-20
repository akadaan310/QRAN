# Linear Object Passivity

[Cross_Plane_Layer]: Cross-Architecture
[Core_Pillar]: [Pillar: عربي]
[Unified_Dependency]: R1→Ledger Pipeline; R1↔R2↔R3

[Runway]: Some records never execute anything at all; they lie flat and let external tools read them. They are tracked, stored, and replicated, but they initiate nothing. The system treats them as payload, never as participants.

[Excavator]:
- `repo1-mirtal/corpus.py` — text segments as passive records: namedtuples with no execution capability, read by external traversal tools (3,785 pure-adjacency edges shipped — proximity with no operation).
- `repo2-isnaad/data/corpus` — flat source files consumed by ingest; the substrate at rest.
- `repo3-arabic/spec/05-superposition.md` — the skeleton denotes a set of words; denotation is passive, a standing-forth rather than an act.
- Ledger rows emitted: 3,785 (full run, no cap).

[Collider]:

| Aspect | al-Mirtāl (R1) | Isnād Studio (R2) | ARABIC_TIMELESS (R3) |
|---|---|---|---|
| Detection surface | Adjacency edges: pure proximity, no execution on either side | Flat corpus files read by ingest | The inherited floor: stated, then set aside |
| Structural behavior | Payload linked to payload | Payload read by tools | Payload denoted, never performed |
| Limit / friction | All three architectures bottom out in passive material they traverse but never execute. Passivity is the one property no architecture can eliminate — every engine stands on records that do nothing |
