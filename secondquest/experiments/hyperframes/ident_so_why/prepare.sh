#!/usr/bin/env bash
# Prepares assets/ (not in git, regenerable):
#  - secondquest_wordmark.png, copied from the engine's brand folder;
#  - sting.wav, our own synth sting for the "So, why?" identity beat (free, no samples): a soft shimmer on the
#    wordmark landing, then a two-note chime when the star twinkles in the "o" (t = 0.90 s). 48 kHz stereo, peak ~ -12 dBFS.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets
cp ../../../public/shared/brand/secondquest_wordmark.png assets/
ffmpeg -v error -y -f lavfi -i "aevalsrc='
 0.10*exp(-3.2*t)*sin(2*PI*t*(660+900*t))*(0.6+0.4*sin(2*PI*14*t))*min(1,t/0.03)
+0.05*exp(-2.5*t)*sin(2*PI*1320*t)*min(1,t/0.05)
+if(gte(t,0.90),0.16*exp(-3.6*(t-0.90))*(sin(2*PI*1318.5*(t-0.90))+0.35*sin(2*PI*2637*(t-0.90))),0)
+if(gte(t,1.02),0.13*exp(-2.8*(t-1.02))*(sin(2*PI*1975.5*(t-1.02))+0.30*sin(2*PI*3951*(t-1.02))),0)
+0.035*sin(PI*min(1,t/2.6))*sin(2*PI*329.6*t)
':s=48000:d=2.8" -af "afade=t=out:st=2.3:d=0.5,aecho=0.6:0.5:90|170:0.25|0.15,volume=3.6,pan=stereo|c0=c0|c1=c0" assets/sting.wav
