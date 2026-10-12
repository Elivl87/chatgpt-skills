# source me: reuse the EP003 project's Hyperframes install (node_modules, ffmpeg/ffprobe shim, Chromium) - no second install
SHORT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SHORT_DIR/../hyperframes_ep003/env.sh"
