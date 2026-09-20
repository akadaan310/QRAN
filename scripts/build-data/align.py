#!/usr/bin/env python3
"""Precompute word->text-token alignment for every ayah.

Rendering rule for the app (no guessing at runtime):
  - Render ayah text from data/quran/ayat.json, split on spaces -> tokens.
  - data/quran/align.json maps "s:a" -> one [tok_start, tok_end) span per word,
    in the same order as data/quran/words/NNN.json.
  - A word's features attach to its whole span (pause marks included).

Method: greedy walk matching normalized letter skeletons
(diacritics/tatweel/pause marks stripped, letters kept). Ayahs where the
greedy walk fails are flagged "estimated" and fall back to positional
alignment; they are listed in the build log.
"""
import json
import os
import re
import sqlite3

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(REPO, "data")

DIAC = re.compile(r'[ً-ٰٟـۖ-ۭ]')
AR_LETTER = re.compile(r'[ء-ي]')


def norm(t):
    t = DIAC.sub('', t)
    return ''.join(ch for ch in t if AR_LETTER.match(ch))


def main():
    c = sqlite3.connect('/tmp/lex/quran_words.db')
    c.row_factory = sqlite3.Row
    words_of = {}
    for r in c.execute("""select a.surah s, a.ayah a, w.text t, wa.position p
                         from word_ayah wa
                         join ayat a on a.id = wa.ayah_id
                         join words w on w.id = wa.word_id
                         order by a.surah, a.ayah, wa.position"""):
        words_of.setdefault((r['s'], r['a']), []).append(r['t'])
    texts = {(r['surah'], r['ayah']): r['text_uthmani']
             for r in c.execute('select surah, ayah, text_uthmani from ayat')}

    align = {}
    estimated = []
    for (s, a), text in texts.items():
        toks = text.split()
        is_letter = [bool(AR_LETTER.search(t)) for t in toks]
        words = words_of[(s, a)]
        spans = []
        ti = 0
        ok = True
        for w in words:
            start = ti
            parts = [p for p in w.split() if AR_LETTER.search(p)]
            pause_parts = len(w.split()) - len(parts)
            for part in parts:
                # advance to next letter-bearing token
                while ti < len(toks) and not is_letter[ti]:
                    ti += 1
                if ti >= len(toks) or norm(part) != norm(toks[ti]):
                    ok = False
                    break
                ti += 1
            if not ok:
                break
            # absorb immediately following pause-only tokens
            for _ in range(pause_parts):
                if ti < len(toks) and not is_letter[ti]:
                    ti += 1
            spans.append([start, ti])
        if not ok or len(spans) != len(words):
            estimated.append(f"{s}:{a}")
            # positional fallback: 1 token per word over letter-bearing tokens
            spans = []
            li = [i for i, b in enumerate(is_letter) if b]
            for k in range(len(words)):
                s0 = li[k] if k < len(li) else len(toks)
                s1 = li[k + 1] if k + 1 < len(li) else len(toks)
                spans.append([s0, s1])
        align[f"{s}:{a}"] = spans

    json.dump(align, open(os.path.join(DATA, "quran", "align.json"), "w"),
              separators=(",", ":"))
    print(f"aligned {len(align)} ayahs, estimated(fallback): {len(estimated)}")
    for e in estimated:
        print("  estimated:", e)


if __name__ == "__main__":
    main()
