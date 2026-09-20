#!/usr/bin/env python3
"""Extract the canonical QRAN data layer from the quran-words SQLite database.

Source: AhmedSaadi0/quran-words DB v3 (GitHub Release db-v3), which itself
aggregates:
  - Quran.com API v4      : Uthmani text, word-by-word EN translation, ayah
                            divisions (juz/hizb/rub/page/manzil/ruku/sajdah) [CC-BY-4.0]
  - Quranic Arabic Corpus : word morphology (root, lemma, POS) [GPL]
  - Hawramani Arabic Lexicon : classical root definitions [GPL-3.0]
  - CAMeL Tools CALIMA-Star : masdar/derivative validation [MIT]

Download (re-run): the script expects the DB at --db (default /tmp/lex/quran_words.db).
Fetch it with:
  curl -sL -o quran_words.db.zip \
    https://github.com/AhmedSaadi0/quran-words/releases/download/db-v3/quran_words.db.zip
  unzip quran_words.db.zip

Outputs (under --out, default <repo>/data):
  quran/surahs.json        114 surahs: number, Arabic/English names, type, counts
  quran/ayat.json          6236 ayahs: [s, a, juz, page, hizb, rub, manzil, ruku,
                           sajdah, uthmani_text]
  quran/words/NNN.json     per-surah word occurrences:
                           [ayah, pos, text, root, lemma, pos_tag, en, translit]
  lexicon/roots.json       1642 roots: {gloss_ar, gloss_en, count, masadir,
                           definitions:[{book, text}]}
  lexicon/words.json       21295 unique words: [text, root, en, translit, count]
  fehres/fehres.json       dynamic index: surahs, juz starts, 604 page starts,
                           root frequency ranking, corpus stats

A consistency check joins each ayah's words and compares against its Uthmani
text; mismatches are reported (not silently fixed).
"""
import argparse
import json
import os
import sqlite3
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default="/tmp/lex/quran_words.db")
    ap.add_argument("--out", default=os.path.join(REPO, "data"))
    args = ap.parse_args()

    c = sqlite3.connect(args.db)
    c.row_factory = sqlite3.Row
    out = args.out
    os.makedirs(os.path.join(out, "quran", "words"), exist_ok=True)
    os.makedirs(os.path.join(out, "lexicon"), exist_ok=True)
    os.makedirs(os.path.join(out, "fehres"), exist_ok=True)

    # ---- surahs ----
    surahs = []
    for r in c.execute("select * from surahs order by id"):
        surahs.append({
            "n": r["id"], "ar": r["name_ar"], "en": r["name_en"],
            "type": r["revelation_type"], "ayahs": r["ayah_count"],
            "juz_start": r["juz_start"],
        })
    words_per_surah = {r["surah"]: r["n"] for r in
                       c.execute("select surah, count(*) n from ayat group by surah")}
    for s in surahs:
        s["words"] = words_per_surah.get(s["n"], 0)
    json.dump(surahs, open(os.path.join(out, "quran", "surahs.json"), "w"),
              ensure_ascii=False)

    # ---- ayat ----
    ayat = []
    for r in c.execute("select * from ayat order by surah, ayah"):
        ayat.append([r["surah"], r["ayah"], r["juz"], r["page_number"],
                     r["hizb"], r["rub_el_hizb"], r["manzil_number"],
                     r["ruku_number"], r["sajdah_number"], r["text_uthmani"]])
    json.dump(ayat, open(os.path.join(out, "quran", "ayat.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(f"ayat: {len(ayat)}")

    # ---- word occurrences per surah ----
    root_of = {r["id"]: r["root"] for r in c.execute("select id, root from roots")}
    lemma_of = {r["id"]: r["lemma_ar"] for r in c.execute("select id, lemma_ar from lemmas")}
    words = {r["id"]: dict(r) for r in c.execute("select * from words")}
    morph = {}
    for r in c.execute("select word_ayah_id, pos, root_id, lemma_id from word_morphology"):
        morph[r["word_ayah_id"]] = (r["pos"], r["root_id"], r["lemma_id"])

    per_surah = {}
    mismatches = 0
    checked = 0
    ayah_text = {(a[0], a[1]): a[9] for a in ayat}
    for r in c.execute("""select wa.id, wa.word_id, wa.ayah_id, wa.position,
                                 a.surah, a.ayah
                          from word_ayah wa join ayat a on a.id = wa.ayah_id
                          order by a.surah, a.ayah, wa.position"""):
        w = words[r["word_id"]]
        pos, root_id, lemma_id = morph.get(r["id"], (None, None, None))
        rec = [r["ayah"], r["position"], w["text"],
               root_of.get(root_id), lemma_of.get(lemma_id), pos,
               w["translation"], w["transliteration"]]
        per_surah.setdefault(r["surah"], []).append(rec)

    # consistency: joined words vs uthmani text (normalized spaces)
    for (s, a), text in ayah_text.items():
        recs = [x for x in per_surah.get(s, []) if x[0] == a]
        joined = " ".join(x[2] for x in recs)
        norm = lambda t: " ".join(t.split())
        checked += 1
        if norm(joined) != norm(text):
            mismatches += 1
            if mismatches <= 5:
                print(f"MISMATCH {s}:{a}\n  words: {joined[:80]}\n  text:  {text[:80]}")
    print(f"word-join check: {checked} ayahs, {mismatches} mismatches")

    for s, recs in per_surah.items():
        p = os.path.join(out, "quran", "words", f"{s:03d}.json")
        json.dump(recs, open(p, "w"), ensure_ascii=False, separators=(",", ":"))
    total_words = sum(len(v) for v in per_surah.values())
    print(f"word occurrences: {total_words} in {len(per_surah)} surah files")

    # ---- roots lexicon ----
    gloss = {}
    for r in c.execute("select root_id, gloss_ar, gloss_en, ar_source, en_source from root_glosses"):
        gloss[r["root_id"]] = r
    defs = {}
    for r in c.execute("""select m.root_id, m.book_name, m.definition
                         from root_meanings m order by m.root_id, m.id"""):
        defs.setdefault(r["root_id"], []).append(
            {"book": r["book_name"], "text": r["definition"][:600]})
    masadir = {}
    for r in c.execute("""select root_id, masdar_ar, pattern, is_attested
                         from masadir where is_attested = 1 order by root_id"""):
        masadir.setdefault(r["root_id"], []).append(
            {"m": r["masdar_ar"], "p": r["pattern"]})

    roots = {}
    for r in c.execute("select * from roots order by id"):
        rid = r["id"]
        g = gloss.get(rid, {})
        roots[r["root"]] = {
            "g_ar": (g["gloss_ar"] if g else None) or None,
            "g_en": (g["gloss_en"] if g else None) or None,
            "g_ar_src": (g["ar_source"] if g else None) or None,
            "g_en_src": (g["en_source"] if g else None) or None,
            "n": r["occurrences_count"],
            "masadir": masadir.get(rid, [])[:8],
            "defs": defs.get(rid, [])[:3],
        }
    json.dump(roots, open(os.path.join(out, "lexicon", "roots.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(f"roots: {len(roots)}")

    # ---- unique words lexicon ----
    wcount = {}
    for r in c.execute("select word_id, count(*) n from word_ayah group by word_id"):
        wcount[r["word_id"]] = r["n"]
    wroot = {}
    for r in c.execute("""select wa.word_id, m.root_id
                         from word_ayah wa join word_morphology m on m.word_ayah_id = wa.id
                         group by wa.word_id"""):
        wroot[r["word_id"]] = root_of.get(r["root_id"])
    wlex = []
    for wid, w in words.items():
        wlex.append([w["text"], wroot.get(wid), w["translation"],
                     w["transliteration"], wcount.get(wid, 0)])
    wlex.sort(key=lambda x: -x[4])
    json.dump(wlex, open(os.path.join(out, "lexicon", "words.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(f"unique words: {len(wlex)}")

    # ---- fehres (dynamic index) ----
    juz_starts = []
    for r in c.execute("""select juz, min(surah) s, min(ayah) a, min(page_number) p
                         from ayat group by juz order by juz"""):
        # first ayah of each juz: min over (surah, ayah) needs care; use rowid order
        first = c.execute("""select surah, ayah, page_number from ayat
                             where juz = ? order by surah, ayah limit 1""",
                          (r["juz"],)).fetchone()
        juz_starts.append({"n": r["juz"], "s": first["surah"],
                           "a": first["ayah"], "page": first["page_number"]})
    page_starts = []
    for r in c.execute("""select page_number p from ayat group by p order by p"""):
        first = c.execute("""select surah, ayah from ayat where page_number = ?
                             order by surah, ayah limit 1""", (r["p"],)).fetchone()
        page_starts.append([r["p"], first["surah"], first["ayah"]])
    root_rank = sorted(((root, v["n"]) for root, v in roots.items()),
                       key=lambda x: -x[1])
    fehres = {
        "surahs": surahs,
        "juz": juz_starts,
        "pages": page_starts,
        "root_rank": [[r, n] for r, n in root_rank],
        "stats": {
            "surahs": 114, "ayahs": len(ayat), "words": total_words,
            "unique_words": len(wlex), "roots": len(roots),
            "pages": len(page_starts),
        },
    }
    json.dump(fehres, open(os.path.join(out, "fehres", "fehres.json"), "w"),
              ensure_ascii=False, separators=(",", ":"))
    print(f"fehres: {len(juz_starts)} juz, {len(page_starts)} pages")

    c.close()
    print("done ->", out)


if __name__ == "__main__":
    main()
