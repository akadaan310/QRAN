#!/usr/bin/env python3
"""Build the browsable experiences catalog from primary-source phenomena.

Inputs (all vendored in the repo):
  references/isnaad/data/index/discoveries.json   2500 discoveries w/ loci
  references/isnaad/data/index/motifs.json         400 motifs w/ occurrences
  references/mirtal-bundle/edges.json             al-Mirtal ayah edges
  curriculum-wiki-matrix/.../ledger.jsonl.gz      8 anomaly archetypes

Outputs (under <repo>/data/experiences):
  experiences.json   every experience: {id, kind, cat, title, s, a_from, a_to,
                     locus list, note, roots}
  archetypes.json    the 8 ledger anomaly profiles as plain-language
                     browsing archetypes (curator labels, not doctrine)

Kinds:
  discovery  one isnaad discovery (real locus, Arabic title+note, evidence)
  motif      one isnaad motif pattern with all its occurrences
  formula    one recurring phrase from al-Mirtal edges (>=3 occurrences),
             with every ayah locus

No invented terminology: discovery `kind` values are kept quoted and
repository-scoped; archetype labels are marked curator-written.
"""
import gzip
import json
import os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = os.path.join(REPO, "references")
OUT = os.path.join(REPO, "data", "experiences")

ARCHETYPE_AR = {
    "Internal Rupture Mechanics": "انشقاق داخلي",
    "Recursive Timeline Rollbacks": "ارتداد زمني متكرر",
    "Radial Spatial Dissolution": "تلاشٍ مكاني",
    "Real-Time Viewpoint Shifting": "تحوّل المنظور",
    "Gravitational Node Elevation": "علوّ العقدة",
    "Spatial Horizon Convergence": "تقارب الأفق",
    "Temporal State Collapsing": "انطواء الحالة",
    "Linear Object Passivity": "سكون العنصر",
}


def main():
    os.makedirs(OUT, exist_ok=True)
    experiences = []

    # ---- 1. isnaad discoveries (2500) ----
    discs = json.load(open(os.path.join(REF, "isnaad", "data", "index",
                                        "discoveries.json")))
    for d in discs:
        ev = d.get("evidence", {})
        experiences.append({
            "id": f"disc:{d['id']}",
            "kind": "discovery",
            "cat": d["kind"],
            "title": d.get("title") or d["kind"],
            "s": d["surah"], "a_from": d["ayahFrom"], "a_to": d["ayahTo"],
            "loci": [[d["surah"], d["ayahFrom"], d["ayahTo"]]],
            "note": d.get("note"),
            "roots": (ev.get("جذور رابطة") if isinstance(ev, dict) else None),
            "score": d.get("score"),
        })
    print(f"discoveries: {len(discs)}")

    # ---- 2. isnaad motifs (400) ----
    motifs = json.load(open(os.path.join(REF, "isnaad", "data", "index",
                                         "motifs.json")))
    for m in motifs:
        occ = m.get("occurrences", [])
        loci = [[o["surah"], o["ayah"]] for o in occ[:50]]
        experiences.append({
            "id": f"motif:{m['id']}",
            "kind": "motif",
            "cat": "motif",
            "title": m.get("gloss") or m["id"],
            "pattern": m.get("pattern"),
            "s": loci[0][0] if loci else None,
            "a_from": loci[0][1] if loci else None,
            "a_to": loci[0][1] if loci else None,
            "loci": loci,
            "n_occurrences": len(occ),
            "note": None, "roots": None, "score": None,
        })
    print(f"motifs: {len(motifs)}")

    # ---- 3. al-Mirtal recurring formulas (>=3 ayahs) ----
    edges = json.load(open(os.path.join(REF, "mirtal-bundle", "edges.json")))
    formulas = {}
    for ayah_key, edgelist in edges.items():
        s, a = ayah_key.split(":")
        for ed in edgelist:
            label = ed[6]
            if label.startswith("formula"):
                formulas.setdefault(label, []).append([int(s), int(a)])
    kept = {}
    for k, v in formulas.items():
        if len(v) >= 3:
            seen, uniq = set(), []
            for loc in v:
                t = tuple(loc)
                if t not in seen:
                    seen.add(t)
                    uniq.append(loc)
            kept[k] = uniq
    for i, (label, loci) in enumerate(sorted(kept.items(),
                                             key=lambda kv: -len(kv[1]))):
        # label like "formula[3]:يايها الذين ءامنوا"
        phrase = label.split(":", 1)[1] if ":" in label else label
        n_words = label.split("[")[1].split("]")[0] if "[" in label else None
        loci.sort()
        experiences.append({
            "id": f"formula:{i}",
            "kind": "formula",
            "cat": "formula",
            "title": phrase,
            "n_words": n_words,
            "s": loci[0][0], "a_from": loci[0][1], "a_to": loci[0][1],
            "loci": loci,
            "n_occurrences": len(loci),
            "note": None, "roots": None, "score": None,
        })
    print(f"formulas (>=3): {len(kept)} of {len(formulas)}")

    json.dump(experiences, open(os.path.join(OUT, "experiences.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(f"TOTAL experiences: {len(experiences)}")

    # ---- 4. archetypes from the discovery ledger ----
    run_path = os.path.join(
        REPO, "curriculum-wiki-matrix", "05_discovery_ledger",
        "phase2_pipeline", "runs", "run_2026-09-20T072345Z", "ledger.jsonl.gz")
    archetypes = {}
    counts = {}
    with gzip.open(run_path, "rt", encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            t = r["Theory_Type"]
            archetypes.setdefault(t, r["Runway_Definition"])
            counts[t] = counts.get(t, 0) + 1
    arch = []
    for t, runway in archetypes.items():
        arch.append({
            "name_en": t,
            "name_ar": ARCHETYPE_AR.get(t, t),
            "curator_label": True,
            "runway": runway,
            "ledger_rows": counts[t],
        })
    arch.sort(key=lambda x: -x["ledger_rows"])
    json.dump(arch, open(os.path.join(OUT, "archetypes.json"), "w"),
              ensure_ascii=False, indent=1)
    print(f"archetypes: {len(arch)}")


if __name__ == "__main__":
    main()
