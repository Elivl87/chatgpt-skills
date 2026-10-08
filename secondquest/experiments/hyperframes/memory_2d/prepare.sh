#!/usr/bin/env bash
# Prepares assets/ (not in git): fonts from the engine, approved art from the SecondQuest branch, and the bedroom plate
# (core.bg.quest_bedroom_morning, Higgsfield job b690a476-2b5b-4417-ab08-94b05bd856d6; downloading it costs no credits).
set -euo pipefail
cd "$(dirname "$0")"
SRC=${1:-origin/claude/secondquest-pilot-hook-4yw8xj}
mkdir -p assets/fonts assets/art
cp ../../../public/shared/fonts/{Anton-Regular,Inter-800,Inter-600}.woff2 assets/fonts/
for f in quest/ep002_costume/06a_kid_playing_seated pixie/ep002_costume/6b_kid_pointing pixie/ep002_costume/6c_kid_sitting \
         ep002_final/11_field quest/ep002_costume/03_young_back; do
  git show "$SRC:secondquest/docs/art_orders/$f.png" > "assets/art/$(basename "$f").png"
done
[ -s assets/art/quest_bedroom_morning.png ] || curl -sSf -o assets/art/quest_bedroom_morning.png \
  "https://d8j0ntlcm91z4.cloudfront.net/user_3K6M7x8kersP7O97RkOFxQEZ1tY/hf_20261002_025209_b690a476-2b5b-4417-ab08-94b05bd856d6.png"
