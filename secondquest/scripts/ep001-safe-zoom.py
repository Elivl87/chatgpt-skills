#!/usr/bin/env python3
"""Tune per-scene camera damping until no asset exceeds safe_zoom (data only).
Runs the rewire + engine validator, damps flagged scenes by 0.85 per round."""
import json, re, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
FAC = ROOT / 'episodes/ep001full/camera_safe_zoom_factors.json'
fac = json.loads(FAC.read_text()) if FAC.exists() else {}
for rnd in range(12):
    subprocess.run(['python3', 'scripts/ep001-rewire.py'], cwd=ROOT, check=True, capture_output=True)
    out = subprocess.run(['npx', 'tsx', 'scripts/validate.ts', 'ep001full'], cwd=ROOT, capture_output=True, text=True).stdout
    flagged = sorted(set(re.findall(r'full:(\S+): scene zooms', out)))
    print(f'round {rnd}: {len(flagged)} scenes over safe_zoom', flagged)
    if not flagged: break
    for sid in flagged:
        fac[sid] = round(fac.get(sid, 1.0) * 0.85, 4)
    FAC.write_text(json.dumps(fac, indent=2, sort_keys=True) + '\n')
print(json.dumps(fac))
