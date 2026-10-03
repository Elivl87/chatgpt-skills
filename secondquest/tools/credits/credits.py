#!/usr/bin/env python3
"""Credit ledger + prompt preflight (phase 0.7). CLAUDE.md: quote every Higgsfield spend and get the
Producer's explicit approval before generating. This makes that rule a record, not a memory.

  npm run credits -- lint  --prompt-file p.txt [--asset character|prop|background] [--refs 2] [--outfit default|costume] [--transparent]
  npm run credits -- quote --ep EP002 --item "Hyrule field plate" --credits 1 --model gpt_image_2_5 [lint flags]
  npm run credits -- approve Q007 --quote "Apruebo el arte por 9 créditos"     (the Producer's own words)
  npm run credits -- spend   Q007 --actual 1 --jobs <id>[,<id>] --balance 98.25
  npm run credits -- cancel  Q007 --reason "..."
  npm run credits -- report  [--ep EP002]

`quote` runs the prompt lint and refuses to record a quote that fails it. `spend` refuses an entry that was
never approved, and flags when the actual cost exceeds the quote. Ledger: docs/credits/ledger.json.
"""
import argparse, datetime, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LEDGER = ROOT / 'docs/credits/ledger.json'
QUEST_ELEMENT = '89051d04-514d-404a-bcff-7dbe6347eb6f'  # Higgsfield reference element Quest_v1 (default outfit)
QUEST_REFS = ['ab2219a6-ee5c-4c3e-bb8e-10f4866781b2']  # f42c30bd shows the FARMING outfit (brown boots): never for the default outfit
IDENTITY = ['quest_v1', 'dark brown curly hair', 'freckles', 'bold ink outlines']
DEFAULT_OUTFIT = ['red hoodie', 'blue denim jeans', 'red canvas sneakers']
# option C (docs/ep002/PRODUCER_DECISIONS.md): evoke, never replicate third-party characters or logos
# characters and brands: never named (blocks); places and objects may be more recognisable under option C (warns)
THIRD_PARTY = ['link', 'zelda', 'navi', 'ganondorf', 'epona', 'saria', 'nintendo', 'mario', 'pokemon', 'pikachu']
THIRD_PARTY_PLACES = ['hyrule', 'triforce', 'master sword', 'temple of time', 'deku tree', 'kokiri']
SCENE_WORDS = ['landscape', 'full scene', 'room interior', 'background scenery', 'sky with', 'horizon']


def load():
    return json.loads(LEDGER.read_text()) if LEDGER.exists() else {'notes': '', 'entries': []}


def save(d):
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    LEDGER.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n')


def lint(prompt, asset=None, refs=0, outfit='default', transparent=False):
    """Return (errors, warnings) for a generation prompt."""
    p = prompt.lower()
    errors, warns = [], []
    shows_quest = 'quest' in p
    if shows_quest:
        for k in IDENTITY:
            if k not in p:
                errors.append(f'Quest identity block incomplete: missing "{k}" (QUEST_V1_PROMPT_SPEC §1)')
        if outfit == 'default':
            for k in DEFAULT_OUTFIT:
                if k not in p:
                    errors.append(f'default outfit incomplete: missing "{k}"')
        if refs < 1 and QUEST_ELEMENT not in p:
            errors.append(f'use the Quest_v1 reference element (<<<{QUEST_ELEMENT}>>> in the prompt) or attach job ab2219a6 (--refs 1)')
        if 'f42c30bd' in p and outfit == 'default':
            errors.append('f42c30bd is the farming outfit (brown boots): never use it for the default outfit')
        if any(w in p for w in ('full body', 'full-body', 'standing', 'walking', 'feet')) and outfit == 'default' and 'red sneakers are visible' not in p:
            warns.append('full-body shot: add "his RED sneakers are visible"')
    for name in THIRD_PARTY:
        if re.search(rf'\b{re.escape(name)}\b', p):
            errors.append(f'third-party name "{name}" in the prompt: option C evokes, never replicates — describe the design instead')
    for name in THIRD_PARTY_PLACES:
        if re.search(rf'\b{re.escape(name)}\b', p):
            warns.append(f'"{name}" named: option C allows recognisable places/objects, but describe them so the model does not copy official art')
    if re.search(r'\blogos?\b', p) and not re.search(r'\bno logos?\b', p):
        errors.append('the prompt asks for a logo')
    if asset in ('character', 'prop'):
        if not transparent:
            errors.append(f'{asset}: generate with background "transparent" (no baked white/checkerboard backgrounds)')
        if asset == 'prop' and any(w in p for w in SCENE_WORDS):
            errors.append('prop prompt describes a scene: props must be a single isolated object')
    return errors, warns


def next_id(d):
    return f"Q{len(d['entries']) + 1:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['lint', 'quote', 'approve', 'spend', 'cancel', 'report'])
    ap.add_argument('id', nargs='?')
    for a in ('--ep', '--item', '--model', '--prompt-file', '--asset', '--outfit', '--quote', '--jobs', '--reason'):
        ap.add_argument(a)
    ap.add_argument('--credits', type=float)
    ap.add_argument('--actual', type=float)
    ap.add_argument('--balance', type=float)
    ap.add_argument('--refs', type=int, default=0)
    ap.add_argument('--transparent', action='store_true')
    a = ap.parse_args()
    d = load()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    find = lambda i: next((e for e in d['entries'] if e['id'] == i), None) or sys.exit(f'unknown entry {i}')

    if a.cmd in ('lint', 'quote'):
        prompt = Path(a.prompt_file).read_text() if a.prompt_file else ''
        errors, warns = lint(prompt, a.asset, a.refs, a.outfit or 'default', a.transparent) if prompt else ([], [])
        for w in warns:
            print(f'⚠ {w}')
        for e in errors:
            print(f'✖ {e}')
        if errors:
            sys.exit(1)
        if a.cmd == 'lint':
            print('✔ prompt passes'); return
        if a.credits is None or not a.ep or not a.item:
            sys.exit('quote needs --ep, --item and --credits')
        e = {'id': next_id(d), 'episode': a.ep, 'item': a.item, 'model': a.model, 'quoted': a.credits, 'status': 'quoted', 'quotedAt': now,
             'prompt': prompt or None}
        d['entries'].append(e); save(d)
        print(f"{e['id']} quoted: {a.item} — {a.credits} credits (needs the Producer's explicit approval before generating)")
    elif a.cmd == 'approve':
        e = find(a.id)
        if not a.quote:
            sys.exit('approve needs --quote with the Producer\'s own words')
        e.update(status='approved', approvedAt=now, approval=a.quote); save(d)
        print(f"{e['id']} approved: \"{a.quote}\"")
    elif a.cmd == 'spend':
        e = find(a.id)
        if e['status'] != 'approved':
            sys.exit(f"{e['id']} is {e['status']}: never generate without the Producer's approval")
        e.update(status='spent', spentAt=now, actual=a.actual, jobs=(a.jobs or '').split(',') if a.jobs else [], balanceAfter=a.balance); save(d)
        over = (a.actual or 0) - e['quoted']
        print(f"{e['id']} spent {a.actual} (quoted {e['quoted']})" + (f'  ⚠ {over:+.2f} over the quote: tell the Producer' if over > 1e-9 else ''))
    elif a.cmd == 'cancel':
        e = find(a.id); e.update(status='cancelled', cancelledAt=now, reason=a.reason); save(d); print(f"{e['id']} cancelled")
    else:
        rows = [e for e in d['entries'] if not a.ep or e['episode'] == a.ep]
        by = {}
        for e in rows:
            s = by.setdefault(e['episode'], {'spent': 0.0, 'approved_pending': 0.0, 'quoted_pending': 0.0})
            if e['status'] == 'spent':
                s['spent'] += e.get('actual') or 0
            elif e['status'] == 'approved':
                s['approved_pending'] += e['quoted']
            elif e['status'] == 'quoted':
                s['quoted_pending'] += e['quoted']
        for ep, s in by.items():
            print(f"{ep:8s} spent {s['spent']:7.2f}   approved-not-generated {s['approved_pending']:6.2f}   awaiting approval {s['quoted_pending']:6.2f}")
        last = next((e['balanceAfter'] for e in reversed(d['entries']) if e.get('balanceAfter') is not None), None)
        if last is not None:
            print(f'last recorded balance: {last}')


if __name__ == '__main__':
    main()
