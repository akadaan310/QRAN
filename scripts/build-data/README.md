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
```

`extract.py` runs a word-join consistency check and reports mismatches
(expected: minor diacritic-level differences between the DB's word table and
ayah strings — alignment is by position, verified by `align.py`).

`align.py` prints any ayahs that fell back to positional alignment
(currently 6 of 6236; their spans were hand-verified correct).

All scripts are idempotent; outputs are deterministic given the same inputs.
