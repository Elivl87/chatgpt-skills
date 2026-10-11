# source me: local ffmpeg/ffprobe shim + the pre-installed Chromium headless shell, no telemetry, no skill writes
HF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$HF_DIR/.bin"
ln -sf "$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')" "$HF_DIR/.bin/ffmpeg"
ln -sf ../ffprobe_shim.py "$HF_DIR/.bin/ffprobe"
export PATH="$HF_DIR/.bin:$HF_DIR/node_modules/.bin:$PATH"
export HYPERFRAMES_FFMPEG_PATH="$HF_DIR/.bin/ffmpeg" HYPERFRAMES_FFPROBE_PATH="$HF_DIR/.bin/ffprobe"
export HYPERFRAMES_BROWSER_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}/chromium_headless_shell-1194/chrome-linux/headless_shell"
export HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
