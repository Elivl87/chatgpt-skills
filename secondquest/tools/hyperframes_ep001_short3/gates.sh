#!/usr/bin/env bash
# All gates for EP001 Short #3 (DESIGN_RUBRIC "Gate order" 2 + a 1/30 s sweep around every cut, title and the loop
# seam). Writes build/critic/ep001_short3_gates/. Exit 1 if any gate has an error.
set -uo pipefail
cd "$(dirname "$0")/../.."
source tools/hyperframes_ep003/env.sh
P=tools/hyperframes_ep001_short3/short
O=build/critic/ep001_short3_gates; mkdir -p "$O"
(cd tools/hyperframes_ep001_short3 && RES=1080 python3 build.py >/dev/null)
fail=0
echo "== hyperframes lint"; (cd $P && hyperframes lint 2>&1 | grep "error(s)" | tail -1) | tee "$O/lint.txt"; grep -q "0 error" "$O/lint.txt" || fail=1
echo "== frame_critic 0.25 s sweep"; python3 scripts/frame_critic.py $P --step 0.25 --lint --out "$O/sweep" | sed -n 3p || fail=1
# frame 0, every cut and the loop seam: 1/30 s
for w in 0:0.6 2.6:3.1 3.5:4.0 4.8:5.2 5.9:6.6 8.5:9.0 11.4:11.9 15.8:16.2 17.1:17.6 18.9:19.6 21.5:22.65; do
  a=${w%%:*}; b=${w##*:}
  echo "== frame_critic 1/30 s $a-$b"; python3 scripts/frame_critic.py $P --step 0.0333 --t0 $a --t1 $b --no-shots --out "$O/w_$a" | sed -n 3p || fail=1
done
echo "== sfx_audit"; python3 scripts/sfx_audit.py $P/assets/sfx_plan.json --mix $P/assets/narration.wav --kind short | sed -n 2p
python3 scripts/sfx_audit.py $P/assets/sfx_plan.json --mix $P/assets/narration.wav --kind short >/dev/null || fail=1
echo "GATES $([ $fail = 0 ] && echo PASS || echo FAIL)"
exit $fail
