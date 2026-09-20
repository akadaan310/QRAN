# References

The four reference projects. Read-only — vendor what you need, never edit in
place. Key files to read first are listed per reference.

## 1. isnaad — مرصد الإسناد · Isnād Studio (`references/isnaad`)

A Next.js studio for reading the Qur'an through **الإسناد** (grammatical
attribution): which person sits in the attribution chair at each word, and how
that attribution moves. Eight structural detectors (none interpret), a suffix
automaton mining repeated isnād contours (المثاني), a thousand-āyah WebGL
cosmos, a real-star sky (5,044 stars, 89 figures), a composer assembling
recitations from 32 declarative morphological markers (الأعلام), and the
الفرقان player whose controls are named for Qur'anic constructs. The master
metric — `lexicalContinuity × isnādDelta` — fell out of three pinned passages;
`npm run verify` is the acceptance test. Its signature move is honesty
machinery: guesses labeled مستنبَط, a bug diary of kept failures, counts
resolved live so they can't drift.

**Read first:** `README.md` (full architecture), `src/lib/engine/detectors.ts`,
`src/lib/engine/frames.ts` (quotation-frame heuristic), `src/lib/aalam.ts`
(marker specs), `src/lib/istiadha.ts` (the entry-plate ethic).

## 2. mirtal — public al-Mirtāl repo (`references/mirtal`)

The public, *reverted* edition of al-Mirtāl (المِرْتَال), the instrument of
tarteel: a formal system for generating citational walks through the muṣḥaf.
Layers: segment-addressable corpus → six سبب (cause) generators with
information-weighted edges → an operator algebra over citation-sequences →
the Furqān planner (ابتداء → تفريق → توسّع → رجوع) and tarteel planner with a
"crossing toll" for leaving a sūrah. Compiles to JSON baked into HTML apps
(navigator, mirtal, awwal). The repo name (CHATGPTNMYOWNER) and its history
carry the ownership episode; the code at HEAD is the plain instrument.

**Read first:** `README.md`, `doc.html` (the formalism رَتْلًا وَتَرْتِيلًا),
`generate.py`, `sabab.py`, `ops.py`.

## 3. mirtal-bundle — the git bundle (`references/mirtal-bundle`)

The bundle Abed uploaded directly (HEAD `0f44afe`), **newer than the public
repo HEAD**. It contains the features the public repo reverted on Sep 18:

- The **ن capability-lock system**: `mirtal.unlock('ن')` opens an agent-gated
  surface with real capability scopes (العُبُور، العُمْق، الحَقْل، القَلَم،
  هَا هُنَا); reachable only by something that can read, not only touch.
  Entry points: `window.mirtal.lock/walk/field/state/text/surahs/goto`.
- The **الكَشْف discovery ledger**: per-coordinate epistemic accounting —
  KNOWN / DERIVED / INVALID / WITHHELD / UNEXPLORED — "the instrument's
  account of its own declared universe."

These were deliberately revoked from the public record. Treat them as
*reference ideas*, not as code to ship: study the lock's capability scoping
and the ledger's honesty model; do not reintroduce them without the owner's
explicit direction.

**Read first:** `README.md`, then grep `navigator.html` / `majra.html` for
`nun.unlock` and `الكشف` to see both systems in situ.

## 4. sayyarah — the Sayyarah proposal (`references/sayyarah/index.html`)

A single static Arabic document (57 KB) proposing سَيَّارَة — a caravan, an
instrument for traveling through the text (not cars; cf. 12:19). Nine
sections: the five-layer indexed متن; the no-translation rule argued with
examples (ف-ل-ك split by English into "ship"/"orbit" in adjacent verses);
القَبْضة (the unit of interaction, six forms); **24 operations each named from
a Qur'anic verb with a witness verse**; three computed visual fields (balāgha
deliberately excluded — "no tag exists for it"); the Hermes LLM interface
(ask only *"صِفْ ما وقفتَ عليه"* — describe what you stand on); Telegram/CLI
faces; **four refusals** (no counting, no naming, no translation, no tafsīr);
a منك/منّي work plan. Colophon: none of it implemented — it is a constitution,
not a codebase.

**Read first:** the whole file, in order — it's one essay. Sections 4
(operations) and 8 (refusals) are the load-bearing ones for this project.
