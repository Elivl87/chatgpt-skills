#!/usr/bin/env bash
# Render several EP003 blocks one after another (CPU is shared). Usage: ./render_queue.sh G C D
cd "$(dirname "$0")"
for b in "$@"; do
  echo "== block $b $(date +%T)"
  ./render_block.sh "$b" --workers 4 > "renders/log_block$b.txt" 2>&1 && echo "ok $b" || echo "FAILED $b"
done
