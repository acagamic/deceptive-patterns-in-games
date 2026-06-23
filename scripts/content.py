#!/usr/bin/env python3
"""
content.py — local content workflow for the Deceptive Patterns library.

Usage:
  python scripts/content.py list                 # list all patterns
  python scripts/content.py new                  # scaffold a new pattern (interactive)
  python scripts/content.py new --slug daily-rewards --title "Daily rewards" --code T9 \
      --category "Temporal & attention" --family temporal --severity Medium \
      --evidence Moderate --harms time-attention,emotional --modes manipulative \
      --tags streaks,retention --refs lewis-2014
  python scripts/content.py validate             # validate ALL content; exit 1 on errors

No third-party deps required (PyYAML is used if available, else a built-in parser).
Run it from the project root.
"""
from __future__ import annotations
import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content"
PATTERNS = CONTENT / "patterns"
GLOSSARY = CONTENT / "glossary"

SEVERITIES = ["Low", "Medium", "High", "Severe"]
EVIDENCE = ["Strong", "Moderate", "Emerging"]
CATEGORIES = [
    "Monetary & randomised",
    "Temporal & attention",
    "Social & parasocial",
    "Psychological / reinforcement",
    "Informational / interface",
]

C_RED, C_GRN, C_YEL, C_DIM, C_END = "\033[31m", "\033[32m", "\033[33m", "\033[2m", "\033[0m"


# ---------- frontmatter parsing ----------
def split_frontmatter(text: str):
    if not text.startswith("---"):
        return None, text
    m = re.search(r"\n---\s*\n", text[3:])
    if not m:
        return None, text
    fm = text[3 : 3 + m.start()].strip("\n")
    body = text[3 + m.end():]
    return fm, body


def parse_frontmatter(text: str) -> dict:
    fm, _ = split_frontmatter(text)
    if fm is None:
        return {}
    try:
        import yaml  # type: ignore

        return yaml.safe_load(fm) or {}
    except Exception:
        pass
    data: dict = {}
    for line in fm.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or ":" not in line:
            continue
        key, val = line.split(":", 1)
        key, val = key.strip(), val.strip()
        if val == "":
            data[key] = None
            continue
        try:
            data[key] = json.loads(val)
        except Exception:
            data[key] = val.strip().strip('"').strip("'")
    return data


def load_ids(json_file: str, key: str | None = None) -> set:
    p = CONTENT / json_file
    items = json.loads(p.read_text())
    return {it["id"] for it in items}


def ref_ids() -> set:
    return {it["id"] for it in json.loads((CONTENT / "references.csl.json").read_text())}


# ---------- commands ----------
def cmd_list(_args):
    rows = []
    for f in sorted(PATTERNS.glob("*.mdx")):
        d = parse_frontmatter(f.read_text())
        rows.append((d.get("code", "?"), d.get("severity", "?"), d.get("family", "?"), d.get("title", f.stem)))
    rows.sort(key=lambda r: r[0])
    print(f"{'CODE':<5} {'SEVERITY':<9} {'FAMILY':<16} TITLE")
    for code, sev, fam, title in rows:
        print(f"{code:<5} {sev:<9} {fam:<16} {title}")
    print(f"\n{len(rows)} patterns.")


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def cmd_new(args):
    def ask(prompt, default=""):
        if not sys.stdin.isatty():
            return default
        v = input(f"{prompt}{f' [{default}]' if default else ''}: ").strip()
        return v or default

    title = args.title or ask("Title")
    if not title:
        sys.exit("A --title is required.")
    slug = args.slug or slugify(title)
    code = args.code or ask("Code (e.g. T9)")
    category = args.category or ask(f"Category {CATEGORIES}", CATEGORIES[0])
    family = args.family or ask("Family id", "temporal")
    severity = args.severity or ask(f"Severity {SEVERITIES}", "Medium")
    evidence = args.evidence or ask(f"Evidence {EVIDENCE}", "Moderate")
    harms = args.harms or ask("Harm vector ids (comma)", "time-attention")
    modes = args.modes or ask("Mode ids (comma)", "manipulative")
    tags = args.tags or ask("Tags (comma)", "")
    refs = args.refs or ask("Reference ids (comma)", "")

    def arr(s):
        return [x.strip() for x in s.split(",") if x.strip()]

    fm = {
        "title": title, "code": code, "category": category, "family": family,
        "severity": severity, "purpose": "both", "platforms": ["Mobile / F2P"], "evidenceLevel": evidence,
        "evidenceNote": "", "harmVectors": arr(harms), "modes": arr(modes),
        "tags": arr(tags), "aliases": [], "summary": "One-sentence operational definition.",
        "examples": [], "references": arr(refs), "related": [], "updated": "2026-06-23",
    }
    lines = ["---"]
    for k, v in fm.items():
        lines.append(f"{k}: {json.dumps(v)}")
    lines += [
        "---", "", "## How it works", "",
        "Describe the mechanism in two or three sentences.", "",
        "## Why it can be harmful", "",
        "Tie it to the harm vectors and the rubric in two or three sentences.", "",
    ]
    dest = PATTERNS / f"{slug}.mdx"
    if dest.exists() and not args.force:
        sys.exit(f"{dest} already exists (use --force to overwrite).")
    dest.write_text("\n".join(lines))
    print(f"{C_GRN}Created{C_END} {dest.relative_to(ROOT)}")
    print("Edit it, then run:  python scripts/content.py validate")


def cmd_validate(_args):
    fams = load_ids("families.json")
    harms = load_ids("harms.json")
    modes = load_ids("modes.json")
    refs = ref_ids()
    gloss_slugs = {f.stem for f in GLOSSARY.glob("*.mdx")}
    pat_slugs = {f.stem for f in PATTERNS.glob("*.mdx")}
    errors, warnings = [], []

    required = ["title", "code", "category", "family", "severity", "purpose",
                "evidenceLevel", "harmVectors", "modes", "tags", "summary", "references"]
    codes = {}
    for f in sorted(PATTERNS.glob("*.mdx")):
        d = parse_frontmatter(f.read_text())
        name = f.name
        for r in required:
            if d.get(r) in (None, ""):
                errors.append(f"{name}: missing required field '{r}'")
        if d.get("severity") not in SEVERITIES:
            errors.append(f"{name}: severity '{d.get('severity')}' not in {SEVERITIES}")
        if d.get("evidenceLevel") not in EVIDENCE:
            errors.append(f"{name}: evidenceLevel '{d.get('evidenceLevel')}' not in {EVIDENCE}")
        if d.get("purpose") not in ("gameplay", "business", "both"):
            errors.append(f"{name}: purpose '{d.get('purpose')}' not in gameplay/business/both")
        if d.get("family") not in fams:
            errors.append(f"{name}: family '{d.get('family')}' not in families.json")
        for h in d.get("harmVectors", []) or []:
            if h not in harms:
                errors.append(f"{name}: harmVector '{h}' not in harms.json")
        for m in d.get("modes", []) or []:
            if m not in modes:
                errors.append(f"{name}: mode '{m}' not in modes.json")
        for rid in d.get("references", []) or []:
            if rid not in refs:
                errors.append(f"{name}: reference '{rid}' not in references.csl.json")
        c = d.get("code")
        if c:
            codes.setdefault(c, []).append(name)

    for code, files in codes.items():
        if len(files) > 1:
            errors.append(f"duplicate code '{code}' in: {', '.join(files)}")

    for f in sorted(GLOSSARY.glob("*.mdx")):
        d = parse_frontmatter(f.read_text())
        for r in ("term", "short"):
            if not d.get(r):
                errors.append(f"glossary/{f.name}: missing '{r}'")
        for rid in d.get("references", []) or []:
            if rid not in refs:
                errors.append(f"glossary/{f.name}: reference '{rid}' not in references.csl.json")
        for sa in d.get("seeAlso", []) or []:
            if sa not in gloss_slugs and sa not in pat_slugs:
                warnings.append(f"glossary/{f.name}: seeAlso '{sa}' has no glossary or pattern entry")

    n_p = len(list(PATTERNS.glob("*.mdx")))
    n_g = len(list(GLOSSARY.glob("*.mdx")))
    for w in warnings:
        print(f"{C_YEL}warn{C_END}  {w}")
    for e in errors:
        print(f"{C_RED}error{C_END} {e}")
    print(f"\nChecked {n_p} patterns, {n_g} glossary entries against "
          f"{len(refs)} refs / {len(fams)} families / {len(harms)} harms / {len(modes)} modes.")
    if errors:
        print(f"{C_RED}FAILED: {len(errors)} error(s).{C_END}")
        sys.exit(1)
    print(f"{C_GRN}OK{C_END}{f' ({len(warnings)} warning(s))' if warnings else ''}.")


def main():
    ap = argparse.ArgumentParser(description="Deceptive Patterns content workflow")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list", help="list all patterns")
    n = sub.add_parser("new", help="scaffold a new pattern MDX")
    for opt in ["slug", "title", "code", "category", "family", "severity",
                "evidence", "harms", "modes", "tags", "refs"]:
        n.add_argument(f"--{opt}", default="")
    n.add_argument("--force", action="store_true")
    sub.add_parser("validate", help="validate all content")
    args = ap.parse_args()
    {"list": cmd_list, "new": cmd_new, "validate": cmd_validate}[args.cmd](args)


if __name__ == "__main__":
    main()
