#!/usr/bin/env python3
"""Assemble hook/index.html from src/index.template.html, inlining the registry components it names."""
from pathlib import Path
import re
HERE = Path(__file__).resolve().parent
src = (HERE / 'src/index.template.html').read_text()
comp = HERE / 'hook/compositions/components'
out = re.sub(r'<!--INCLUDE ([\w.-]+)-->', lambda m: (comp / m.group(1)).read_text(), src)
(HERE / 'hook/index.html').write_text(out)
print('wrote hook/index.html', len(out), 'bytes')
