#!/usr/bin/env bash
# EP001 thumbnails v3: render the three scenes (one Chromium, 1920x1080) and finish them (1280x720 PNG, small JPGs,
# preview sheet) into ep/001/thumbnails/v3/. Deterministic: same inputs -> same pixels.
#   TMPD=<scratch dir> ./build.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="$(cd "$HERE/.." && pwd)"
TMPD="${TMPD:-$(mktemp -d)}"; mkdir -p "$TMPD"
node "$HERE/render.mjs" --jobs "v3_A:$TMPD/v3_A.png,v3_B:$TMPD/v3_B.png,v3_C:$TMPD/v3_C.png"
python3 "$HERE/finish.py" "$TMPD" "$OUT"
