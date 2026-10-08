#!/bin/bash
# EP002 final 2K render (only with the Producer's approval): every block at QUALITY=final, then the join and the Short.
# Resumable: a block whose clip is already complete is skipped (scripts/animatic/clip_ok.py), so after a crash or a
# container restart just run it again. Light blocks go two at a time; the heavy ones (O, P, R, T, U) alone, or the
# container runs out of memory; anything that failed is retried alone at the end.
#   bash scripts/ep002-render-final.sh        # log: renders/logs/render_final.log (gitignored)
# For a new episode: copy it, change JOIN, PAIRS, HEAVY and the Short script.
cd "$(dirname "$0")/.."
export QUALITY=final
JOIN=scripts/ep002-join-animatic.py
mkdir -p renders/logs; LOG=renders/logs/render_final.log
run() { local s=$1; if python3 scripts/animatic/clip_ok.py $JOIN $s; then echo "$(date +%T) $s rc=0 skip(done)" >> $LOG; return 0; fi
        local t0=$(date +%s); python3 scripts/$s > renders/logs/$s.log 2>&1; local rc=$?
        echo "$(date +%T) $s rc=$rc $(( $(date +%s)-t0 ))s" >> $LOG; return $rc; }
echo "$(date +%T) start" >> $LOG
PAIRS=("ep002-cartridge-animatic.py ep002-blockB-animatic.py" "ep002-blockC-animatic.py ep002-blockD-animatic.py"
       "ep002-blockE-animatic.py ep002-blockF-B-animatic.py" "ep002-blockG-animatic.py ep002-blockH-animatic.py"
       "ep002-blockI-animatic.py ep002-blockJ-animatic.py" "ep002-blockK-animatic.py ep002-blockL-animatic.py"
       "ep002-blockM-animatic.py ep002-blockN-animatic.py" "ep002-blockQ-animatic.py ep002-blockS-A-animatic.py")
HEAVY="ep002-blockO-animatic.py ep002-blockP-animatic.py ep002-blockR-animatic.py ep002-blockT-animatic.py ep002-blockU-animatic.py"
for p in "${PAIRS[@]}"; do for s in $p; do run $s & done; wait; done
for s in $HEAVY; do run $s; done
for s in $(grep -o 'ep002-[^ ]*\.py rc=[1-9][0-9]*' $LOG | cut -d' ' -f1 | sort -u); do echo "$(date +%T) retry $s" >> $LOG; run $s; done
python3 $JOIN >> $LOG 2>&1; echo "$(date +%T) join rc=$?" >> $LOG
python3 scripts/ep002-short1-trailer.py >> $LOG 2>&1; echo "$(date +%T) short rc=$?" >> $LOG
echo "$(date +%T) DONE" >> $LOG
