#!/usr/bin/env bash
# Re-extracts src/relics.ts (helpers + triforce, ocarina, masterSword) from the engine's prop scene, unchanged.
set -euo pipefail
cd "$(dirname "$0")"
SRC=${1:-origin/claude/secondquest-pilot-hook-4yw8xj}
f=$(mktemp); git show "$SRC:secondquest/tools/props3d/scene.ts" > "$f"
{ echo "// AUTO-EXTRACTED from tools/props3d/scene.ts ($SRC): helpers + triforce, ocarina, masterSword."
  echo "// Approved prop geometry, unchanged. Regenerate with ./extract_relics.sh"
  sed -n '1,89p' "$f" | sed 's/^const P = window.PARAMS;/const P = (window as any).PARAMS ?? { props: [], width: 0, height: 0, shots: [] };/'
  sed -n '279,533p' "$f"
  echo "export { triforce, ocarina, masterSword, toon, ids };"; } > src/relics.ts
rm "$f"
