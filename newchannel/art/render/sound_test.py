"""Sound bed for art/test/style_test.mp4 (numpy only, reuses newchannel/engine/sound.py read-only).
Every cue comes from the page's events() (the IDM run): the wide shot's brake onsets play a falling marimba ladder
(the wave you hear is the wave you see), the close-up's engine hum follows the mascot's simulated speed, the stop gets a
thunk, the wordmark gets the channel sting on its three contacts. Mastered to -14 LUFS, TP <= -1.5 dBTP.
    python3 sound_test.py events.json out.wav
"""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "engine"))
import numpy as np  # noqa: E402
import sound as S   # noqa: E402

ev = json.load(open(sys.argv[1]))
out = sys.argv[2]
DUR = ev["duration"]
SR = S.SR
n = int(DUR * SR)
t = np.arange(n) / SR
cut1, cut2 = ev["cuts"]

music = S.Bus(n)
sfx = S.Bus(n)

# --- bed: warm pad in G, gentle swell; moves to the motif's chord for the wordmark
bed = np.zeros(n, np.float32)
p1 = S.pad(n, ("G3", "D4", "G4", "B4"), 0.06)
p2 = S.pad(n, ("C4", "E4", "G4", "D5"), 0.08)
w = np.clip((t - cut2 + 0.3) / 0.8, 0, 1)
bed = p1 * (1 - w) + p2 * w
bed *= np.clip(t / 1.2, 0, 1) * (1 - 0.45 * ((t > cut1) & (t < cut2))) * np.clip((DUR - 0.6 - t) / 2.5, 0, 1)
music.add(0, bed, 0.0, 0.5)

# --- air: wind + distant road rumble (wide shot louder, close-up closer/lower)
wind = S._bandnoise(n, 350, 1800, 11) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t)) * 0.18
rumble = S._bandnoise(n, 40, 260, 12) * 0.35
air = (wind + rumble * np.where(t < cut1, 0.8, 0.4)) * np.clip((cut2 + 0.2 - t) / 0.6, 0, 1) * np.clip(t / 0.5, 0, 1)
sfx.add(0, air.astype(np.float32), 0.0, 0.5)

# --- the wave: one marimba note per brake-light onset, pitch falls as the wave comes toward us
penta = [S.note(x) for x in ("A5", "G5", "E5", "D5", "B4", "A4", "G4", "E4", "D4", "B3", "A3", "G3")]
ons = sorted(ev["brakeOnsets"], key=lambda e: e["t"])
for k, e in enumerate(ons):
    f = penta[min(k, len(penta) - 1)]
    prox = np.clip(1 - e["dist"] / 300, 0.25, 1)
    sfx.add(e["t"], S.marimba(f, 0.9, 0.25), 0.25 - 0.05 * k, 0.32 * prox)
    sfx.add(e["t"], S.tick(3200, 3 + k), 0.2, 0.05 * prox)

# --- engine hum of the mascot's car, following the simulated speed (wide: far, close-up: near)
def speed_curve(pairs):
    a = np.array(pairs)
    return np.interp(t, a[:, 0], a[:, 1], left=np.nan, right=np.nan)
vw, vc = speed_curve(ev["wideSpeed"]), speed_curve(ev["closeupSpeed"])
v = np.where(t < cut1, vw, np.where(t < cut2, vc, np.nan))
v = np.nan_to_num(v, nan=0.0)
present = ((t >= cut1) & (t < cut2)).astype(np.float32)
f0 = 62 + 4.2 * v                                        # idle ~62 Hz, ~115 Hz at 12.6 m/s
ph = 2 * np.pi * np.cumsum(f0) / SR
engine = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph + 1) + 0.12 * np.sin(5 * ph)) * (0.35 + 0.65 * np.clip(v / 12, 0, 1))
engine *= present * np.clip((t - cut1) / 0.05, 0, 1)
sfx.add(0, engine.astype(np.float32), -0.1, 0.22)

# --- cut whoosh, close-up events
sfx.add(cut1 - 0.28, S.whoosh(0.5, 400, 3500, 21), 0.3, 0.5)
c = ev["closeup"]
sfx.add(c["leaderBrake"], S.glide(2300, 2050, 0.5, 0.35, 0.1), 0.7, 0.05)        # distant squeal, the car ahead
sfx.add(c["leaderBrake"] + 0.14, S.pop(950), -0.1, 0.30)                          # the mascot notices
sfx.add(c["mascotBrake"], S.glide(1900, 1600, 0.8, 0.5, 0.1), -0.1, 0.06)        # its own tyres
sfx.add(c["mascotStop"], S.thunk(4, 150, 58), 0.0, 0.40)
sfx.add(c["mascotStop"] + 0.18, S.tick(1800, 9), 0.0, 0.12)
sfx.add(c["mascotStop"] + 0.2, S.glide(240, 160, 0.38, 0.22, 0.35), -0.1, 0.22)  # "hmph"
for i in range(3):
    sfx.add(c["grumpy"] + i * 0.22, S.whoosh(0.18, 1500, 5000, 30 + i), -0.1, 0.18)
# --- transition + wordmark sting on the three contacts
sfx.add(cut2 - 0.25, S.whoosh(0.6, 300, 2500, 41), 0.0, 0.35)
wm = ev["wordmark"]
S.sting_sfx(sfx, [{"t": wm["c1"], "kind": "bounce"}, {"t": wm["c2"], "kind": "bounce"}, {"t": wm["land"], "kind": "land"}], drop_t=wm["drop"], gain=1.0)

mix = S.mix(voice=None, music=music.buf, sfx=sfx.buf, n=n)
m = S.master(mix, out, target=-14.0, ceiling=-1.5, fade_in=0.02, fade_out=0.5)
print(json.dumps(m))
