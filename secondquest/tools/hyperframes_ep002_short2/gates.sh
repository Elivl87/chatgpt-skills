#!/usr/bin/env bash
# All gates for EP002 Short #2 (DESIGN_RUBRIC "Gate order" 2 + the critic's v2 rule: a 1/30 s sweep around every title
# entrance/exit and every cut). Run from anywhere; writes build/critic/short2_gates/. Exit 1 if any gate has an error.
set -uo pipefail
cd "$(dirname "$0")/../.."
source tools/hyperframes_ep003/env.sh
P=tools/hyperframes_ep002_short2/short
O=build/critic/short2_gates; mkdir -p "$O"
(cd tools/hyperframes_ep002_short2 && RES=1080 python3 build.py >/dev/null)
fail=0
echo "== hyperframes lint"; (cd $P && hyperframes lint 2>&1 | tail -1) | tee "$O/lint.txt"; grep -q "^◇  0 error" "$O/lint.txt" || fail=1
echo "== frame_critic 0.25 s sweep"; python3 scripts/frame_critic.py $P --step 0.25 --lint --out "$O/sweep" | sed -n 3p || fail=1
# titles (in/out), the l60 title, the wordmark + card, and every cut: 1/30 s
for w in 0:2.0 1.8:3.9 4.4:5.6 8.4:11.3 10.9:14.6 15.0:15.4 17.5:20.4 20.3:22.64; do
  a=${w%%:*}; b=${w##*:}
  echo "== frame_critic 1/30 s $a-$b"; python3 scripts/frame_critic.py $P --step 0.0333 --t0 $a --t1 $b --no-shots --out "$O/w_$a" | sed -n 3p || fail=1
done
echo "== sfx_audit"; python3 scripts/sfx_audit.py $P/assets/sfx_plan.json --mix $P/assets/narration.wav --kind short | sed -n 2p
python3 scripts/sfx_audit.py $P/assets/sfx_plan.json --mix $P/assets/narration.wav --kind short >/dev/null || fail=1
echo "== hyperframes check"; (cd $P && hyperframes check . --json --at-transitions > "../../../$O/check.json" 2>/dev/null) || fail=1
python3 -c "
import json;d=json.load(open('$O/check.json'));print('check ok',d['ok'],' '.join(f\"{k}:{d[k].get('errorCount')}E/{d[k].get('warningCount')}W\" for k in ['lint','runtime','layout','motion','contrast']))"
echo "GATES $([ $fail = 0 ] && echo PASS || echo FAIL)"
exit $fail
