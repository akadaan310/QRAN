#!/usr/bin/env python3
"""Render the whole spec-ui/ proposal folder as one self-contained HTML file."""
import html
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))

ORDER = [
    ("README.md", "overview", "Overview"),
    ("00_design_pillars.md", "pillars", "00 · Master Design Pillars"),
    ("01_fifteen_line_canvas.md", "canvas", "01 · The 15-Line Canvas"),
    ("02_feature_registry.md", "features", "02 · Feature Registry F01–F20"),
    ("03_interaction_matrix.md", "matrix", "03 · Uniform Interaction Matrix"),
    ("04_hud_taxonomy.md", "hud", "04 · Peripheral HUD Taxonomy"),
    ("05_typography_system.md", "typography", "05 · Visual Typography System"),
    ("06_cognitive_program.md", "cognitive", "06 · Cognitive Program"),
    ("07_operational_spec_sheet.md", "specsheet", "07 · Operational Spec Sheet"),
    ("08_directory_layout.md", "layout", "08 · Directory Layout"),
]


def inline(s):
    parts = re.split(r"(`[^`]+`)", s)
    out = []
    for i, p in enumerate(parts):
        if i % 2 == 1:
            out.append("<code>" + html.escape(p[1:-1]) + "</code>")
        else:
            p = html.escape(p)
            p = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", p)
            p = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", p)
            out.append(p)
    return "".join(out)


def table_row(line):
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return cells


def md_to_html(md):
    lines = md.split("\n")
    out, i = [], 0
    in_fence = False
    fence_buf = []
    while i < len(lines):
        ln = lines[i]
        if ln.strip().startswith("```"):
            if not in_fence:
                in_fence = True
                fence_buf = []
            else:
                in_fence = False
                out.append('<pre class="schema">' +
                           html.escape("\n".join(fence_buf)) + "</pre>")
            i += 1
            continue
        if in_fence:
            fence_buf.append(ln)
            i += 1
            continue
        s = ln.strip()
        if not s:
            i += 1
            continue
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            lvl = len(m.group(1))
            tag = {1: "h1", 2: "h2", 3: "h3", 4: "h4"}[lvl]
            out.append(f"<{tag}>{inline(m.group(2))}</{tag}>")
            i += 1
            continue
        if re.match(r"^---+$", s):
            out.append("<hr>")
            i += 1
            continue
        if s.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip())
                i += 1
            out.append("<blockquote>" + inline(" ".join(buf)) + "</blockquote>")
            continue
        if s.startswith("|") and i + 1 < len(lines) and re.match(
                r"^\|?[\s:\-|]+\|?$", lines[i + 1].strip()):
            heads = table_row(s)
            i += 2
            body = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                body.append(table_row(lines[i].strip()))
                i += 1
            t = ["<table><tr>" + "".join(f"<th>{inline(c)}</th>" for c in heads) + "</tr>"]
            for r in body:
                t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
            t.append("</table>")
            out.append("".join(t))
            continue
        if re.match(r"^(\d+\.\s+|[-*]\s+)", s):
            items = []
            while i < len(lines) and re.match(r"^(\d+\.\s+|[-*]\s+)",
                                              lines[i].strip()):
                items.append(re.sub(r"^(\d+\.\s+|[-*]\s+)", "",
                                    lines[i].strip()))
                i += 1
            out.append("<ul>" + "".join(f"<li>{inline(c)}</li>" for c in items) + "</ul>")
            continue
        buf = []
        while i < len(lines) and lines[i].strip() and not re.match(
                r"^(#{1,4}\s+|```|\||>|---|[-*]\s+|\d+\.\s+)", lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        out.append("<p>" + inline(" ".join(buf)) + "</p>")
    return "\n".join(out)


CSS = """
:root{--bg:#101114;--panel:#17181d;--panel2:#1d1e24;--line:#2a2b33;
--ink:#e9e6da;--muted:#a7a396;--faint:#6f6c62;--accent:#d8a24a;--accent2:#7fb3d5}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font-family:-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif;line-height:1.7}
.top{padding:30px 22px 20px;border-bottom:1px solid var(--line);
background:linear-gradient(180deg,#15161b,#101114)}
.top h1{margin:0 0 8px;font-size:1.6rem}
.top p{margin:0 0 14px;color:var(--muted);max-width:68ch}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{background:var(--panel2);border:1px solid var(--line);border-radius:999px;
padding:4px 12px;font-size:.82rem;color:var(--muted)}
.chip b{color:var(--ink)}
.nav{position:sticky;top:0;z-index:10;background:#14151aee;border-bottom:1px solid var(--line);
padding:10px 14px;display:flex;gap:6px;overflow-x:auto;backdrop-filter:blur(6px)}
.nav a{white-space:nowrap;color:var(--muted);text-decoration:none;font-size:.82rem;
padding:6px 10px;border-radius:8px}
.nav a:hover{background:var(--panel2);color:var(--ink)}
.wrap{max-width:960px;margin:0 auto;padding:10px 20px 90px}
section.doc{padding:26px 0;border-bottom:1px solid var(--line)}
section.doc:last-child{border-bottom:0}
.docnum{color:var(--accent);font-size:.8rem;letter-spacing:.08em;text-transform:uppercase}
h1{font-size:1.5rem;margin:.3em 0 .6em}
h2{font-size:1.2rem;margin:1.6em 0 .5em;color:var(--ink)}
h3{font-size:.85rem;margin:1.8em 0 .4em;color:var(--accent);
text-transform:uppercase;letter-spacing:.06em}
h4{font-size:1rem;margin:1.4em 0 .3em}
p{margin:.7em 0;color:#d8d4c6}
ul{padding-left:22px}
li{margin:.45em 0;color:#d8d4c6}
strong{color:var(--ink)}
code{background:var(--panel2);padding:1px 7px;border-radius:5px;font-size:.86em;
font-family:ui-monospace,monospace;color:var(--accent2)}
pre.schema{background:#0b0c0f;border:1px solid var(--line);border-radius:10px;
padding:16px;overflow-x:auto;font-size:.8rem;line-height:1.5;color:#c9c4b4}
blockquote{border-left:3px solid var(--accent);background:var(--panel);
margin:16px 0;padding:12px 18px;border-radius:0 10px 10px 0;font-style:italic}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:.87rem;
display:block;overflow-x:auto}
th,td{text-align:left;padding:9px 12px;border:1px solid var(--line);vertical-align:top}
th{background:var(--panel2);color:var(--muted);white-space:nowrap}
td:first-child{white-space:nowrap;color:var(--accent)}
hr{border:0;border-top:1px solid var(--line);margin:26px 0}
footer{border-top:1px solid var(--line);padding:20px;color:var(--faint);
font-size:.8rem;text-align:center}
@media(max-width:700px){.wrap{padding:6px 14px 70px}}
"""

NAV = "".join(f'<a href="#{did}">{t}</a>' for _, did, t in ORDER)


def main():
    sections = []
    for fname, did, title in ORDER:
        md = open(os.path.join(HERE, fname), encoding="utf-8").read()
        body = md_to_html(md)
        label = title.split("·", 1)[0].strip() if "·" in title else ""
        sections.append(
            f'<section class="doc" id="{did}">'
            + (f'<div class="docnum">{html.escape(label)}</div>' if label and did != "overview" else "")
            + body + "</section>"
        )
    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>High-Dimensional Interface Blueprint — 15-Line Spatial Matrix</title>
<style>{CSS}</style>
</head>
<body>
<header class="top">
<h1>High-Dimensional Interface Blueprint</h1>
<p>The 15-line page as a spatial matrix: four pillar transformations, twenty rolling
features, and a six-stage path from onboarding to deep tracking — one document.</p>
<div class="chips">
<span class="chip"><b>10</b> proposal documents</span>
<span class="chip"><b>4</b> master pillars</span>
<span class="chip"><b>20</b> rolling features</span>
<span class="chip"><b>6</b> operational stages</span>
</div>
</header>
<nav class="nav">{NAV}</nav>
<div class="wrap">
{"".join(sections)}
</div>
<footer>Proposal only — no implementation. Abstract language, Arabic-first.
Per the standing gate, nothing beyond the UI system is built without explicit approval.</footer>
</body>
</html>"""
    out = os.path.join(HERE, "ui-blueprint.html")
    open(out, "w", encoding="utf-8").write(page)
    print(f"wrote {out} ({os.path.getsize(out)} bytes)")


if __name__ == "__main__":
    main()
