# scripts/build-data

Regenerates `data/` from primary sources. Run in order:

```bash
# 1. fetch the source DB (118 MB; not vendored)
curl -sL -o /tmp/lex/quran_words.db.zip \
  https://github.com/AhmedSaadi0/quran-words/releases/download/db-v3/quran_words.db.zip
unzip -o /tmp/lex/quran_words.db.zip -d /tmp/lex

# 2. extract quran text + words + lexicon + fehres
python3 scripts/build-data/extract.py --db /tmp/lex/quran_words.db

# 3. word -> text-token alignment map
python3 scripts/build-data/align.py

# 4. experiences catalog from vendored references + ledger
python3 scripts/build-data/build_experiences.py

# 5. the infinite layer: occurrence indices, addressals, walks, marker loci
python3 scripts/build-data/build_infinite.py
```

`extract.py` runs a word-join consistency check and reports mismatches
(expected: minor diacritic-level differences between the DB's word table and
ayah strings — alignment is by position, verified by `align.py`).

`align.py` prints any ayahs that fell back to positional alignment
(currently 6 of 6236; their spans were hand-verified correct).

`build_infinite.py` derives everything FINALITY_PROMPT §7 needs from the
corpus that steps 2–4 produced, plus the owner's marker text:

| output | what it is |
|--------|------------|
| `data/index/word-occ.json` | each of 21,295 word forms → all its occurrences |
| `data/index/root-occ.json` | each of 1,642 roots → all its occurrences |
| `data/addressals/addressals.json` | every vocative addressal, derived from the word stream |
| `data/index/paths.json` | the 3,354 experiences reduced to ordered walks over ayahs |
| `data/index/ayah-paths.json` | each anchored ayah → the walks passing through it |
| `data/markers/markers.json` | the 30 QALAM markers → loci found by anchor search |

Occurrences are packed as `surah × 1_000_000 + ayah × 1_000 + position`.

It prints how many loci each marker resolved to and by which pass (`exact`,
`root` or `contains`), and names any marker that resolved to nothing. Two
things it will not do: invent a locus for a marker whose anchors the Quran
never uses (it falls back to the Arabic quoted in the marker's own body, and
records that it did), and write out any of the markers' prose — that stays in
`references/qalam-30-markers.md` as the owner's proposed framework, quoted and
attributed there and never rendered by the app.

All scripts are idempotent; outputs are deterministic given the same inputs.
`prototype/npm run verify` pins the results.
