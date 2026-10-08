#!/usr/bin/env bash
# Prepares public/ (not in git, regenerable). Nothing here spends credits.
#  - approved art from the SecondQuest branch + the bedroom plate from Higgsfield (download of an existing job, free);
#  - cut-outs get a deterministic alpha clean at render time (alpha < 128 -> 0, colour of transparent pixels zeroed) so the
#    ink-outline and shadow effects do not pick up the near-invisible halo; the source art is not modified;
#  - fonts, Bram's narration (EP002 l12-l16 window) and free sounds (engine synths + CC0 Kenney, see SOURCES.md);
#  - own synth sounds made here: room tone, CRT hum, whoosh, phone buzz, shutter.
set -euo pipefail
cd "$(dirname "$0")"
SRC=${1:-origin/claude/secondquest-pilot-hook-4yw8xj}
P=public; mkdir -p $P/art $P/fonts $P/sfx $P/audio
show() { git show "$SRC:secondquest/$1" > "$2"; }
for f in quest/ep002_costume/06a_kid_playing_seated pixie/ep002_costume/6b_kid_pointing pixie/ep002_costume/6c_kid_sitting quest/ep002_costume/03_young_back; do
  n=$(basename "$f"); show "docs/art_orders/$f.png" "$P/art/$n.raw.png"
  # (sized for the render: the kids are never shown wider than ~800 px at 1440p, so a 960 px copy keeps them crisp
  #  and makes the GPU effects ~4x cheaper; the young hero inside the TV keeps full size for the zoom into the screen)
  W=960; [ "$n" = 03_young_back ] && W=1360
  ffmpeg -v error -y -i "$P/art/$n.raw.png" -vf "scale=$W:-1:flags=lanczos,format=rgba,geq=r='if(lt(alpha(X,Y),128),0,r(X,Y))':g='if(lt(alpha(X,Y),128),0,g(X,Y))':b='if(lt(alpha(X,Y),128),0,b(X,Y))':a='if(lt(alpha(X,Y),128),0,255)'" "$P/art/$n.png"
  rm "$P/art/$n.raw.png"
done
show docs/art_orders/ep002_final/11_field.png $P/art/11_field.png
[ -s $P/art/quest_bedroom_morning.png ] || curl -sSf -o $P/art/quest_bedroom_morning.png \
  "https://d8j0ntlcm91z4.cloudfront.net/user_3K6M7x8kersP7O97RkOFxQEZ1tY/hf_20261002_025209_b690a476-2b5b-4417-ab08-94b05bd856d6.png"
show public/shared/brand/secondquest_wordmark.png $P/art/wordmark.png
ffmpeg -v error -y -f lavfi -i color=c=black:s=640x360 -frames:v 1 $P/art/black.png
ffmpeg -v error -y -f lavfi -i color=c=0xfbf7ee:s=800x600 -frames:v 1 $P/art/paper.png
cp ../../public/shared/fonts/{Anton-Regular,Inter-800,Inter-600}.woff2 $P/fonts/

# Bram: the exact window of this block (34.32 s -> 49.19 s), from the episode narration
show public/episodes/ep002/audio/narration.wav $P/audio/narration_full.wav
ffmpeg -v error -y -ss 34.32 -t 14.87 -i $P/audio/narration_full.wav -ar 48000 $P/audio/bram.wav && rm $P/audio/narration_full.wav

# free sounds already approved for the channel
show public/shared/sfx/fairy_shimmer.wav $P/sfx/fairy_shimmer.wav
show public/shared/sfx/fairy_flutter.wav $P/sfx/fairy_flutter.wav
show public/shared/sfx/tv_on.wav $P/sfx/tv_on.wav
for k in click_001 scratch_004 scratch_005 computerNoise_000; do show public/shared/sfx/cc0/kenney/$k.ogg $P/sfx/$k.ogg; done

# own synths
ff() { ffmpeg -v error -y -f lavfi -i "$1" -af "$2" -ar 48000 "$P/sfx/$3"; }
ff "anoisesrc=c=pink:a=0.5:d=16:seed=7" "lowpass=f=900,highpass=f=60,volume=0.05" room_tone.wav
ff "aevalsrc='0.5*sin(2*PI*60*t)+0.25*sin(2*PI*120*t)+0.06*sin(2*PI*7800*t)':d=16" "volume=0.08" crt_hum.wav
ff "anoisesrc=c=white:a=0.8:d=1.2:seed=3" "bandpass=f=900:w=1400,afade=t=in:d=0.5,afade=t=out:st=0.55:d=0.65,volume=0.9" whoosh.wav
ff "aevalsrc='if(lt(mod(t,0.5),0.32),0.6*sgn(sin(2*PI*170*t))*(0.6+0.4*sin(2*PI*31*t)),0)':d=1.1" "lowpass=f=1200,volume=0.35" phone_buzz.wav
ff "aevalsrc='0.9*exp(-90*t)*sin(2*PI*2400*t)+if(gt(t,0.06),0.7*exp(-60*(t-0.06))*(random(0)-0.5),0)+if(gt(t,0.12),0.6*exp(-80*(t-0.12))*sin(2*PI*1800*t),0)':d=0.5" "highpass=f=300,volume=0.8" shutter.wav
echo "prepared"
