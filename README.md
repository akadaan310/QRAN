# QRAN — the Interstellar Quran

A public-facing Quran explorer: the entire corpus rendered and navigable end to
end, every word opening into everywhere else it stands, every root defined by
its own usage, thousands of journeys through the text — and an interface whose
only words are the Quran's own.

There are no labels in this app, in any language. There is Quranic text, eight
glyphs, gestures, space and motion. The interface is learned once, wordlessly,
in about twenty seconds.

## The eight glyphs

✦ the word · ❖ its root · ◈ a walk · ◉ the addressed · ⬔ a field ·
◐ the rasm · ◍ the compass · ✧ composing

✕ dismisses any layer and returns to the exact ayah. ↻ is the only thing shown
when something fails.

## Running it

```bash
cd prototype
npm install
npm run dev      # or: npm run build && npx http-server dist
```

A fresh clone needs no network and no database: the corpus is vendored under
`data/` and served into the app by a Vite plugin (in `dist/` it is copied in,
so a static build is self-contained and works offline).

```bash
npm run build    # typecheck + bundle + copy the corpus into dist/
npm run verify   # data and fixture pins — the corpus, the indices, the walks
npm run walk     # the wordless audit and the glyph walk, in a real browser
```

`npm run walk` is the verification that matters most. It renders every
reachable surface, extracts every token on it, and fails if any token is not a
word of the Quran — then walks the whole app using glyphs and gestures only.

## What is in here

```
QRAN/
├── CLAUDE.md                  # session brief: mission, covenant, conventions
├── FINALITY_PROMPT.md         # the standing execution order (§9 is final)
├── BUILD_PROMPT.md            # superseded, kept for history
├── data/                      # the canonical corpus — see data/README.md
│   ├── quran/                 # 6236 ayahs, per-surah word streams, alignment
│   ├── lexicon/               # 1642 roots, 21295 words (canonical, not rendered)
│   ├── fehres/                # 114 surahs, 30 juz, 604 pages, root ranking
│   ├── experiences/           # 3354 catalogued experiences
│   ├── index/                 # derived: occurrences, walks, anchors
│   ├── addressals/            # derived: every vocative addressal in the corpus
│   └── markers/               # derived: the 30 QALAM markers' loci
├── docs/                      # UI system, architecture, references
├── prototype/                 # the app
│   ├── src/sacred/            # the sacred interface (what a reader sees)
│   ├── src/{canvas,features,gestures,hud,onboarding}/   # Phase-1, superseded
│   ├── scripts/verify.mjs     # data and fixture pins
│   └── scripts/walk.mjs       # the wordless audit and the glyph walk
├── scripts/build-data/        # regenerates everything under data/
├── references/                # read-only upstream material (never edited in place)
└── curriculum-wiki-matrix/    # design specs
```

## The covenant

Every path is a citation, never an invention. Arabic-first — now
Arabic-only. Apparatus in the margin, never in the line. Guesses are labelled
as guesses and failed experiments stay visible. Experiences are registry data
rendered by one engine, never hand-built pages.

`prototype/QA_NOTES.md` is where the build's decisions, its costs, the bugs it
found, and what it still cannot do are written down. It is meant to be read.

## Provenance

`data/SOURCES.md` carries the attributions — Quran.com (CC-BY-4.0), the Quranic
Arabic Corpus, the Hawramani lexicon, isnaad, al-Mirtāl. It ships with every
build at `/data/SOURCES.md`: §9 leaves no room for an in-app About screen, so
the attributions travel with the data instead.
