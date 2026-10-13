#!/usr/bin/env bash
# Voice venv for engine/voice.py (Kokoro-82M + faster-whisper, CPU only). Weights download into $TTD_VENV/../hf,
# never into the repo. Python 3.12 (spaCy does not build on 3.13). ~1.6 GB with torch CPU + ~0.8 GB of models.
#   bash engine/setup_voice_env.sh            # default: /tmp/claude-0/ttdenv/venv
#   TTD_VENV=/somewhere/venv bash engine/setup_voice_env.sh
set -euo pipefail
VENV="${TTD_VENV:-/tmp/claude-0/ttdenv/venv}"
mkdir -p "$(dirname "$VENV")"
uv venv -p 3.12 "$VENV"
uv pip install -p "$VENV/bin/python" --index-url https://download.pytorch.org/whl/cpu \
  --extra-index-url https://pypi.org/simple torch
uv pip install -p "$VENV/bin/python" "kokoro==0.9.4" "misaki[en]==0.9.4" faster-whisper soundfile scipy pyloudnorm pip
"$VENV/bin/python" -m spacy download en_core_web_sm
echo "ok: $VENV  (run: OMP_NUM_THREADS=2 $VENV/bin/python engine/voice.py --help)"
