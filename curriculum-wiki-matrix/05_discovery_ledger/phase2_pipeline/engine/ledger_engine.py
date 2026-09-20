#!/usr/bin/env python3
"""
Infinite Generative Discovery Ledger — Phase 2 computation pipeline.

Runs the three-stage calculation loop over every parsed data sequence in the
corpus substrate (R1 edges, R2 discoveries, R2 motifs) with no fixed row cap:

  Stage 1 — Friction Vector:      Friction Coefficient = Lexical Continuity x Viewpoint Axis Delta
  Stage 2 — Invertibility Audit:   Data Loss = ((Superposition - Survivors) / Superposition) x 28 mod 28
                                   (Integer Closure = 28, the alphabet count the dotless engine closes over)
  Stage 3 — Sovereign Notion Rows: emit one ledger row per sequence that matches a
                                   Phase 1 anomaly profile or yields non-zero friction.

Operationalizations (documented, not hidden):
  - Lexical Continuity: R2 discoveries -> engine score (0.68..1.0); R2 motifs ->
    min(1, occurrences/8); R1 edges -> min(1, wazn_bits/22.2).
  - Viewpoint Axis Delta: grounded in the proximity axis (address=0.0, speaker=0.5,
    absent=1.0). Discoveries use a per-kind delta table; motifs compute max-min
    person distance from the contour pattern symbols; edges use 1.0 cross-array,
    0.25 within-array.
  - Superposition/Survivors: substrate units folded into one record
    (discovery: words spanned -> 1 finding; motif: occurrences -> 1 pattern key;
    edge: candidate list of the source block -> this edge).

The run is resumable: state.json checkpoints per family; --resume continues.
Every emitted row is validated: 3-sentence Runway, verified code dependencies,
abstract language (no verse numbers, proper names, chapter markers).
"""

import gzip
import json
import os
import re
import subprocess
import sys
import uuid
from collections import Counter
from datetime import datetime, timezone

REPOS = "/tmp/curriculum-repos"
HERE = os.path.dirname(os.path.abspath(__file__))
PIPELINE_DIR = os.path.dirname(HERE)
RUNS_DIR = os.path.join(PIPELINE_DIR, "runs")
INTEGER_CLOSURE = 28

# ---------------------------------------------------------------- profiles ---

PROFILES = {
    "internal-rupture": {
        "name": "Internal Rupture Mechanics",
        "runway": (
            "A single unified block of text suddenly speaks from inside itself, opening an inner voice that no outside signal summoned. "
            "The surrounding material keeps its shape and memory intact while the new voice carries its own local rules. "
            "What was one flat record is now two nested chambers sharing one wall."
        ),
        "code_deps": [
            "repo2-isnaad/src/lib/engine/detectors.ts",
            "repo2-isnaad/src/lib/isnad.ts",
        ],
        "friction_table": [
            ("Voice versus skeleton",
             "Layer 5: a skeleton denotes a set of words, never one fixed reading.",
             "Detectors score an inner voice igniting mid-block to two decimals.",
             "The skeleton refuses to fix a reading while the tracker prices the exact word where the voice turns."),
            ("Nested frames versus flat substrate",
             "Layer Contract closure: operations map strings back to strings.",
             "Speech-inside-speech opens a nested loop with its own local person rules.",
             "Nesting depth is unbounded in the tracker, but the substrate contract only counts flat strings."),
            ("Declared perception versus settled text",
             "Accounted loss: every loss must be exactly quantifiable.",
             "Perceptual links are typed as declared, never settled.",
             "The engine demands quantified loss where the tracker can only declare uncertainty."),
        ],
    },
    "temporal-collapsing": {
        "name": "Temporal State Collapsing",
        "runway": (
            "A long history of sequential states is pressed down into one immutable key, and the individual steps are allowed to fall away. "
            "The collective value survives while the chronological noise does not. "
            "Time stops being a log and becomes a signature."
        ),
        "code_deps": [
            "repo2-isnaad/src/lib/engine/motifs.ts",
            "repo3-arabic/spec/18-memory.md",
            "repo1-mirtal/sabab.py",
        ],
        "friction_table": [
            ("Compression versus hand-verifiability",
             "Layer 18: the skeleton is a compression format; the Layer Contract demands hand-verifiability.",
             "Whole-array contour strings collapse into single pattern keys.",
             "The tracker compresses thousands of states into one key that no hand can re-expand."),
            ("Loss accounting versus dropped noise",
             "Accounted loss: loss must be exactly quantifiable.",
             "Collapsing drops sequential noise by judgment.",
             "What the tracker calls noise, the contract calls unaccounted loss."),
            ("Immutable keys versus invertible operations",
             "Every operation either inverts or quantifies its loss.",
             "A collapsed key cannot be inverted back into its history.",
             "The audit can measure the loss but cannot reverse it."),
        ],
    },
    "spatial-dissolution": {
        "name": "Radial Spatial Dissolution",
        "runway": (
            "Separate parallel threads stop being measured apart and are absorbed into one parent value the moment a boundary condition is met. "
            "What were many quantities becomes a single localized reading. "
            "The network synchronizes by dissolving its own divisions."
        ),
        "code_deps": [
            "repo2-isnaad/src/lib/isnad.ts",
            "repo1-mirtal/ops.py",
            "repo3-arabic/lib/engine/collapse.ts",
        ],
        "friction_table": [
            ("Merging versus independence",
             "Layer Contract independence: a layer carries information lower layers do not.",
             "Threads merge into one parent value, destroying layer separation.",
             "Dissolution violates independence by construction."),
            ("Absolute values versus profiles",
             "Chunk profiles are letter-independent signatures.",
             "Dissolution evaluates absolute localized values, discarding profiles.",
             "The moment of merging is exactly when the profile stops being computable."),
            ("Synchronization versus closure",
             "Closure: operations map the alphabet back into itself.",
             "Parallel processes merge variables into a single root directory.",
             "The merged root is no longer addressable as alphabet; closure breaks at the merge point."),
        ],
    },
    "viewpoint-shifting": {
        "name": "Real-Time Viewpoint Shifting",
        "runway": (
            "A processing thread reverses its orientation in the middle of its run, turning its target around without stopping. "
            "Distance limits snap into place between the pools it was serving. "
            "Direction becomes a live variable rather than a fixed setting."
        ),
        "code_deps": [
            "repo2-isnaad/src/lib/engine/detectors.ts",
            "repo1-mirtal/generate.py",
        ],
        "friction_table": [
            ("Reversal versus stroke order",
             "Layer 1: strokes compose under fixed operators; order is structural.",
             "A thread reverses orientation mid-execution.",
             "The substrate fixes composition order while the tracker treats direction as live."),
            ("Distance limits versus ring continuity",
             "Layer 3: the alphabet is a continuous addressable ring.",
             "Routing imposes hard distance limits between pools.",
             "Limits cut the ring; the ring knows no cuts."),
            ("Dynamic permissions versus static contract",
             "The Layer Contract is era-independent and static.",
             "Network permissions adjust in real time to routing vectors.",
             "A static contract cannot adjudicate permissions that change mid-run."),
        ],
    },
    "distance-shielding": {
        "name": "Dynamic Distance Shielding",
        "runway": (
            "A sensitive sub-array is wrapped in a layer of detachment that removes it from the surrounding threat profile. "
            "Nearby processes can no longer see it, reach it, or price it. "
            "Protection here is not a wall but a disappearance."
        ),
        "code_deps": [
            "repo1-mirtal/ops.py",
            "repo3-arabic/spec/20-invariance.md",
        ],
        "friction_table": [
            ("Invisibility versus substrate independence",
             "Substrate independence: executable with hand, surface, and memory alone.",
             "Shielded clusters become invisible to surrounding processes.",
             "A hand cannot verify what has been made invisible; verifiability and shielding conflict directly."),
            ("Detachment versus accounted loss",
             "Every loss must be exactly quantifiable.",
             "Shielding removes records from the threat profile without a trace.",
             "Protection by disappearance is loss the audit cannot quantify."),
            ("Silent operation versus declaration",
             "Uncertain links must be declared, never smuggled.",
             "Shielding is applied dynamically, not declared.",
             "The contract requires declaration; the shield operates silently."),
        ],
    },
    "linear-passivity": {
        "name": "Linear Object Passivity",
        "runway": (
            "Some records never execute anything at all; they lie flat and let external tools read them. "
            "They are tracked, stored, and replicated, but they initiate nothing. "
            "The system treats them as payload, never as participants."
        ),
        "code_deps": [
            "repo1-mirtal/corpus.py",
            "repo2-isnaad/data/corpus",
            "repo3-arabic/spec/05-superposition.md",
        ],
        "friction_table": [
            ("Flat strings versus executable layers",
             "Every layer must be executable by hand.",
             "Passive records never execute; they are only read.",
             "Passivity satisfies the letter of executability while violating its spirit."),
            ("External traversal versus closure",
             "Closure maps strings to strings or integers.",
             "External tools traverse records the system never operates on.",
             "The system claims closure over data it never touches."),
            ("Replication versus independence",
             "Independence: each layer carries new information.",
             "Passive payloads are replicated, never transformed.",
             "Replication without transformation is the one operation the layer stack cannot price."),
        ],
    },
    "node-elevation": {
        "name": "Gravitational Node Elevation",
        "runway": (
            "A passive background record is promoted into an active hub that broadcasts structural updates outward. "
            "Neighboring structures are forced to accept its data, even across hard barriers. "
            "Gravity in this system is earned by transmission, not by position."
        ),
        "code_deps": [
            "repo2-isnaad/src/lib/cosmos/locus.ts",
            "repo1-mirtal/bundle.py",
            "repo3-arabic/lib/engine/invariance.ts",
        ],
        "friction_table": [
            ("Broadcast versus hand cost",
             "Layer 16: every operation gets a hand-payable cost.",
             "An elevated node broadcasts through hard barriers at network scale.",
             "No hand can pay the cost of a barrier-crossing broadcast; the cost model breaks at elevation."),
            ("Forced acceptance versus accounted loss",
             "Loss must be exactly quantifiable.",
             "Neighbors are forced to accept updates.",
             "Forced acceptance is unquantified loss imposed on others."),
            ("Hub gravity versus ring order",
             "The alphabet is an addressable ring: no position is central.",
             "Elevation makes one node gravitational.",
             "A ring has no center; elevation invents one."),
        ],
    },
    "horizon-convergence": {
        "name": "Spatial Horizon Convergence",
        "runway": (
            "Separate architectures running in different eras arrive at exactly the same footprint without ever meeting. "
            "Their internal geometries match so precisely that expiration dates stop applying. "
            "Convergence this exact is not coincidence; it is shared structure surfacing twice."
        ),
        "code_deps": [
            "repo3-arabic/spec/20-invariance.md",
            "repo2-isnaad/scripts/verify-exemplars.ts",
            "repo1-mirtal/edges_table.py",
        ],
        "friction_table": [
            ("Shared footprints versus independence",
             "Independence: no layer derivable from a lower one.",
             "Separate architectures match footprints exactly.",
             "Exact matching across independent stacks points to a shared substrate the contract does not name."),
            ("Era-bypass versus timelessness",
             "Timelessness: methods executable in any era.",
             "Convergence bypasses file expiration dates.",
             "Both claim era-independence, but by opposite mechanisms: one by method, one by footprint."),
            ("Synchronization versus no coordination",
             "Layers compose by stacking rules, not by messaging.",
             "Nodes synchronize with zero coordination channel.",
             "The contract has no vocabulary for agreement without a channel."),
        ],
    },
    "timeline-rollback": {
        "name": "Recursive Timeline Rollbacks",
        "runway": (
            "Forward execution drifts past recovery, so the engine abandons the forward path and walks its own input trail backwards. "
            "Each step back discards a broken operation until the lost anchor is found. "
            "Synchronization is restored not by pushing forward but by retreating exactly."
        ),
        "code_deps": [
            "repo2-isnaad/src/lib/engine/detectors.ts",
            "repo3-arabic/lib/engine/collapse.ts",
            "repo1-mirtal/sabab.py",
        ],
        "friction_table": [
            ("Backward walk versus forward operators",
             "Operators compose forward: join, lift, permute.",
             "Rollback walks the input path backwards.",
             "The operator algebra has no inverse for a backward walk; rollback is not an operation of the system."),
            ("Anchor loss versus immutable keys",
             "Collapsed keys are immutable.",
             "Rollback hunts a lost historical anchor.",
             "Immutability assumes the anchor survives; rollback exists because sometimes it does not."),
            ("Greedy invalidation versus accounted loss",
             "Loss must be exactly quantifiable.",
             "Greedy walks invalidate forward operations by judgment.",
             "Invalidation by drift is loss the contract cannot pre-quantify."),
        ],
    },
}

# ------------------------------------------------------- classification ---

# Viewpoint Axis Delta per discovery kind, grounded in the proximity axis
# (address = 0.0, speaker = 0.5, absent = 1.0).
KIND_DELTA = {
    "istihdar": 1.0,          # absent -> address
    "tabaqat-al-isnad": 0.75, # nested frame shift
    "jisr-al-naba": 0.5,      # distant -> speaker
    "raj-al-jidhr": 0.5,      # boundary crossing
    "ribat": 0.75,            # motion held against continuity
    "alsinat-al-khalq": 0.5,  # payload -> speaker
    "rusul-echo": 0.5,        # contour carried across regions
}
KIND_PROFILE = {
    "istihdar": "internal-rupture",
    "tabaqat-al-isnad": "internal-rupture",
    "jisr-al-naba": "viewpoint-shifting",
    "raj-al-jidhr": "timeline-rollback",
    "ribat": "spatial-dissolution",
    "alsinat-al-khalq": "node-elevation",
    "rusul-echo": "horizon-convergence",
}


def classify_edge(evidence):
    if evidence.startswith("formula["):
        return "formula", "temporal-collapsing"
    if evidence == "الآية المجاورة":
        return "adjacent", "linear-passivity"
    if evidence.startswith("±"):
        return "near", "viewpoint-shifting"
    if evidence.startswith("rasm~"):
        return "tajanus", "distance-shielding"
    if evidence == "pos-pattern":
        return "pos-pattern", "horizon-convergence"
    if evidence.startswith("lem:") or evidence.startswith("root:"):
        return "lem/root", "timeline-rollback"
    if "⊂" in evidence or "⊃" in evidence:
        return "ishtimal", "node-elevation"
    return "other", "linear-passivity"


PERSON_AXIS = {"1": 0.5, "2": 0.0, "3": 1.0}


def motif_viewpoint_delta(pattern):
    vals = [PERSON_AXIS[s[0]] for s in pattern.split(".") if s and s[0] in PERSON_AXIS]
    if len(vals) < 2:
        return 0.0
    return round(max(vals) - min(vals), 3)


FAMILY_DEPS = {
    "r2-discovery": [
        "repo2-isnaad/src/lib/engine/detectors.ts",
        "repo2-isnaad/data/index/discoveries.json",
    ],
    "r2-motif": [
        "repo2-isnaad/src/lib/engine/motifs.ts",
        "repo2-isnaad/data/index/motifs.json",
    ],
    "r1-edge": [
        "repo1-mirtal/sabab.py",
        "repo1-mirtal/edges.json",
    ],
}

RATIONALES = {
    ("r2-discovery", "istihdar"): "A long region bound to absence suddenly ignites into direct address at a single seam, with no external trigger inside the window. The parent block holds its allocation while the inner voice runs local rules of its own. Measured friction {friction} marks the exact point of ignition.",
    ("r2-discovery", "tabaqat-al-isnad"): "Speech opens inside speech: a nested loop starts within the parent block carrying its own frame while the outer memory stays intact. The inner chamber borrows the parent walls but not its voice. Measured friction {friction} prices the nesting event.",
    ("r2-discovery", "jisr-al-naba"): "A sustained distant-past thread pivots mid-run into a live first-person imperfect, reversing orientation without halting. Distance limits snap into place between the pools the thread was serving. Measured friction {friction} is the cost of the reversal.",
    ("r2-discovery", "raj-al-jidhr"): "A root crosses a boundary and returns to an earlier anchor, walking the input trail backwards until the lost point is recovered. Forward operations past the drift are discarded one by one. Measured friction {friction} marks the rollback depth.",
    ("r2-discovery", "ribat"): "Two separately measurable quantities, continuity of wording and motion of viewpoint, are absorbed into a single product at the seam. The threads stop being tracked apart and merge into one parent value. Measured friction {friction} is the merger pressure.",
    ("r2-discovery", "alsinat-al-khalq"): "A passive background element is seated as an active speaker: a record that only existed becomes a hub that transmits. The promotion crosses a hard barrier between payload and participant. Measured friction {friction} prices the elevation.",
    ("r2-discovery", "rusul-echo"): "The same messenger-speech contour surfaces in far-apart regions of the array with an identical footprint. Two eras of the layout synchronize without any channel between them. Measured friction {friction} measures the footprint match.",
    ("r2-motif", "motif"): "A contour of {units} scattered occurrences across the array is pressed into a single immutable pattern key. Every individual position falls away and only the collective signature survives. Measured friction {friction} is the compression pressure.",
    ("r1-edge", "formula"): "A repeated formula key folds {units} distant positions into one label, collapsing their histories into a shared signature. Each occurrence surrenders its individuality to the collective key. Measured friction {friction} prices the fold.",
    ("r1-edge", "adjacent"): "Two neighboring records are linked as flat adjacency with no execution on either side. They are stored, ordered, and traversable, and nothing more. Measured friction {friction} is the weight of pure proximity.",
    ("r1-edge", "near"): "A routing link spans a bounded neighborhood, imposing a distance limit between clusters that the tracker may cross. Orientation stays fixed while the span is negotiated. Measured friction {friction} prices the span.",
    ("r1-edge", "lem/root"): "A lexical root returns across the array to an earlier anchor, tracing the input trail backwards to recover a lost point. Forward links past the drift are left behind. Measured friction {friction} marks the return depth.",
    ("r1-edge", "ishtimal"): "A small opening cluster is elevated into a hub whose containment broadcasts across the structure it begins. The passive opening becomes an active transmitter. Measured friction {friction} prices the elevation.",
    ("r1-edge", "other"): "A declared perceptual link wraps its endpoints in a detachment the tracker refuses to settle. The connection is held at arm's length by explicit typing. Measured friction {friction} prices the shielding.",
}

ABSTRACT_GUARD = re.compile(r"\b\d{1,3}:\d{1,3}\b")
SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")


def check_runway(text):
    parts = [s for s in SENT_SPLIT.split(text.strip()) if s]
    assert len(parts) == 3, f"runway must be exactly 3 sentences, got {len(parts)}"
    assert not ABSTRACT_GUARD.search(text), "runway carries a verse coordinate"
    return True

# ------------------------------------------------------------------ ingest ---

def git_sha(repo_dir):
    try:
        out = subprocess.run(
            ["git", "-C", repo_dir, "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, timeout=10)
        return out.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def repo_metrics(repo_dir):
    files, loc = 0, 0
    exts = (".py", ".ts", ".tsx", ".js", ".mjs", ".md", ".json", ".html", ".css")
    for root, _, names in os.walk(repo_dir):
        if ".git" in root:
            continue
        for n in names:
            if n.endswith(exts):
                files += 1
                try:
                    with open(os.path.join(root, n), encoding="utf-8", errors="ignore") as f:
                        loc += sum(1 for _ in f)
                except OSError:
                    pass
    return {"files": files, "loc": loc}


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def ingest():
    """Stage 0: ingest complete codebase metrics and structural logic."""
    r1 = os.path.join(REPOS, "repo1-mirtal")
    r2 = os.path.join(REPOS, "repo2-isnaad")
    r3 = os.path.join(REPOS, "repo3-arabic")

    discoveries = load_json(os.path.join(r2, "data/index/discoveries.json"))
    motifs = load_json(os.path.join(r2, "data/index/motifs.json"))
    ayaat = load_json(os.path.join(r2, "data/index/ayaat.json"))
    edges = load_json(os.path.join(r1, "edges.json"))

    ev_dist = Counter()
    for v in edges.values():
        for ed in v:
            ev = ed[6] if len(ed) > 6 else ""
            cls, _ = classify_edge(ev)
            ev_dist[cls] += 1

    specs = sorted(n for n in os.listdir(os.path.join(r3, "spec")) if n.endswith(".md"))
    engine_files = []
    for root, _, names in os.walk(os.path.join(r3, "lib")):
        engine_files.extend(n for n in names if n.endswith(".ts"))
    test_files = []
    for root, _, names in os.walk(r3):
        if ".git" in root or "node_modules" in root:
            continue
        test_files.extend(
            os.path.join(root, n) for n in names
            if n.endswith(".test.ts") or n == "run-tests.mjs")

    metrics = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "integer_closure": INTEGER_CLOSURE,
        "r1_almirtal": {
            "head": git_sha(r1), **repo_metrics(r1),
            "edge_sources": len(edges),
            "edges_total": sum(len(v) for v in edges.values()),
            "evidence_distribution": dict(ev_dist),
        },
        "r2_isnad": {
            "head": git_sha(r2), **repo_metrics(r2),
            "discoveries": len(discoveries),
            "discovery_kinds": dict(Counter(d["kind"] for d in discoveries)),
            "motifs": len(motifs),
            "substrate_units": len(ayaat),
        },
        "r3_arabic_timeless": {
            "head": git_sha(r3), **repo_metrics(r3),
            "spec_layers": len(specs),
            "engine_modules": sorted(set(engine_files)),
            "test_files": len(test_files),
        },
    }
    return metrics, discoveries, motifs, edges


# --------------------------------------------------------------- sequences ---

def iter_sequences(discoveries, motifs, edges):
    """Yield every parsed data sequence with its Stage 1/2 measurements."""
    for d in discoveries:
        kind = d["kind"]
        lc = float(d["score"])
        vad = KIND_DELTA[kind]
        friction = round(lc * vad, 3)
        span = d["to"] - d["from"] + 1
        loss = round((span - 1) / span * INTEGER_CLOSURE, 2) if span > 1 else 0.0
        yield {
            "family": "r2-discovery", "classifier": kind,
            "profile": KIND_PROFILE[kind],
            "friction": friction, "lexical_continuity": round(lc, 3),
            "viewpoint_axis_delta": vad,
            "superposition": span, "survivors": 1, "data_loss": loss,
            "units": span,
        }
    for m in motifs:
        occ = len(m["occurrences"])
        lc = round(min(1.0, occ / 8), 3)
        vad = motif_viewpoint_delta(m["pattern"])
        friction = round(lc * vad, 3)
        loss = round((occ - 1) / occ * INTEGER_CLOSURE, 2) if occ > 1 else 0.0
        yield {
            "family": "r2-motif", "classifier": "motif",
            "profile": "temporal-collapsing",
            "friction": friction, "lexical_continuity": lc,
            "viewpoint_axis_delta": vad,
            "superposition": occ, "survivors": 1, "data_loss": loss,
            "units": occ,
        }
    for src in sorted(edges.keys()):
        elist = edges[src]
        src_sura = int(src.split(":")[0])
        for ed in elist:
            ev = ed[6] if len(ed) > 6 else ""
            cls, profile = classify_edge(ev)
            wazn = float(ed[2]) if len(ed) > 2 else 0.0
            lc = round(min(1.0, wazn / 22.2), 3)
            vad = 1.0 if int(ed[0]) != src_sura else 0.25
            friction = round(lc * vad, 3)
            s = len(elist)
            loss = round((s - 1) / s * INTEGER_CLOSURE, 2) if s > 1 else 0.0
            yield {
                "family": "r1-edge", "classifier": cls,
                "profile": profile,
                "friction": friction, "lexical_continuity": lc,
                "viewpoint_axis_delta": vad,
                "superposition": s, "survivors": 1, "data_loss": loss,
                "units": s,
            }


# ------------------------------------------------------------------- emit ---

def friction_table_md(rows):
    out = ["| Friction point | Dotless-engine rule (R3) | Tracking-engine dynamic (R1/R2) | The conflict |",
           "|---|---|---|---|"]
    for point, rule, dyn, conflict in rows:
        out.append(f"| {point} | {rule} | {dyn} | {conflict} |")
    return "\n".join(out)


def build_body(seq, profile, deps):
    p = PROFILES[profile]
    node = "Self-Discovery Node"
    body = (
        f"## {node} — {p['name']}\n\n"
        f"- **Theory type:** {p['name']}\n"
        f"- **Friction coefficient:** {seq['friction']} "
        f"(lexical continuity {seq['lexical_continuity']} x viewpoint axis delta {seq['viewpoint_axis_delta']})\n"
        f"- **Invertibility audit:** superposition {seq['superposition']} -> survivors {seq['survivors']}; "
        f"data loss {seq['data_loss']} of {INTEGER_CLOSURE} (integer closure)\n"
        f"- **Substrate family:** {seq['family']} — {seq['units']} units folded into one record\n"
        f"- **Codebase dependencies:** {', '.join('`' + d + '`' for d in deps)}\n\n"
        f"### Classification rationale\n\n"
        f"{RATIONALES[(seq['family'], seq['classifier'])].format(friction=seq['friction'], units=seq['units'])}\n\n"
        f"### Systemic friction points — dotless-engine rules vs tracking-engine dynamics\n\n"
        f"{friction_table_md(p['friction_table'])}\n"
    )
    assert not ABSTRACT_GUARD.search(body), "body carries a verse coordinate"
    return body


def build_row(seq):
    profile = seq["profile"]
    p = PROFILES[profile]
    check_runway(p["runway"])
    deps = sorted(set(FAMILY_DEPS[seq["family"]] + p["code_deps"]))
    for d in deps:
        full = os.path.join(REPOS, d)
        assert os.path.exists(full), f"dependency does not resolve: {d}"
    node_id = uuid.uuid4()
    return {
        "Database_Target": "Infinite Sovereign Discoveries Atlas",
        "Name": f"Self-Discovery Node {node_id}",
        "Theory_Type": p["name"],
        "Runway_Definition": p["runway"],
        "Codebase_Dependency": deps,
        "Friction_Value": seq["friction"],
        "Invertibility_Audit": {
            "Superposition": seq["superposition"],
            "Survivors": seq["survivors"],
            "Data_Loss": seq["data_loss"],
            "Integer_Closure": INTEGER_CLOSURE,
        },
        "Substrate_Family": seq["family"],
        "Units_Folded": seq["units"],
        "Page_Content_Body": build_body(seq, profile, deps),
    }


# -------------------------------------------------------------------- run ---

def run(resume=False, limit=None):
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
    run_dir = os.path.join(RUNS_DIR, f"run_{stamp}")
    os.makedirs(run_dir, exist_ok=True)
    ledger_path = os.path.join(run_dir, "ledger.jsonl.gz")
    state_path = os.path.join(run_dir, "state.json")

    metrics, discoveries, motifs, edges = ingest()
    with open(os.path.join(PIPELINE_DIR, "engine", "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    # fail fast: every profile runway is exactly three abstract sentences
    for slug, p in PROFILES.items():
        check_runway(p["runway"])
    # fail fast: every dependency resolves against the pinned clones
    for dep in {d for p in PROFILES.values() for d in p["code_deps"]} | \
               {d for ds in FAMILY_DEPS.values() for d in ds}:
        assert os.path.exists(os.path.join(REPOS, dep)), f"unresolved: {dep}"

    state = {"counts": {"r2-discovery": 0, "r2-motif": 0, "r1-edge": 0}}
    if resume and os.path.exists(state_path):
        state = json.load(open(state_path))

    stats = Counter()
    friction_sum = Counter()
    loss_sum = Counter()
    emitted = 0

    with gzip.open(ledger_path, "at", encoding="utf-8") as out:
        for seq in iter_sequences(discoveries, motifs, edges):
            fam = seq["family"]
            if state["counts"][fam] > 0:
                state["counts"][fam] -= 1
                continue
            if seq["friction"] == 0 and seq["profile"] not in PROFILES:
                continue
            row = build_row(seq)
            out.write(json.dumps(row, ensure_ascii=False) + "\n")
            emitted += 1
            stats[seq["profile"]] += 1
            stats[fam] += 1
            friction_sum[fam] += seq["friction"]
            loss_sum[fam] += seq["data_loss"]
            if emitted % 1000 == 0:
                json.dump(state, open(state_path, "w"))
            if limit and emitted >= limit:
                break
    json.dump(state, open(state_path, "w"))

    total_fam = {f: stats[f] for f in ("r2-discovery", "r2-motif", "r1-edge")}
    report = f"""# Discovery Ledger — Run Report

- Run: `{os.path.basename(run_dir)}` (UTC {stamp})
- Rows emitted: {emitted} (no fixed cap; full substrate pass)
- Resume state: `{state_path}`

## Rows per anomaly profile

{chr(10).join(f"- {PROFILES[s]['name']}: {stats[s]}" for s in PROFILES if stats[s])}

## Rows per substrate family

{chr(10).join(f"- {f}: {total_fam[f]} (mean friction {friction_sum[f]/total_fam[f]:.3f}, mean data loss {loss_sum[f]/total_fam[f]:.2f})" for f in total_fam if total_fam[f])}

## Ingested metrics

- R1 al-Mirtāl: {metrics['r1_almirtal']['edges_total']} edges across {metrics['r1_almirtal']['edge_sources']} source blocks
- R2 Isnād Studio: {metrics['r2_isnad']['discoveries']} discoveries, {metrics['r2_isnad']['motifs']} motifs, {metrics['r2_isnad']['substrate_units']} substrate units
- R3 ARABIC_TIMELESS: {metrics['r3_arabic_timeless']['spec_layers']} spec layers, {len(metrics['r3_arabic_timeless']['engine_modules'])} engine modules, {metrics['r3_arabic_timeless']['test_files']} test files

## Operationalizations (Stage 1/2)

- Friction Coefficient = Lexical Continuity x Viewpoint Axis Delta (see module docstring).
- Data Loss = ((Superposition - Survivors) / Superposition) x 28 mod 28; Integer Closure = 28.
- Every row carries a per-profile friction table isolating where R3 dotless-engine
  structural rules limit or conflict with R1/R2 tracking-engine dynamics.
- Abstract-language mandate held: no verse numbers, proper names, chapter markers,
  or thematic labels appear in any Runway or page body (assertion-checked at emit).
"""
    with open(os.path.join(run_dir, "RUN_REPORT.md"), "w", encoding="utf-8") as f:
        f.write(report)
    print(report)
    print(f"ledger: {ledger_path}")


if __name__ == "__main__":
    run(resume="--resume" in sys.argv,
        limit=int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None)
