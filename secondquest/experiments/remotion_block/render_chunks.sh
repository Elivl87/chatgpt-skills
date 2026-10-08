#!/usr/bin/env bash
# Robust full render: 48-frame silent chunks (2 tabs each, retried up to 3 times), audio rendered once, then joined.
set -uo pipefail
cd "$(dirname "$0")"
mkdir -p out/chunks
TOTAL=$(node -e "console.log(Math.round(14.87*24))")
t0=$(date +%s)
for ((a=0; a<TOTAL; a+=48)); do
  b=$((a+47)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  out=$(printf "out/chunks/c%04d.mp4" $a)
  [ -s "$out" ] && continue
  for try in 1 2 3; do
    timeout 1800 node render.mjs chunk $a $b "$out" > out/chunks/log_$a.txt 2>&1 && break
    pkill -f headless_shell; rm -f "$out"; echo "chunk $a failed (try $try)"
  done
  [ -s "$out" ] || { echo "chunk $a gave up"; exit 1; }
  echo "chunk $a-$b done ($(( $(date +%s) - t0 )) s)"
done
timeout 900 node render.mjs audio > out/chunks/log_audio.txt 2>&1 || { echo "audio failed"; exit 1; }
ls out/chunks/c*.mp4 | sed "s/^/file '/; s/$/'/; s#file 'out/chunks/#file '#" > out/chunks/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i out/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/remotion_block_1440p.mp4
echo "rendered in $(( $(date +%s) - t0 )) s"
