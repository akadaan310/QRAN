#!/usr/bin/env python3
"""Build the Curriculum Wiki: aggregate the ledger into per-area study pages
and render a single self-contained curriculum-wiki.html."""
import gzip, json, os, re, sys

WIKI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(WIKI)
sys.path.insert(0, os.path.join(BASE, "phase2_pipeline", "engine"))
from ledger_engine import PROFILES  # noqa: E402

RUN = "run_2026-09-20T072345Z"
LEDGER = os.path.join(BASE, "phase2_pipeline", "runs", RUN, "ledger.jsonl.gz")
NAME2SLUG = {p["name"]: s for s, p in PROFILES.items()}

PILLARS = {
    "internal-rupture": "قرآناً عربياً",
    "temporal-collapsing": "حكماً عربياً",
    "spatial-dissolution": "قرآن",
    "viewpoint-shifting": "قرآناً عربياً",
    "distance-shielding": "حكماً عربياً",
    "linear-passivity": "عربي",
    "node-elevation": "قرآن",
    "horizon-convergence": "قرآن",
    "timeline-rollback": "عربي",
}

OBJECTIVES = {
    "internal-rupture": [
        "Recognize the moment a unified block opens an inner voice: absence-bound material igniting into direct address with no external trigger.",
        "Distinguish the parent block's stable allocation from the nested voice's local rules — two chambers, one wall.",
        "Price a rupture seam with the friction coefficient: continuity held against the distance the viewpoint traveled.",
    ],
    "temporal-collapsing": [
        "Trace how a long sequential history is pressed into one immutable key, and name exactly what is allowed to fall away.",
        "Compare three different answers to “what may be forgotten”: budget (R1), judgment (R2), contract (R3).",
        "Audit a collapse with the invertibility formula: superposition in, survivors out, loss quantified against the integer closure.",
    ],
    "spatial-dissolution": [
        "Identify the boundary condition at which parallel threads stop being measured apart and merge into one parent value.",
        "Contrast the three merger licenses: attestation, score, declared filter — dissolution is never free.",
        "Explain why dissolution violates layer independence by construction, and where each architecture draws the line.",
    ],
    "viewpoint-shifting": [
        "Follow a thread that reverses orientation mid-execution without halting, and map the distance limits that snap into place.",
        "Price a reversal with the friction coefficient: lexical continuity held against viewpoint-axis travel.",
        "Articulate the core tension: the substrate fixes composition order while the tracker treats direction as a live variable.",
    ],
    "distance-shielding": [
        "Describe protection by disappearance: a sub-array removed from the threat profile rather than walled off.",
        "Compare the three shields: prohibition (R1), declaration (R2), contract (R3).",
        "Confront the structural tension: shielding by disappearance is exactly what accounted loss forbids — and why this area emits no sequence rows.",
    ],
    "linear-passivity": [
        "Catalog the records that never execute: flat, traversable, replicated — payload, never participants.",
        "Show how all three architectures bottom out in passive material they traverse but never operate on.",
        "Explain why replication without transformation is the one operation the layer stack cannot price.",
    ],
    "node-elevation": [
        "Track a passive record's promotion into an active hub broadcasting through hard barriers.",
        "Name the barrier each architecture's elevation must cross: build step, render step, detection threshold.",
        "Defend the claim: gravity here is earned by transmission, not by position.",
    ],
    "horizon-convergence": [
        "Verify footprints matched across independent architectures with no coordination channel between them.",
        "Distinguish three convergences: by relation, by contour, by contract.",
        "Argue why convergence exists only in the comparison — no single architecture can produce it alone.",
    ],
    "timeline-rollback": [
        "Walk an input trail backwards: abandon the forward path, discard broken operations, recover the lost anchor.",
        "Classify rollbacks as repair (R1), detection (R2), and audit (R3).",
        "Explain why rollback runs backwards through forward-only machinery — and why no operator algebra names it.",
    ],
}

EXCAVATOR = {
    "internal-rupture": [
        ("repo2-isnaad/src/lib/engine/detectors.ts", "absence-to-address ignition (1,446 shipped) and nested-speech framing (12 shipped)"),
        ("repo2-isnaad/data/index/discoveries.json", "seam positions and composite scores for every rupture instance"),
    ],
    "temporal-collapsing": [
        ("repo2-isnaad/src/lib/engine/motifs.ts", "suffix automaton; 400 right-maximal repeated contours over the full array"),
        ("repo1-mirtal/sabab.py", "path-compression operator: chains collapse to endpoints under width caps"),
        ("repo3-arabic/spec/18-memory.md", "the skeleton defined as a compression format"),
    ],
    "spatial-dissolution": [
        ("repo2-isnaad/src/lib/isnad.ts", "the continuity product: two measures merge into one score at the seam (704 shipped)"),
        ("repo1-mirtal/ops.py", "attested union: clusters absorbed only under license"),
        ("repo3-arabic/lib/engine/collapse.ts", "candidate sets absorbed through declared filters into one reading"),
    ],
    "viewpoint-shifting": [
        ("repo2-isnaad/src/lib/engine/detectors.ts", "sustained-past to live-first-person pivots (58 shipped); person-distance pricing"),
        ("repo1-mirtal/generate.py", "bounded-neighborhood routing: distance limits as traversal caps (6,696 edges)"),
    ],
    "distance-shielding": [
        ("repo1-mirtal/ops.py", "citational mode forbids omission; enclosure-by-repetition wraps a span in its own restatement"),
        ("repo3-arabic/spec/20-invariance.md", "the Layer Contract as shield: substrate independence and accounted loss"),
    ],
    "linear-passivity": [
        ("repo1-mirtal/corpus.py", "segments as passive records with no execution capability (3,785 adjacency edges)"),
        ("repo2-isnaad/data/corpus", "flat source files at rest, read by ingest"),
        ("repo3-arabic/spec/05-superposition.md", "the skeleton denotes a set — denotation as standing-forth, not act"),
    ],
    "node-elevation": [
        ("repo2-isnaad/src/lib/cosmos/locus.ts", "placement join: mined finding becomes a served node (46 shipped)"),
        ("repo1-mirtal/bundle.py", "bundling: passive data embedded into the running artifact (24 shipped)"),
        ("repo3-arabic/lib/engine/invariance.ts", "discovery detector: a novel invariance row earns a broadcast channel"),
    ],
    "horizon-convergence": [
        ("repo3-arabic/spec/20-invariance.md", "timelessness: methods executable in any era"),
        ("repo2-isnaad/scripts/verify-exemplars.ts", "8 messenger-contour echoes verified across distant regions"),
        ("repo1-mirtal/edges_table.py", "the same substrate pinned into human-readable tables"),
    ],
    "timeline-rollback": [
        ("repo2-isnaad/src/lib/engine/detectors.ts", "root-return traces across boundaries (226 shipped)"),
        ("repo3-arabic/lib/engine/collapse.ts", "terminal check: did the true reading survive the filters?"),
        ("repo1-mirtal/sabab.py", "the width-cap repair: re-walking the engine's own past decisions (18,135 edges)"),
    ],
}

COLLIDER = {
    "internal-rupture": [
        ("Detection surface", "Edge-weight spikes in a flat graph", "Dedicated detectors with per-kind evidence", "Invisible by construction — the skeleton denotes a set"),
        ("Structural behavior", "Cannot name the voice, only its weight", "Nested loops with local rules in a stable parent", "Flat strings; nesting is not a concept"),
        ("Limit", "R1 weighs · R2 prices the seam · R3 cannot see it — the contract's flatness is the friction", "", ""),
    ],
    "temporal-collapsing": [
        ("Detection surface", "Formula keys folding distant positions into one label", "400 contour keys absorbing their occurrence lists", "The skeleton itself: one string for every reading it admits"),
        ("Structural behavior", "Lossy by budget — width caps decide", "Lossy by judgment — “noise” is dropped", "Lossy by contract — but every loss quantified"),
        ("Limit", "Three architectures, three answers to what may be forgotten", "", ""),
    ],
    "spatial-dissolution": [
        ("Detection surface", "Cluster unions gated by attestation", "Two measures merging into one product at a seam", "Candidate sets absorbed through declared filters"),
        ("Structural behavior", "Merge only under license", "Merge as scoring", "Merge as filtering"),
        ("Limit", "Dissolution is never free — attestation, score, or declared filter. The price is where they disagree", "", ""),
    ],
    "viewpoint-shifting": [
        ("Detection surface", "Neighborhood caps on traversal", "Orientation reversal priced live at the seam", "No orientation concept — strokes compose in fixed order"),
        ("Structural behavior", "Direction as routing constraint", "Direction as measured event", "Direction is not a variable"),
        ("Limit", "The substrate fixes order; the tracker treats direction as live. R3 cannot model the reversal, R1 only bounds it", "", ""),
    ],
    "distance-shielding": [
        ("Detection surface", "Modal shielding: citational mode forbids omission", "Declared detachment: uncertain links typed and held apart", "Methodological shielding: the contract covers every era at once"),
        ("Structural behavior", "Protection by prohibition", "Protection by declaration", "Protection by contract"),
        ("Limit", "Shielding by disappearance is exactly what accounted loss forbids — protection and audit in structural tension", "", ""),
    ],
    "linear-passivity": [
        ("Detection surface", "Adjacency edges: proximity with no execution", "Flat corpus files read by ingest", "The inherited floor: stated, then set aside"),
        ("Structural behavior", "Payload linked to payload", "Payload read by tools", "Payload denoted, never performed"),
        ("Limit", "All three bottom out in passive material they traverse but never execute — the one property no architecture can eliminate", "", ""),
    ],
    "node-elevation": [
        ("Detection surface", "Build step: data embedded into the app", "Placement join: finding positioned as a served node", "Detection threshold: a novel row earns a channel"),
        ("Structural behavior", "Payload becomes the artifact", "Finding becomes the destination", "Measurement becomes the broadcast lane"),
        ("Limit", "Elevation always crosses a barrier the substrate cannot cross — no architecture elevates from inside the substrate", "", ""),
    ],
    "horizon-convergence": [
        ("Detection surface", "The same pairs keep reappearing", "The same contours keep resurfacing", "The same rules hold in any era"),
        ("Structural behavior", "Convergence by relation", "Convergence by contour", "Convergence by contract"),
        ("Limit", "Convergence exists only in the comparison — no single architecture can produce it alone", "", ""),
    ],
    "timeline-rollback": [
        ("Detection surface", "Silent hiding found, repaired by re-walking", "226 backward root-traces to lost anchors", "Skip-reports making the backward walk auditable"),
        ("Structural behavior", "Rollback as repair", "Rollback as detection", "Rollback as audit"),
        ("Limit", "The one operation all three perform that none of their operator algebras can name — backwards through forward-only machinery", "", ""),
    ],
}

RAT_RE = re.compile(r"### Classification rationale\n\n(.*?)\n\n### Systemic friction points", re.S)
LV_RE = re.compile(r"lexical continuity ([\d.]+) x viewpoint axis delta ([\d.]+)")


def main():
    rows = [json.loads(l) for l in gzip.open(LEDGER, "rt", encoding="utf-8")]
    by = {}
    for r in rows:
        by.setdefault(NAME2SLUG[r["Theory_Type"]], []).append(r)

    profiles = []
    for slug, p in PROFILES.items():
        rs = by.get(slug, [])
        fr = [r["Friction_Value"] for r in rs]
        lo = [r["Invertibility_Audit"]["Data_Loss"] for r in rs]
        fams = {}
        for r in rs:
            fams[r["Substrate_Family"]] = fams.get(r["Substrate_Family"], 0) + 1
        deciles = [0] * 10
        for v in fr:
            deciles[min(9, int(v * 10))] += 1
        top = sorted(rs, key=lambda r: -r["Friction_Value"])[:8]
        nodes = []
        for r in top:
            m = RAT_RE.search(r["Page_Content_Body"])
            lv = LV_RE.search(r["Page_Content_Body"])
            nodes.append({
                "uuid8": r["Name"].split()[-1][:8],
                "friction": r["Friction_Value"],
                "lc": float(lv.group(1)) if lv else None,
                "vad": float(lv.group(2)) if lv else None,
                "superposition": r["Invertibility_Audit"]["Superposition"],
                "survivors": r["Invertibility_Audit"]["Survivors"],
                "data_loss": r["Invertibility_Audit"]["Data_Loss"],
                "units": r["Units_Folded"],
                "family": r["Substrate_Family"],
                "rationale": m.group(1).strip() if m else "",
                "deps": [d.split("/")[-1] for d in r["Codebase_Dependency"]],
            })
        profiles.append({
            "slug": slug, "name": p["name"], "pillar": PILLARS[slug],
            "runway": p["runway"], "objectives": OBJECTIVES[slug],
            "excavator": EXCAVATOR[slug], "collider": COLLIDER[slug],
            "friction_table": p["friction_table"],
            "stats": {
                "count": len(rs),
                "mean_friction": round(sum(fr) / len(fr), 3) if fr else 0,
                "mean_loss": round(sum(lo) / len(lo), 2) if lo else 0,
                "min_friction": min(fr) if fr else 0,
                "max_friction": max(fr) if fr else 0,
                "families": fams,
            },
            "deciles": deciles,
            "nodes": nodes,
        })

    data = {"meta": {"total": len(rows), "run": RUN,
                     "r1_edges": 37195, "r2_findings": 2900, "r3_layers": 21},
            "profiles": profiles}
    with open(os.path.join(WIKI, "wiki_data.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    tpl = open(os.path.join(WIKI, "template.html"), encoding="utf-8").read()
    html = tpl.replace("__WIKI_DATA__", json.dumps(data, ensure_ascii=False))
    out = os.path.join(WIKI, "curriculum-wiki.html")
    open(out, "w", encoding="utf-8").write(html)
    print(f"wrote {out} ({os.path.getsize(out)} bytes, {len(rows)} rows aggregated)")


if __name__ == "__main__":
    main()
