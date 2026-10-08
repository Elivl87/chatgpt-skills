#!/usr/bin/env python3
"""Exit 0 if a block's clip at the current QUALITY exists and is a complete mp4 (makes the final render resumable).

  python3 scripts/animatic/clip_ok.py <join script> <block script>
  e.g. python3 scripts/animatic/clip_ok.py scripts/ep002-join-animatic.py ep002-blockB-animatic.py
"""
import importlib.util, re, subprocess, sys
sys.path.insert(0, 'scripts'); sys.path.insert(0, 'scripts/animatic')
sp = importlib.util.spec_from_file_location('j', sys.argv[1]); j = importlib.util.module_from_spec(sp); sp.loader.exec_module(j)
c = j.clip_of(sys.argv[2])
if not c.exists():
    sys.exit(1)
e = subprocess.run([j.FF, '-i', str(c)], capture_output=True, text=True).stderr
sys.exit(0 if re.search(r'Duration: \d', e) and 'moov atom not found' not in e else 1)
