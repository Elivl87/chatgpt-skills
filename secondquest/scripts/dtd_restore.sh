#!/usr/bin/env bash
# Dave the Diver: restore everything not in git in a fresh container (art, pixel sprites, props3d cast, plates, Kokoro,
# placeholder narration). Run from secondquest/:  bash scripts/dtd_restore.sh <scratch dir>
set -euo pipefail
S=${1:-/tmp/dtd}; mkdir -p "$S/kokoro"
for a in 628750961 652367306 655958405; do gh api -H "Accept: application/octet-stream" repos/Elivl87/chatgpt-skills/releases/assets/$a > "$S/$a.tar" & done
curl -sSL -o "$S/kokoro/kokoro-v1.0.int8.onnx" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx &
curl -sSL -o "$S/kokoro/voices-v1.0.bin" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin &
[ -f "$S/kokoro/kokoro-v1.0.onnx" ] || curl -sSL -o "$S/kokoro/kokoro-v1.0.onnx" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx &   # full model: the approved "Fenrir natural"
pip install -q opencv-python-headless numpy kokoro-onnx soundfile imageio-ffmpeg scipy librosa faster-whisper >/dev/null 2>&1 &
(command -v rubberband >/dev/null || (apt-get update -q && apt-get install -y -q rubberband-cli) >/dev/null 2>&1) &
wait
for a in 628750961 652367306 655958405; do tar -xf "$S/$a.tar"; rm "$S/$a.tar"; done
# 655958405 = archive-art-dtd-2026-10-19: DTD plates, pixel sprites, props3d cast + pink dolphin v3 (no re-render needed).
# Re-render only if the art changes: python3 tools/props3d/render.py dtd_cast / dtd_dolphin
[ -d node_modules/three ] || npm install --no-save >/dev/null 2>&1
KOKORO_VOICE=am_fenrir KOKORO_SPEED=0.92 KOKORO_PITCH=0 KOKORO_EQ=0 KOKORO_MODEL=kokoro-v1.0.onnx KOKORO_SPLIT=1 \
  nice -n 15 python3 scripts/ep003-placeholder-narration.py "$S/kokoro" davethediver | tail -1   # Producer 2026-10-20: "Fenrir natural"
echo "restore done: $(find public/art -type f | wc -l) art files"
