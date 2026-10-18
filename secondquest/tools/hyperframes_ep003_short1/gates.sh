#!/usr/bin/env bash
# All gates for EP003 Short #1 (DESIGN_RUBRIC "Gate order" 2 + a 1/30 s sweep around every cut, title and the loop
# seam). Writes build/critic/ep003_short1_gates/. Exit 1 if any gate has an error.
set -uo pipefail
cd "$(dirname "$0")/../.."
source tools/hyperframes_ep003/env.sh
P=tools/hyperframes_ep003_short1/short
O=build/critic/ep003_short1_gates; mkdir -p "$O"
(cd tools/hyperframes_ep003_short1 && RES=1080 python3 build.py >/dev/null)
fail=0
echo "== hyperframes lint"; (cd $P && hyperframes lint 2>&1 | tail -1) | tee "$O/lint.txt"; grep -q "0 error" "$O/lint.txt" || fail=1
echo "== frame_critic 0.25 s sweep"; python3 scripts/frame_critic.py $P --step 0.25 --lint --out "$O/sweep" | sed -n 3p || fail=1
# frame 0, every cut (2.62 chat, 8.85 side-eye, 11.8 wide, 14.1 punch-in, 16.4 card, 19.0 loop seam) and the end: 1/30 s
for w in 0:0.6 2.4:3.0 8.6:9.2 11.5:12.1 13.9:14.4 16.2:17.6 18.8:20.0; do
  a=${w%%:*}; b=${w##*:}
  echo "== frame_critic 1/30 s $a-$b"; python3 scripts/frame_critic.py $P --step 0.0333 --t0 $a --t1 $b --no-shots --out "$O/w_$a" | sed -n 3p || fail=1
done
echo "== sfx_audit"; python3 scripts/sfx_audit.py $P/assets/sfx_plan.json --mix $P/assets/narration.wav --kind short | sed -n 2p
python3 scripts/sfx_audit.py $P/assets/sfx_plan.json --mix $P/assets/narration.wav --kind short >/dev/null || fail=1
echo "GATES $([ $fail = 0 ] && echo PASS || echo FAIL)"
exit $fail
