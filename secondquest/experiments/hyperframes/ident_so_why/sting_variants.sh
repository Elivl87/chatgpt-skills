#!/usr/bin/env bash
# Three alternative stings for the "So, why?" identity beat (own synths, free). t = 0 is the logo reveal ("why?"),
# t = 0.90 s is the star twinkle in the "o". Output: assets/sting_A.wav, sting_B.wav, sting_C.wav (48 kHz stereo).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets
# pluck(f, t0): plucked note (fundamental + 2 harmonics, fast decay) starting at t0
pl() { echo "if(gte(t,$2),exp(-5*(t-$2))*(sin(2*PI*$1*(t-$2))+0.5*sin(4*PI*$1*(t-$2))*exp(-6*(t-$2))+0.25*sin(6*PI*$1*(t-$2))*exp(-9*(t-$2))),0)"; }
# bell(f, t0, decay): metallic bell (inharmonic partials)
bl() { echo "if(gte(t,$2),exp(-$3*(t-$2))*(sin(2*PI*$1*(t-$2))+0.6*sin(2*PI*$1*2.76*(t-$2))*exp(-3*(t-$2))+0.35*sin(2*PI*$1*5.40*(t-$2))*exp(-6*(t-$2))),0)"; }
# sq(f, t0, len): soft square-wave note
sq() { echo "if(between(t,$2,$2+$3),0.5*sgn(sin(2*PI*$1*(t-$2)))*exp(-2.5*(t-$2))*min(1,(t-$2)/0.005),0)"; }

render() { ffmpeg -v error -y -f lavfi -i "aevalsrc='$2':s=48000:d=2.8" \
  -af "afade=t=out:st=2.2:d=0.6,$3,pan=stereo|c0=c0|c1=c0" "assets/sting_$1.raw.wav"
  # same peak for every variant: -7 dBFS (Bram peaks around -4 dBFS in EP002)
  local pk; pk=$(ffmpeg -i "assets/sting_$1.raw.wav" -af volumedetect -f null - 2>&1 | grep -oE "max_volume: [-0-9.]+" | grep -oE "[-0-9.]+$")
  ffmpeg -v error -y -i "assets/sting_$1.raw.wav" -af "volume=$(python3 -c "print(-7-($pk))")dB" "assets/sting_$1.wav" && rm "assets/sting_$1.raw.wav"; }

# A "Mágico": rising harp arpeggio while the logo reveals (E5 G#5 B5 E6), then a sparkle bell on the star.
render A "0.30*($(pl 659.3 0.00)+$(pl 830.6 0.07)+$(pl 987.8 0.14)+$(pl 1318.5 0.21)) \
+0.28*$(bl 2637 0.90 3.0)+0.18*$(bl 3520 0.98 3.5) \
+0.05*exp(-3*t)*sin(2*PI*t*(1500+2500*t))" "aecho=0.7:0.6:120|240:0.30|0.18,volume=1.6"

# B "Firma": deep cinematic hit under the reveal (sub thump + air), then one clean bright bell on the star.
render B "0.85*exp(-7*t)*sin(2*PI*(48*t+30*(1-exp(-12*t))/12)) \
+0.10*exp(-9*t)*(random(0)-0.5) \
+0.40*$(bl 1760 0.90 2.2)" "lowshelf=g=3:f=90,aecho=0.6:0.5:180:0.25,volume=1.4"

# C "Juego": original chiptune flourish (square waves, C6 E6 G6 C7 rising fast) and a pixel 'ping' on the star.
render C "0.30*($(sq 1046.5 0.00 0.09)+$(sq 1318.5 0.08 0.09)+$(sq 1568 0.16 0.09)+$(sq 2093 0.24 0.35)) \
+0.30*$(sq 3136 0.90 0.06)+0.24*$(sq 4186 0.96 0.25)" "lowpass=f=7000,aecho=0.5:0.4:90:0.2,volume=1.2"

for v in A B C; do printf "sting_%s peak: " $v; ffmpeg -i "assets/sting_$v.wav" -af volumedetect -f null - 2>&1 | grep -oE 'max_volume: [-0-9.]+ dB'; done
