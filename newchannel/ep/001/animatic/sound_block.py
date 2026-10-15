"""Temporary sound bed for an animatic block (numpy only, engine/sound.py read-only): the real narration cut for the
block's range + ambience segments + one-shot cues, every time coming from the page's events() (word- and sim-keyed).
The final mix comes later; this bed only has to make the cut readable. Mastered to -14 LUFS, TP <= -1.5 dBTP.

    python3 sound_block.py events.json narration_es.wav out.wav
"""
import json
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "engine"))
import numpy as np  # noqa: E402
import sound as S   # noqa: E402

ev = json.load(open(sys.argv[1]))
nar_path, out = sys.argv[2], sys.argv[3]
SR = S.SR
DUR = ev["duration"]
n = int(round(DUR * SR))
t = np.arange(n) / SR
t0 = ev["t0"]

# ---- narration: the block's range of the full track
nar = S.load_audio(nar_path)
a, b = int(round(t0 * SR)), int(round(t0 * SR)) + n
voice = np.zeros((n, 2), np.float32)
seg = nar[a:b]
voice[: len(seg)] = seg

music, sfx = S.Bus(n), S.Bus(n)


def win(t0_, t1_, fi=0.3, fo=0.3):
    return (np.clip((t - t0_) / max(fi, 1e-3), 0, 1) * np.clip((t1_ - t) / max(fo, 1e-3), 0, 1)).astype(np.float32)


silence = [(x["t0"], x["t1"]) for x in ev["ambience"] if x["kind"] == "silence"]
for amb in ev["ambience"]:
    k, a0, a1 = amb["kind"], amb["t0"], amb["t1"]
    if k == "music_hook":     # warm pad + a soft pulse; cut dead at the end (fo 0.03)
        p = S.pad(n, ("G3", "D4", "G4", "B4"), 0.06) * win(a0, a1, 1.0, 0.03)
        pulse = np.zeros(n, np.float32)
        for bt in np.arange(a0 + 0.2, a1, 0.5):
            music.add(bt, S.pluck(S.note("G2" if int(bt * 2) % 4 else "D3"), 0.4, 0.12, 0.2), 0.0, 0.25 * float(np.clip((a1 - bt) / 0.2, 0, 1)))
        music.add(0, p, 0.0, 0.6)
    elif k == "dusk_pad":
        music.add(0, S.pad(n, ("C4", "E4", "G4", "D5"), 0.08) * win(a0, a1, 0.4, 0.5), 0.0, 0.55)
    elif k == "wind":
        w = S._bandnoise(n, 350, 1800, 11) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t)) * 0.16 * win(a0, a1, 0.3, 0.4)
        sfx.add(0, w.astype(np.float32), 0.0, 0.5)
    elif k == "road":
        r = S._bandnoise(n, 40, 260, 12) * 0.3 * win(a0, a1, 0.3, 0.6)
        sfx.add(0, r.astype(np.float32), 0.0, 0.5)
    elif k == "crickets":
        c = np.zeros(n, np.float32)
        rng = np.random.default_rng(5)
        for ct in np.arange(a0, a1, 0.17):
            if rng.random() < 0.8:
                ch = S.glide(4300, 4200, 0.05, 0.02, 0.0)
                for r_ in range(3):
                    i0 = int((ct + r_ * 0.035) * SR)
                    if i0 + len(ch) < n:
                        c[i0:i0 + len(ch)] += ch * 0.5
        sfx.add(0, c * win(a0, a1, 0.4, 0.4), 0.2, 0.35)
    elif k == "field_birds":
        rng = np.random.default_rng(7)
        for bt in np.arange(a0 + 0.5, a1 - 0.5, 1.7):
            if rng.random() < 0.7:
                f0 = 2800 + rng.random() * 1200
                sfx.add(bt + rng.random() * 0.6, S.glide(f0, f0 * 1.25, 0.08, 0.05, 0.1), rng.random() - 0.5, 0.08)
                sfx.add(bt + 0.14, S.glide(f0 * 1.2, f0, 0.07, 0.05, 0.1), rng.random() - 0.5, 0.06)
    elif k == "wind_grass":
        w = S._bandnoise(n, 500, 2500, 13) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t)) * 0.12 * win(a0, a1, 0.3, 0.3)
        sfx.add(0, w.astype(np.float32), 0.0, 0.5)
    elif k in ("ring_hum", "ring_hum_fast"):
        f0 = 70 if k == "ring_hum" else 110
        ph = 2 * np.pi * f0 * t + 0.3 * np.sin(2 * np.pi * (0.5 if k == "ring_hum" else 3.0) * t)
        h = (np.sin(ph) + 0.4 * np.sin(2 * ph)) * 0.12 * win(a0, a1, 0.2, 0.2)
        sfx.add(0, h.astype(np.float32), 0.0, 0.5)
    elif k == "music_light":
        music.add(0, S.pad(n, ("D4", "G4", "B4", "E5"), 0.09) * win(a0, a1, 0.8, 0.6), 0.0, 0.5)
        for j, bt in enumerate(np.arange(a0 + 0.3, a1 - 0.3, 0.6)):
            music.add(bt, S.pluck(S.PENTA[(j * 3) % 7] / 2, 0.4, 0.12, 0.25), 0.0, 0.16)

ladder = [S.note(x) for x in ("A5", "G5", "E5", "D5", "B4", "A4", "G4", "E4", "D4")]
for cu in ev["cues"]:
    k, ct = cu["kind"], cu["t"]
    if k == "brake_note":
        st = cu.get("step", 1)
        sfx.add(ct, S.marimba(ladder[min(st, len(ladder) - 1)], 0.9, 0.25), 0.1, 0.25 + 0.06 * st)
        sfx.add(ct, S.tick(3000 - 200 * st, 3 + st), 0.1, 0.06)
    elif k == "drag":
        r = S._bandnoise(int((cu["t1"] - ct) * SR), 150, 900, 51) * 0.5
        sfx.add(ct, (r * np.sin(np.linspace(0, np.pi, len(r))) ** 0.5).astype(np.float32), -0.2, 0.35)
    elif k == "spin":
        for j, tt in enumerate(np.linspace(ct, cu["t1"], 7)):
            sfx.add(tt, S.whoosh(0.18, 600, 3000, 70 + j), 0.6 - j * 0.2, 0.2)
    elif k == "bonk_small":
        sfx.add(ct, S.pop(600), 0.0, 0.4); sfx.add(ct, S.chime(S.note("B5"), 0.5, 0.1), 0.0, 0.1)
    elif k == "cough":
        for j in range(2):
            sfx.add(ct + j * 0.18, S._bandnoise(int(0.09 * SR), 300, 1800, 80 + j) * np.exp(-np.arange(int(0.09 * SR)) / (0.03 * SR)), 0.0, 0.25)
    elif k == "spring":
        sfx.add(ct, S.glide(300, 900, 0.35, 0.3, 0.6) * (1 + 0.5 * np.sin(np.arange(int(0.35 * SR)) / SR * 2 * np.pi * 18)), 0.0, 0.18)
    elif k == "squeeze":
        sfx.add(ct, S.glide(900, 400, 0.25, 0.2, 0.4), 0.0, 0.2)
    elif k == "clock_tick":
        for j in range(3):
            sfx.add(ct - 0.5 + j * 0.25, S.tick(2600, 90 + j), 0.4, 0.15)
        sfx.add(ct, S.chime(S.note("A5"), 0.8, 0.2), 0.4, 0.12)
    elif k == "clonc":
        sfx.add(ct, S.thunk(5, 160, 60), 0.0, 0.5); sfx.add(ct, S.marimba(S.note("G3"), 0.8, 0.3), 0.0, 0.3)
    elif k == "wind_gust":
        sfx.add(ct, S.whoosh(1.4, 200, 1200, 91), 0.0, 0.3)
    elif k == "shrug_wave":
        for j in range(cu["n"]):
            sfx.add(ct + j * cu["d"], S.glide(500 - j * 8, 380 - j * 6, 0.12, 0.08, 0.2), 0.8 - 1.6 * j / cu["n"], 0.12)
    elif k == "mm":
        sfx.add(ct, S.glide(220, 180, 0.3, 0.2, 0.3), 0.0, 0.25)
    elif k == "bell":
        for j in range(2):
            sfx.add(ct + j * 0.22, S.chime(S.note("E6"), 0.7, 0.25), 0.2, 0.16); sfx.add(ct + j * 0.22, S.chime(S.note("G6"), 0.6, 0.2), 0.2, 0.08)
    elif k == "stretch":
        sfx.add(ct, S.glide(200, 600, cu["t1"] - ct, (cu["t1"] - ct) * 0.8, 0.3), 0.0, 0.12)
    elif k == "line_brake":
        st = cu.get("step", 1)
        sfx.add(ct, S.marimba(ladder[min(st - 1, len(ladder) - 1)], 0.9, 0.25), 0.3 - 0.06 * st, 0.25 + 0.04 * st)
    elif k == "tick_tock":
        for j, tt in enumerate(np.arange(ct, cu["t1"], 0.3)):
            sfx.add(tt, S.tick(2200 if j % 2 else 1700, 100 + j), 0.2, 0.12)
    elif k == "ruler":
        sfx.add(ct, S.whoosh(0.3, 1500, 5000, 55), 0.0, 0.25)
    elif k == "hat_clonk":
        sfx.add(ct, S.thunk(7, 260, 120), 0.0, 0.35); sfx.add(ct, S.marimba(S.note("C4"), 0.6, 0.2), 0.0, 0.25)
    elif k == "tick_pencil":
        sfx.add(ct, S.whoosh(0.12, 3000, 8000, 57), 0.4, 0.3)
    elif k == "plate":
        sfx.add(ct, S.whoosh(0.3, 400, 2500, 58), 0.0, 0.3); sfx.add(ct + 0.25, S.thunk(9, 140, 70), 0.0, 0.2)
    elif k == "chain":
        for j, tt in enumerate(np.linspace(ct, cu["t1"], 10)):
            sfx.add(tt, S.chime(S.note("A6") * (1 + 0.02 * j), 0.2, 0.05), 0.6 - 0.12 * j, 0.06)
    elif k == "whisper_grow":
        for j in range(cu["n"]):
            sfx.add(ct + j * cu["d"], S._bandnoise(int(0.25 * SR), 2000 - j * 120, 6000 - j * 300, 120 + j) * np.hanning(int(0.25 * SR)), 0.6 - 0.12 * j, 0.06 + 0.03 * j)
    elif k == "murmur":
        sfx.add(ct, (S._bandnoise(int(0.8 * SR), 200, 1200, 130) * np.hanning(int(0.8 * SR))).astype(np.float32), 0.0, 0.35)
    elif k == "squeal":
        sfx.add(ct, S.glide(2100, 1700, 0.9, 0.6, 0.15), 0.0, 0.10)
    elif k == "stop_thunk":
        sfx.add(ct, S.thunk(4, 150, 58), 0.0, 0.5)
        sfx.add(ct + 0.15, S.tick(1800, 9), 0.0, 0.12)
    elif k == "flump":
        sfx.add(ct, S.whoosh(0.18, 300, 1500, 17), -0.2, 0.35)
        sfx.add(ct + 0.12, S.thunk(6, 120, 70), -0.2, 0.12)
    elif k == "whoosh_up":
        sfx.add(ct, S.whoosh(0.35, 500, 4000, 21), 0.0, 0.4)
    elif k == "pop":
        sfx.add(ct, S.pop(800), 0.15, 0.35)
    elif k == "blow":
        sfx.add(ct, S.whoosh(0.4, 800, 3000, 23), -0.3, 0.35)
    elif k == "scratch":
        for j in range(2):
            sfx.add(ct - 0.12 + j * 0.13, S.whoosh(0.1, 2500, 7000, 40 + cu.get("n", 0) * 3 + j), (cu.get("n", 0) - 1) * 0.5, 0.5)
    elif k == "creak":
        sfx.add(ct, S.glide(300, 420, 0.6, 0.5, 0.4), 0.0, 0.08)
    elif k == "flutter":
        for j in range(5):
            sfx.add(ct + j * 0.035, S.whoosh(0.05, 1500, 5000, 60 + j), 0.3, 0.25)
    elif k == "chirp":
        sfx.add(ct, S.glide(2600, 3600, 0.09, 0.06, 0.1), 0.3, 0.3)
        sfx.add(ct + 0.12, S.glide(3400, 2800, 0.1, 0.07, 0.1), 0.3, 0.25)
    elif k == "whoosh_turn":
        sfx.add(ct - 0.1, S.whoosh(0.3, 400, 3000, 31), 0.2, 0.35)
    elif k == "swish":
        sfx.add(ct, S.whoosh(0.5, 300, 2500, 33), -0.4, 0.4)
    elif k == "far_brake":
        sfx.add(ct, S.thunk(8, 110, 60), -0.3, 0.12)
    elif k == "plink":
        sfx.add(ct, S.chime(S.note("E6"), 0.6, 0.15), 0.2, 0.12)
    elif k == "chord_in":   # a suspended chord that swells to the end of the question and hangs
        t1 = cu["t1"]
        ch = np.zeros(n, np.float32)
        for nm in ("G3", "C4", "D4", "A4"):
            ch += np.sin(2 * np.pi * S.note(nm) * t).astype(np.float32)
        env = np.clip((t - ct) / max(0.5, t1 - ct), 0, 1) ** 1.5 * np.clip((t1 + 1.0 - t) / 0.8, 0, 1)
        music.add(0, (ch / 4 * env).astype(np.float32), 0.0, 0.5)
    elif k == "whoosh_wm":
        sfx.add(ct, S.whoosh(0.5, 300, 2500, 41), 0.0, 0.35)
    elif k == "sting_drop":
        sfx.add(ct, S.glide(1500, 700, 0.55, 0.3, 0.1), 0.0, 0.10)
    elif k == "flick":
        sfx.add(ct, S.marimba(S.note("D5"), 0.9, 0.25), 0.0, 0.42)
        sfx.add(ct, S.tick(3200, 7), 0.0, 0.1)
    elif k == "boink":
        sfx.add(ct, S.glide(300, 900, 0.22, 0.18, 0.4), 0.1, 0.35)
        sfx.add(ct, S.marimba(S.note("A5"), 0.9, 0.25), 0.1, 0.38)
    elif k == "tin":
        f = S.note("G5")
        sfx.add(ct, S.marimba(f, 1.4, 0.35), 0.0, 0.46)
        sfx.add(ct, S.chime(f * 2, 2.0, 0.6), 0.0, 0.12)
        sfx.add(ct, S.pluck(S.note("G2"), 1.4, 0.5, 0.15), 0.0, 0.4)

mix = S.mix(voice=voice, music=music.buf, sfx=sfx.buf, n=n)
for s0, s1 in silence:       # total silence where the script asks for it (the music and the sfx tails die before)
    i0, i1 = int(s0 * SR), int(s1 * SR)
    fade = np.clip((np.arange(n) - (i0 - int(0.25 * SR))) / (0.25 * SR), 0, 1)[:, None]
    mix *= (1 - fade * ((np.arange(n) < i1)[:, None]))
m = S.master(mix, out, target=-14.0, ceiling=-1.5, fade_in=0.01, fade_out=0.05)
print(json.dumps(m))
