# Data sources, provenance & license accounting

All files under `data/` are derived from the sources below. This file is the
attribution record; keep it current if sources change.

## 1. Quran text, word translations, ayah divisions

**Source:** `quran-words.db` v3 (AhmedSaadi0/quran-words, MIT), aggregating:

- **Quran.com API v4** — Uthmani ayah text, word-by-word English translations,
  transliterations, and per-ayah divisions: juz (1–30), hizb, rubʿ al-hizb,
  **page (1–604, Madani mushaf)**, manzil, ruku, sajdah.
  License: **CC-BY-4.0** — attribution required (given here).
- **Quranic Arabic Corpus v0.4** (University of Leeds; Dukes & Habash, LREC
  2010) — per-word root, lemma, part of speech, inflection features.
  License: **GNU GPL**.
- **Hawramani Arabic Lexicon** — classical root definitions drawn from:
  المفردات في غريب القرآن (الراغب الأصفهاني)، لسان العرب، تاج العروس،
  الصحاح، القاموس المحيط، كتاب العين، المحكم والمحيط الأعظم.
  License: **GPL-3.0**.
- **CAMeL Tools CALIMA-Star** (NYUAD) — masdar/derivative validation.
  License: **MIT**.

**What QRAN vendors from this:** `quran/*`, `lexicon/*`, `fehres/*` (derived
JSON). The 118 MB source DB is *not* vendored; re-download per
`scripts/build-data/README.md`.

**License consequence:** the derived JSON contains GPL-family material
(morphology annotations, classical definitions). Treat `data/lexicon` and the
morphology columns of `data/quran/words` as GPL-licensed data: keep this
attribution, do not strip source fields (`g_ar_src`, `g_en_src`, `book`).

## 2. Experiences

- **isnaad** `data/index/discoveries.json` (2500) and `motifs.json` (400) —
  vendored under `references/isnaad` (read-only snapshot; no license file
  found in the snapshot — treated as all-rights-reserved reference, used
  with attribution to the isnaad project).
- **al-Mirtal** `edges.json` — vendored under `references/mirtal-bundle`
  (same license note as above; attribution to the CHATGPTNMYOWNER/al-Mirtāl
  project).
- **Discovery-ledger archetypes** — derived from this project's own
  `curriculum-wiki-matrix/05_discovery_ledger` run
  `run_2026-09-20T072345Z` (40,095 rows); archetype labels are curator-written
  plain-language descriptions, not scholarly claims.

## 3. Fonts (prototype)

Amiri Quran + Noto Kufi Arabic, vendored in `prototype/public/fonts` from
`references/isnaad` (see `prototype/data/SOURCES.md`).

## Citation

If you publish from this data, cite: Quran.com API (CC-BY-4.0); Dukes, K. &
Habash, N. (2010), *Morphological Annotation of Quranic Arabic*, LREC;
Hawramani Arabic Lexicon; AhmedSaadi0/quran-words.
