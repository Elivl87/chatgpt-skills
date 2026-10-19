#!/usr/bin/env bash
# Dave the Diver: restore everything not in git in a fresh container (art, pixel sprites, props3d cast, plates, Kokoro,
# placeholder narration). Run from secondquest/:  bash scripts/dtd_restore.sh <scratch dir>
set -euo pipefail
S=${1:-/tmp/dtd}; mkdir -p "$S/kokoro"
for a in 628750961 652367306; do gh api -H "Accept: application/octet-stream" repos/Elivl87/chatgpt-skills/releases/assets/$a > "$S/$a.tar" & done
curl -sSL -o "$S/kokoro/kokoro-v1.0.int8.onnx" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx &
curl -sSL -o "$S/kokoro/voices-v1.0.bin" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin &
pip install -q opencv-python-headless numpy kokoro-onnx soundfile imageio-ffmpeg scipy librosa faster-whisper >/dev/null 2>&1 &
(command -v rubberband >/dev/null || (apt-get update -q && apt-get install -y -q rubberband-cli) >/dev/null 2>&1) &
wait
for a in 628750961 652367306; do tar -xf "$S/$a.tar"; rm "$S/$a.tar"; done
O=public/art/davethediver/pixel; mkdir -p $O
for f in docs/art_orders/davethediver/results/*.png; do b=$(basename "$f"); case $b in p06*|p07*|p08*) h=330;; *) h=150;; esac
  python3 tools/pixel/pixelate.py "$f" "$O/$b" --h $h >/dev/null; done
P=public/art/davethediver/plates; mkdir -p $P; U=https://d8j0ntlcm91z4.cloudfront.net/user_3K6M7x8kersP7O97RkOFxQEZ1tY
curl -sSL -o $P/bar_interior_night.png $U/hf_20261019_031107_d20c7c99-8d3f-4641-81e0-54747ba8c1db.png
curl -sSL -o $P/bay_exterior_dusk.png $U/hf_20261019_031107_e3404c31-fa87-47a0-b6b7-1493b464b658.png
[ -d node_modules/three ] || npm install --no-save >/dev/null 2>&1
python3 tools/props3d/render.py dtd_cast
nice -n 15 python3 scripts/ep003-placeholder-narration.py "$S/kokoro" davethediver | tail -1
echo "restore done: $(find public/art -type f | wc -l) art files"
