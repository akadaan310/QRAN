# QRAN data layer

Canonical, build-ready data for the immersive Quran explorer. Everything the
app renders comes from these files — no placeholder text anywhere.

## Layout

```
data/
  quran/
    surahs.json        114 surahs: {n, ar, en, type, ayahs, words, juz_start}
    ayat.json          6236 ayahs: [s, a, juz, page, hizb, rub, manzil, ruku,
                       sajdah, uthmani_text]   (page = 1..604 Madani)
    words/NNN.json     per-surah word stream (114 files):
                       [ayah, pos, text, root, lemma, pos_tag, en, translit]
    align.json         "s:a" -> [[tok_start, tok_end), ...] per word,
                       aligned to ayat.json text split on spaces
  lexicon/
    roots.json         1642 roots: {g_ar, g_en, g_ar_src, g_en_src, n,
                       masadir:[{m, p}], defs:[{book, text}]}
    words.json         21295 unique words: [text, root, en, translit, count]
                       sorted by frequency (desc)
  fehres/
    fehres.json        the dynamic index: surahs, 30 juz starts, 604 page
                       starts, root frequency ranking, corpus stats
  experiences/
    experiences.json   3354 browsable experiences (see below)
    archetypes.json    8 anomaly archetypes (plain-language curator labels)
  index/               derived by build_infinite.py — see SOURCES.md §3
    word-occ.json      word form -> [packed occurrences]
    root-occ.json      root      -> [packed occurrences]
    paths.json         the 3354 experiences as ordered walks over ayahs
    ayah-paths.json    anchored ayah -> the walks passing through it
  addressals/
    addressals.json    every vocative addressal -> its loci, derived
  markers/
    markers.json       the 30 QALAM markers -> loci, with how each anchor resolved
```

Occurrences in `index/` and `markers/` are packed as
`surah * 1_000_000 + ayah * 1_000 + position`.

## Rendering rule (normative)

1. Render ayah text from `ayat.json` (`uthmani_text`), split on **runs of
   whitespace, discarding empty tokens** (`text.trim().split(/\s+/)`). 110
   ayahs carry a leading or doubled space — 2:1's text is `" الٓمٓ"` — and a
   naive split on a single `" "` shifts every span in those ayahs by one.
2. Word *i* of the ayah = `words/NNN.json` row *i* (1-based `pos`).
3. Its screen span = `align.json["s:a"][i]` — token indices into the split
   text. Attach the word's features (root, lemma, translation) to that span.
4. Never re-derive alignment at runtime; never render from the word stream
   alone (pause-mark placement lives in the ayah text).

## Experiences

| kind      | count | source |
|-----------|-------|--------|
| discovery | 2500  | isnaad `data/index/discoveries.json` — real loci, Arabic titles/notes |
| motif     | 400   | isnaad `data/index/motifs.json` — pattern + all occurrences |
| formula   | 454   | al-Mirtal `edges.json` — phrases recurring in ≥3 ayahs, all loci |

Each experience carries `loci` (list of `[surah, ayah]` or `[surah, a_from,
a_to]`), so every experience is one tap away from its real text. Discovery
`cat` values (`istihdar`, `ribat`, …) are the source repo's own Arabic terms,
kept quoted and repository-scoped — they are content labels, not UI
vocabulary.

## Provenance & licenses

See `SOURCES.md`. Regeneration: `scripts/build-data/README.md`.
