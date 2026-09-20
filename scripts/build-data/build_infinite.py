#!/usr/bin/env python3
"""Build the infinite-layer indices (FINALITY_PROMPT §7).

Derives, from the canonical corpus in ``data/quran`` and the owner's marker
text in ``references/qalam-30-markers.md``:

  data/index/word-occ.json    every word form -> every occurrence
  data/index/root-occ.json    every root      -> every occurrence
  data/addressals/addressals.json   every vocative addressal -> its ayahs
  data/markers/markers.json   the 30 QALAM markers -> loci derived by
                              anchor-word search over the corpus

Nothing here invents text. Every phrase written out is a verbatim slice of
the corpus; every locus is a real ⟨surah:ayah⟩. Run from anywhere:

    python3 scripts/build-data/build_infinite.py

Occurrences are packed as  s * 1_000_000 + a * 1_000 + pos  (surah 1..114,
ayah 1..286, word position 1..~130) so the index files stay small enough to
fetch once and cache in the service worker.
"""

import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
DATA = os.path.join(ROOT, "data")
REFS = os.path.join(ROOT, "references")

# Quranic annotation signs, harakat, tatweel, bidi marks — everything that is
# decoration over the consonantal skeleton for the purposes of *matching*.
# (Display always uses the untouched canonical string; this is search only.)
DIACRITICS = re.compile(
    "[\u0610-\u061a\u064b-\u065f\u06d6-\u06ed\u0640\u08f0-\u08ff\u200b-\u200f\u06df-\u06e8]"
)
DAGGER_ALEF = "\u0670"
FOLD = {
    "ٱ": "ا",  # alef wasla
    "أ": "ا",  # alef hamza above
    "إ": "ا",  # alef hamza below
    "آ": "ا",  # alef madda
    "ى": "ي",  # alef maqsura -> ya
    "ة": "ه",  # ta marbuta -> ha
    "ی": "ي",  # farsi ya
    "ؤ": "و",  # waw hamza
    "ئ": "ي",  # ya hamza
    "ء": "",        # bare hamza
}
ARABIC_LETTER = re.compile("[ء-ي]")


def normalize(text: str, *, dagger: str = "") -> str:
    """Fold a Quranic token to its bare consonantal form, for matching only.

    The dagger alef (ـٰ, U+0670) is genuinely ambiguous in this orthography:
    in غُلَـٰمٌ it stands for the alef of غلام, while in ٱلرَّحْمَـٰنِ the same
    mark sits over a name written الرحمن. Neither reading is wrong, so both
    foldings are produced (``dagger=""`` drops it, ``dagger="ا"`` spells it
    out) and every lookup tries both — see ``variants``.
    """
    text = text.replace(DAGGER_ALEF, dagger)
    text = DIACRITICS.sub("", text)
    for src, dst in FOLD.items():
        text = text.replace(src, dst)
    return text.strip()


def variants(text: str):
    """Both foldings of a token, de-duplicated, order stable."""
    dropped = normalize(text)
    spelled = normalize(text, dagger="\u0627")
    return [dropped] if dropped == spelled else [dropped, spelled]


def pack(surah: int, ayah: int, pos: int) -> int:
    return surah * 1_000_000 + ayah * 1_000 + pos


def load_json(*parts):
    with open(os.path.join(*parts), encoding="utf-8") as fh:
        return json.load(fh)


def write_json(path, payload, *, compact=True):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        if compact:
            json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
        else:
            json.dump(payload, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    size = os.path.getsize(path)
    rel = os.path.relpath(path, ROOT)
    print(f"  wrote {rel}  ({size / 1024:.0f} KB)")


# --------------------------------------------------------------------------
# corpus


def load_corpus():
    """[(surah, ayah, pos, raw_text, root, pos_tag)] for all 77k words."""
    words = []
    for n in range(1, 115):
        rows = load_json(DATA, "quran", "words", f"{n:03d}.json")
        for row in rows:
            ayah, pos, text, root, _lemma, pos_tag = row[0], row[1], row[2], row[3], row[4], row[5]
            words.append((n, ayah, pos, text, root, pos_tag))
    return words


# --------------------------------------------------------------------------
# §7.2 word & root occurrence indices


def build_occurrences(corpus):
    by_word = defaultdict(list)
    by_root = defaultdict(list)
    for surah, ayah, pos, text, root, _tag in corpus:
        key = pack(surah, ayah, pos)
        by_word[text].append(key)
        if root:
            by_root[root].append(key)
    write_json(os.path.join(DATA, "index", "word-occ.json"), by_word)
    write_json(os.path.join(DATA, "index", "root-occ.json"), by_root)
    print(f"  {len(by_word)} word forms, {len(by_root)} roots, {len(corpus)} occurrences")


# --------------------------------------------------------------------------
# §7.3 vocative addressals


SUPERSCRIPT_ALEF = "ٰ"


def is_vocative_head(text: str) -> bool:
    """A vocative particle fused to its addressee.

    In the Uthmani orthography the vocative يا is written as ي + a superscript
    alef (ـٰ) bound to the following word: يَـٰٓأَيُّهَا، يَـٰقَوْمِ، يَـٰمُوسَىٰ.
    Verbs that merely begin with يأ (يَأْتِى، يَأْكُلُ) carry a sukun instead,
    so the superscript alef in the opening cluster is a reliable discriminator.
    """
    return text.startswith("ي") and SUPERSCRIPT_ALEF in text[:4]


def build_addressals(corpus):
    # index the corpus by (surah, ayah) so we can look forward inside one ayah
    ayah_words = defaultdict(list)
    for surah, ayah, pos, text, root, tag in corpus:
        ayah_words[(surah, ayah)].append((pos, text, tag))
    for key in ayah_words:
        ayah_words[key].sort()

    # Pass 1 — decide which vocative heads are *construct* heads (incomplete
    # without their complement). Derived, not stipulated: a head is construct
    # iff it never ends an ayah and every token that follows it is a noun,
    # proper noun, or relative pronoun. يَـٰٓأَيُّهَا/يَـٰٓأَهْلَ/يَـٰبَنِىٓ pass;
    # يَـٰمُوسَىٰ (which ends ayahs) and يَـٰقَوْمِ (followed by verbs) do not.
    nominal = {"N", "PN", "REL"}
    follows = defaultdict(list)
    for (surah, ayah), rows in ayah_words.items():
        for idx, (pos, text, tag) in enumerate(rows):
            if not is_vocative_head(text):
                continue
            # Keyed on the raw form, not the folded one: يَـٰبَنِىٓ (construct,
            # "O children of…") and يَـٰبُنَىَّ ("O my son", already complete)
            # fold together but are not the same word.
            follows[text].append(rows[idx + 1][2] if idx + 1 < len(rows) else None)
    construct = {
        head
        for head, tags in follows.items()
        if tags and all(tag in nominal for tag in tags)
    }

    # Pass 2 — assemble each addressal phrase and collect its loci.
    phrases = defaultdict(lambda: {"loci": [], "display": None})
    for (surah, ayah), rows in sorted(ayah_words.items()):
        for idx, (pos, text, tag) in enumerate(rows):
            if not is_vocative_head(text):
                continue
            taken = [text]
            cursor = idx + 1
            if text in construct and cursor < len(rows):
                nxt_text, nxt_tag = rows[cursor][1], rows[cursor][2]
                taken.append(nxt_text)
                cursor += 1
                # ٱلَّذِينَ ءَامَنُوا۟ — a relative pronoun is itself incomplete;
                # run on to the verb that closes the relative clause.
                if nxt_tag == "REL":
                    while cursor < len(rows):
                        taken.append(rows[cursor][1])
                        closed = rows[cursor][2] == "V"
                        cursor += 1
                        if closed:
                            break
            key = " ".join(normalize(t) for t in taken)
            entry = phrases[key]
            if entry["display"] is None:
                entry["display"] = " ".join(t.strip() for t in taken)
            entry["loci"].append([surah, ayah, pos])

    out = []
    for key, entry in phrases.items():
        out.append(
            {
                "key": key,
                "phrase": entry["display"],
                "n": len(entry["loci"]),
                "loci": entry["loci"],
            }
        )
    out.sort(key=lambda e: (-e["n"], e["key"]))
    write_json(os.path.join(DATA, "addressals", "addressals.json"), out)
    print(f"  {len(out)} addressals, {sum(e['n'] for e in out)} occurrences")
    return out


# --------------------------------------------------------------------------
# §7.1 QALAM marker scenario engine


MARKER_LINE = re.compile(r"^(\d{1,2})\.\s*\[QALAM\]\s*(.+)$")
ARABIC_RUN = re.compile("[ء-ٰٟ-ۿࣰ-ࣿ]+")
STOPWORDS = {
    normalize(w)
    for w in ("في", "من", "أو", "بعض", "ما", "لي", "قل", "إلى", "على", "لا", "و", "ال", "بما", "عن")
}


def parse_markers():
    """Extract the 30 markers and their anchor tokens from the owner's text.

    The anchors are the Arabic tokens the owner himself put in the marker's
    heading parenthesis — e.g. ``THE GHULAAM PARTICLE (غلام)``. Nothing is
    added: when a heading carries no parenthesis, the anchors are the Arabic
    tokens in the marker's body instead.
    """
    path = os.path.join(REFS, "qalam-30-markers.md")
    markers = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            match = MARKER_LINE.match(line)
            if not match:
                continue
            number = int(match.group(1))
            body = match.group(2)
            paren = re.search(r"\(([^)]*)\)", body)
            anchors = []
            if paren:
                anchors = ARABIC_RUN.findall(paren.group(1))
            body_anchors = ARABIC_RUN.findall(body)
            anchors = [a for a in anchors if len(normalize(a)) >= 3]
            body_anchors = [a for a in body_anchors if len(normalize(a)) >= 3]
            anchors = [a for a in anchors if normalize(a) not in STOPWORDS]
            body_anchors = [a for a in body_anchors if normalize(a) not in STOPWORDS]
            # de-duplicate, keep order
            def dedupe(items):
                seen = set()
                return [i for i in items if not (normalize(i) in seen or seen.add(normalize(i)))]

            markers.append(
                {
                    "n": number,
                    "source_line": body,
                    "anchors": dedupe(anchors),
                    # When the heading's own parenthesis resolves to nothing in
                    # the corpus (marker 4's تعقيل is a maṣdar the Quran never
                    # uses), fall back to the Arabic the owner quoted in the
                    # marker's body — which is, in those cases, the ayah itself.
                    "fallback_anchors": dedupe(body_anchors),
                }
            )
    if len(markers) != 30:
        sys.exit(f"expected 30 QALAM markers, parsed {len(markers)}")
    return markers


def build_markers(corpus, markers):
    """Attach real loci to each marker by anchor-word search over the corpus.

    Resolution is tried in three widening passes per anchor, and the pass that
    hit is recorded in the output so the app never has to guess how solid a
    marker's field is:

      ``exact``       the anchor is a word form the Quran actually uses
      ``root``        the anchor is a root; every word grown from it counts
      ``contains``    the anchor appears inside larger forms (ٱلْغُلَـٰمَ ⊃ غلام)

    An anchor that survives none of the three is listed under ``unresolved``
    and contributes nothing. Markers whose heading anchors all fail fall back
    to the Arabic quoted in the marker's body; if that fails too the marker
    ships with an empty field rather than a fabricated one.
    """
    surface = defaultdict(list)
    roots = defaultdict(list)
    for surah, ayah, pos, text, root, _tag in corpus:
        occurrence = (surah, ayah, pos)
        for key in variants(text):
            surface[key].append(occurrence)
        if root:
            for key in variants(root):
                roots[key].append(occurrence)
    forms = sorted(surface)

    def resolve(anchor):
        """-> (how, occurrences) for the first pass that finds anything."""
        keys = variants(anchor)
        for key in keys:
            if key in surface:
                return "exact", surface[key]
        for key in keys:
            if key in roots:
                return "root", roots[key]
        found = []
        for form in forms:
            if any(len(key) >= 3 and key in form for key in keys):
                found.extend(surface[form])
        if found:
            return "contains", found
        return None, []

    out = []
    for marker in markers:
        used, resolved, unresolved = marker["anchors"], [], []
        hits = {}

        def run(anchor_list):
            local_resolved, local_unresolved, local_hits = [], [], {}
            for anchor in anchor_list:
                how, found = resolve(anchor)
                if not found:
                    local_unresolved.append(anchor)
                    continue
                local_resolved.append({"anchor": anchor, "how": how, "n": len(found)})
                for surah, ayah, pos in found:
                    local_hits.setdefault((surah, ayah), set()).add(pos)
            return local_resolved, local_unresolved, local_hits

        resolved, unresolved, hits = run(used)
        source = "heading"
        if not resolved and marker["fallback_anchors"]:
            resolved, unresolved, hits = run(marker["fallback_anchors"])
            source = "body"

        loci = [[s_, a_, sorted(p)] for (s_, a_), p in sorted(hits.items())]
        out.append(
            {
                "n": marker["n"],
                "source": source,
                "anchors": resolved,
                "unresolved": unresolved,
                "loci": loci,
            }
        )
        kinds = ",".join(sorted({entry["how"] for entry in resolved})) or "—"
        print(f"  marker {marker['n']:2d}: {len(loci):5d} loci  [{source}/{kinds}]")

    write_json(os.path.join(DATA, "markers", "markers.json"), out)
    empty = [m["n"] for m in out if not m["loci"]]
    if empty:
        print(f"  NOTE: markers with no derived loci (kept, honestly empty): {empty}")
    return out


# --------------------------------------------------------------------------
# §8.2 / §9 ◈ — experience paths, reduced to what the sacred interface renders


def build_paths():
    """Turn the 3354 catalogued experiences into pure walks over real ayahs.

    The sacred interface never renders an experience's title, category, or
    curator note (§9: the only words on screen are Quranic), so the runtime
    index carries none of them — only the ordered loci each experience walks,
    and a reverse map from every anchored ayah to the walks passing through
    it, which is what draws the quiet ◈ margin mark. The full records stay in
    ``data/experiences/experiences.json`` as the provenance of record.
    """
    experiences = load_json(DATA, "experiences", "experiences.json")
    walks = []
    anchored = defaultdict(list)
    for record in experiences:
        ayahs = []
        for locus in record.get("loci") or []:
            if len(locus) == 3:
                surah, first, last = locus
                for ayah in range(first, last + 1):
                    ayahs.append(surah * 1000 + ayah)
            elif len(locus) == 2:
                ayahs.append(locus[0] * 1000 + locus[1])
        # keep mushaf order, drop repeats inside one walk
        seen = set()
        ayahs = [a for a in ayahs if not (a in seen or seen.add(a))]
        if not ayahs:
            continue
        index = len(walks)
        walks.append(ayahs)
        for ayah in ayahs:
            anchored[ayah].append(index)
    write_json(os.path.join(DATA, "index", "paths.json"), walks)
    write_json(
        os.path.join(DATA, "index", "ayah-paths.json"),
        {str(ayah): ids for ayah, ids in sorted(anchored.items())},
    )
    singles = sum(1 for walk in walks if len(walk) == 1)
    print(f"  {len(walks)} walks over {len(anchored)} anchored ayahs "
          f"({singles} of them a single ayah — kept; ✧ composes onward from "
          f"there so no walk is a dead end)")


def main():
    print("loading corpus…")
    corpus = load_corpus()
    print(f"  {len(corpus)} words")
    print("building occurrence indices (§7.2)…")
    build_occurrences(corpus)
    print("deriving vocative addressals (§7.3)…")
    build_addressals(corpus)
    print("reducing experiences to walks (§9 ◈)…")
    build_paths()
    print("deriving QALAM marker loci (§7.1)…")
    build_markers(corpus, parse_markers())
    print("done.")


if __name__ == "__main__":
    main()
