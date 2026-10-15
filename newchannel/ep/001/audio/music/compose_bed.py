#!/usr/bin/env python3
"""EP001 · background music bed samples, composed in code for the channel (no stock, no samples of anyone's music).

    python3 compose_bed.py OUT_TMP_DIR          (needs: pretty_midi, mido, numpy, soundfile; fluidsynth binary;
                                                 FluidR3_GM.sf2 from the Debian/Ubuntu package fluid-soundfont-gm)

Two options, 60 s each, key G major (channel key; the sting is D5 -> A5 -> G5, engine/sound.py STING_NOTES):
    (a) "Ruta dorada"  96 bpm, 24 bars: nylon guitar fingerpicking, acoustic bass, warm pad, glockenspiel motif,
        pizzicato stabs + soft kick/side-stick in the B section. The glockenspiel quotes the 3-note sting.
    (b) "Pizzicato"   100 bpm, 25 bars: marimba ostinato, pizzicato bass, vibraphone chords, celesta motif, shaker.
        Option (b) was meant for an open music model. License check (2026-10-15): MusicGen CC-BY-NC = blocked; Stable
        Audio Open community license = blocked; ACE-Step v1 3.5B (Apache-2.0) and ACE-Step v1.5 (MIT, card says
        trained on licensed + royalty-free + synthetic data, commercial use allowed) PASS on paper. Not run: v1.5 is
        10.1 GB of weights (DiT 4.8 GB + 5Hz LM 3.7 GB + Qwen3-Embedding 1.2 GB + VAE) with 11 GB free on a disk shared
        with the animatic render, and a 2-thread CPU budget. So (b) is a second code-composed variant instead.
Both are mixed to sit under narration: no sustained lead in the 1-4 kHz voice band, a -3 dB dip at 2.5 kHz,
HPF 45 Hz, bed alone at -24 LUFS integrated.

Outputs (in this folder):
    sample_bed.mp3              option (a) · 1 s · beep · 1 s · option (b)   (each at -24 LUFS)
    sample_bed_under_voice.mp3  20 s: option (a) ducked under the pilot's hook (segments b01, b02, b03_02 at their
                                episode times), mastered to -14 LUFS, true peak <= -1 dBTP
    bed_a.mid / bed_b.mid       the compositions (MIDI, our own)
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import pretty_midi as pm
import soundfile as sf

HERE = Path(__file__).resolve().parent
NC = HERE.parents[3]
sys.path.insert(0, str(NC / "engine"))
import sound as es  # noqa: E402  (numpy + ffmpeg only)

SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
FF = "/usr/bin/ffmpeg"
SR = 48000
BED_LUFS = -24.0
rng = np.random.default_rng(20261015)

# ------------------------------------------------------------------------------------------------ helpers

N = pm.note_name_to_number
CH = {  # voicings: (bass root, [4 chord tones for arpeggios])
    "G": ("G2", ["G3", "B3", "D4", "G4"]), "Em7": ("E2", ["E3", "G3", "B3", "D4"]),
    "Cmaj7": ("C3", ["C3", "E3", "G3", "B3"]), "D": ("D2", ["D3", "F#3", "A3", "D4"]),
    "Dsus4": ("D2", ["D3", "G3", "A3", "D4"]), "Bm7": ("B1", ["B2", "D3", "F#3", "A3"]),
    "G/B": ("B1", ["G3", "B3", "D4", "G4"]), "Am7": ("A1", ["A2", "E3", "G3", "C4"]),
    "D7sus4": ("D2", ["D3", "G3", "A3", "C4"]), "C/G": ("G2", ["G3", "C4", "E4", "G4"]),
    "C": ("C2", ["C3", "E3", "G3", "C4"]), "Cadd9": ("C2", ["C3", "G3", "D4", "E4"]),
}
FIFTH = {"G": "D3", "Em7": "B2", "Cmaj7": "G2", "D": "A2", "Dsus4": "A2", "Bm7": "F#2", "G/B": "D3", "Am7": "E2",
         "D7sus4": "A2", "C/G": "C3", "C": "G2", "Cadd9": "G2"}


class Song:
    def __init__(self, bpm):
        self.bpm = bpm
        self.beat = 60.0 / bpm
        self.m = pm.PrettyMIDI(initial_tempo=bpm)
        self.inst = {}

    def track(self, name, program, drum=False):
        if name not in self.inst:
            self.inst[name] = pm.Instrument(program=program, is_drum=drum, name=name)
            self.m.instruments.append(self.inst[name])
        return self.inst[name]

    def note(self, name, pitch, beat, dur_beats, vel, jitter=0.008, swing=0.0):
        """beat = absolute position in beats (float). swing delays off-beat 8ths by swing * 8th length."""
        if swing and abs((beat * 2) % 2 - 1) < 1e-6:
            beat += swing * 0.5
        t = beat * self.beat + rng.normal(0, jitter)
        t = max(0.0, t)
        v = int(np.clip(vel + rng.normal(0, 5), 1, 127))
        p = N(pitch) if isinstance(pitch, str) else pitch
        self.inst[name].notes.append(pm.Note(velocity=v, pitch=p, start=t, end=t + dur_beats * self.beat))

    def write(self, path):
        self.m.write(str(path))


# ------------------------------------------------------------------------------------------------ option (a)

def song_a():
    s = Song(96)
    s.track("guitar", 24)        # Acoustic Guitar (nylon)
    s.track("bass", 32)          # Acoustic Bass
    s.track("pad", 89)           # Pad 2 (warm)
    s.track("glock", 9)          # Glockenspiel
    s.track("pizz", 45)          # Pizzicato Strings
    s.track("drums", 0, drum=True)
    bars = (["G", "Cmaj7"]                                                       # intro 1-2
            + ["G", "Em7", "Cmaj7", "D", "G", "Bm7", "Cmaj7", "Dsus4"]           # A 3-10
            + ["Em7", "Cmaj7", "G/B", "Am7", "Em7", "Cmaj7", "Am7", "D7sus4"]    # B 11-18
            + ["G", "Em7", "Cmaj7", "D"]                                         # A' 19-22
            + ["Cmaj7", "G"])                                                    # outro 23-24
    pat = [0, 2, 1, 3, 0, 2, 3, 2]                                               # fingerpicking, 8ths
    for b, c in enumerate(bars):
        b0 = 4 * b
        root, tones = CH[c]
        last = b == len(bars) - 1
        # guitar: thumb on the low root (octave of the bass) + picked chord tones, light swing
        if not last:
            for k, ix in enumerate(pat):
                if c.startswith("D") and c != "D" and b in (9, 17) and k >= 4:   # sus resolves to D on beat 3
                    tones = CH["D"][1]
                vel = 62 if k % 2 == 0 else 52
                s.note("guitar", tones[ix], b0 + 0.5 * k, 0.9, vel, swing=0.12)
            s.note("guitar", N(root) + 12, b0, 1.8, 58)
        else:                                                                    # final rolled G chord
            for k, p in enumerate(["G2", "D3", "G3", "B3", "D4", "G4"]):
                s.note("guitar", p, b0 + 0.06 * k, 4.0, 60 - 2 * k, jitter=0.002)
        # bass from bar 3
        if 2 <= b and not last:
            s.note("bass", root, b0, 1.4, 72)
            s.note("bass", FIFTH[c], b0 + 1.5, 0.5, 60)
            s.note("bass", root, b0 + 2, 1.8, 68)
        if last:
            s.note("bass", "G1", b0, 4.0, 70)
        # warm pad, whole notes (very soft), from bar 3
        if 2 <= b:
            for p in tones[:3]:
                s.note("pad", N(p) + 12 if N(p) < N("D3") else p, b0, 4.0, 34, jitter=0.0)
        # B section: pizzicato off-beat stabs (and of 2, and of 4) + soft kick / side stick
        if 10 <= b <= 17:
            for off in (1.5, 3.5):
                for p in tones[1:4]:
                    s.note("pizz", N(p) + 12, b0 + off, 0.3, 46, jitter=0.004)
        if 10 <= b <= 21:
            s.note("drums", 36, b0, 0.25, 50, jitter=0.003)          # kick 1, 3
            s.note("drums", 36, b0 + 2, 0.25, 44, jitter=0.003)
            s.note("drums", 37, b0 + 1, 0.2, 30, jitter=0.003)       # side stick 2, 4
            s.note("drums", 37, b0 + 3, 0.2, 30, jitter=0.003)
        if 2 <= b <= 22:                                             # shaker 8ths, off-beats a bit louder
            for k in range(8):
                s.note("drums", 70, b0 + 0.5 * k, 0.1, 38 if k % 2 == 0 else 50, jitter=0.004, swing=0.12)
    # glockenspiel motif = the channel sting D5 -> A5 -> G5 (bounce, bounce, land), quoted and answered
    def motif(bar, notes=("D5", "A5", "G5"), vel=52, hold=2.0):
        b0 = 4 * bar
        s.note("glock", notes[0], b0 + 1.0, 0.9, vel)
        s.note("glock", notes[1], b0 + 2.0, 0.7, vel + 4)
        s.note("glock", notes[2], b0 + 2.75, hold, vel + 2)
    motif(5)                                       # bar 6 (Em7 -> answer lands on G over the chord tones)
    motif(9, ("D5", "A5", "F#5"))                  # bar 10: question (lands on F#, leading tone, over D)
    motif(13, ("E5", "B5", "A5"), vel=46)          # bar 14 over Am7: the motif one step up (curious)
    motif(17, ("D5", "A5", "F#5"), vel=48)
    motif(21, ("D5", "A5", "G5"))                  # bar 22
    motif(23, ("D5", "A5", "G5"), vel=58, hold=3.5)  # outro: the sting, landing on the tonic
    s.note("glock", "G6", 4 * 23 + 2.75, 3.0, 30)   # sparkle octave on the landing
    return s, len(bars) * 4 * s.beat


# ------------------------------------------------------------------------------------------------ option (b)

def song_b():
    s = Song(100)
    s.track("marimba", 12)       # Marimba
    s.track("pizz", 45)          # Pizzicato Strings (bass line)
    s.track("vibes", 11)         # Vibraphone
    s.track("celesta", 8)        # Celesta (motif)
    s.track("drums", 0, drum=True)
    bars = (["G"]
            + ["G", "C/G", "Am7", "D7sus4", "G", "C/G", "Am7", "D"]
            + ["Em7", "Cadd9", "G", "D", "Em7", "Cadd9", "Am7", "D7sus4"]
            + ["G", "C/G", "Am7", "D7sus4", "G", "C/G"]
            + ["Am7", "G"])
    pat = [0, 2, 3, 2, 1, 2, 3, 2]
    for b, c in enumerate(bars):
        b0 = 4 * b
        root, tones = CH[c]
        last = b == len(bars) - 1
        if not last:
            for k, ix in enumerate(pat):                       # marimba ostinato, an octave up, staccato
                s.note("marimba", N(tones[ix]) + 12, b0 + 0.5 * k, 0.4, 66 if k % 2 == 0 else 54, swing=0.08)
        else:
            for k, p in enumerate(["G3", "D4", "G4", "B4", "D5"]):
                s.note("marimba", p, b0 + 0.05 * k, 3.0, 56)
        if 1 <= b and not last:                                # pizzicato bass: root, fifth, root walk-up
            s.note("pizz", N(root) + 12, b0, 0.5, 70)
            s.note("pizz", N(FIFTH[c]) + 12, b0 + 1.5, 0.5, 58)
            s.note("pizz", N(root) + 12, b0 + 2, 0.5, 64)
            s.note("pizz", N(root) + 14, b0 + 3.5, 0.4, 52)
        if last:
            s.note("pizz", "G2", b0, 1.0, 70)
        if 9 <= b <= 16:                                       # vibraphone chords in the B section
            for p in tones[1:4]:
                s.note("vibes", N(p) + 12, b0, 3.5, 52, jitter=0.0)
        if 1 <= b < len(bars) - 1:                             # shaker
            for k in range(8):
                s.note("drums", 70, b0 + 0.5 * k, 0.1, 34 if k % 2 == 0 else 46, jitter=0.004, swing=0.08)
        if 9 <= b <= 22:
            s.note("drums", 75, b0 + 3.5, 0.1, 34, jitter=0.003)   # claves, a wink at the end of each bar
    def motif(bar, notes=("D5", "A5", "G5"), vel=50, hold=1.8):
        b0 = 4 * bar
        s.note("celesta", notes[0], b0 + 1.0, 0.8, vel)
        s.note("celesta", notes[1], b0 + 2.0, 0.6, vel + 4)
        s.note("celesta", notes[2], b0 + 2.75, hold, vel + 2)
    motif(4, ("D5", "A5", "F#5"))
    motif(8, ("D5", "A5", "F#5"))
    motif(12, ("D5", "A5", "G5"), vel=46)
    motif(16, ("E5", "B5", "A5"), vel=44)
    motif(20, ("D5", "A5", "F#5"))
    motif(23, ("D5", "A5", "G5"), vel=56, hold=3.0)
    return s, len(bars) * 4 * s.beat


# ------------------------------------------------------------------------------------------------ render + mix

def render(song, dur, tag, tmp):
    mid = HERE / f"bed_{tag}.mid"
    song.write(mid)
    raw = tmp / f"bed_{tag}_raw.wav"
    subprocess.run(["nice", "-n", "10", "fluidsynth", "-ni", "-q", "-g", "0.5", "-r", str(SR), "-o",
                    "synth.reverb.room-size=0.55", "-o", "synth.reverb.level=0.35", "-o", "synth.chorus.active=0",
                    "-F", str(raw), SF2, str(mid)], check=True)
    x = es.load_audio(raw, SR, 2)
    n = int(round((dur + 2.5) * SR))                         # keep the final ring-out (2.5 s), then fade
    x = np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]
    t = np.arange(n) / SR
    x *= np.clip((n / SR - t) / 1.5, 0, 1)[:, None]
    eq = tmp / f"bed_{tag}_eq.wav"                           # voice pocket: HPF 45 Hz, -3 dB @ 2.5 kHz
    es.write_wav(tmp / f"bed_{tag}_pre.wav", x, bits=24)
    subprocess.run([FF, "-v", "error", "-y", "-i", str(tmp / f"bed_{tag}_pre.wav"), "-af",
                    "highpass=f=45,equalizer=f=2500:t=q:w=1.0:g=-3", "-c:a", "pcm_f32le", str(eq)], check=True)
    y = es.load_audio(eq, SR, 2)
    m = es.measure(y)
    y *= es.db(BED_LUFS - m["I"])
    m2 = es.measure(y)
    print(f"bed {tag}: {len(y) / SR:.1f} s, {m2['I']:.1f} LUFS, TP {m2['TP']:.1f} dBTP")
    return y, m2


def beep():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    b = 0.1 * np.sin(2 * np.pi * 1000 * t) * np.minimum(1, t / 0.005) * np.minimum(1, (0.25 - t) / 0.01)
    return np.stack([b, b], 1).astype(np.float32)


def mp3(x, path, kbps=192):
    w = path.with_suffix(".wav")
    es.write_wav(w, x, bits=24)
    subprocess.run([FF, "-v", "error", "-y", "-i", str(w), "-c:a", "libmp3lame", "-b:a", f"{kbps}k", str(path)],
                   check=True)
    w.unlink()
    m = es.measure_file(path)
    print(f"{path.name}: {m['I']:.1f} LUFS, TP {m['TP']:.1f} dBTP, {path.stat().st_size / 1e6:.2f} MB")
    return m


def hook_voice():
    """Beats 1-3 of the pilot from segments/*.flac at their episode times and levels (segments_es.json)."""
    meta = json.loads((HERE.parent / "segments_es.json").read_text())
    segs = [s for s in meta["segments"] if s["name"] in ("b01_00_narrator", "b02_01_narrator", "b03_02_eli")]
    end = segs[-1]["start"] + segs[-1]["dur"]
    v = np.zeros(int(round((end + 0.1) * SR)), np.float32)
    for s in segs:
        a = es.load_audio(HERE.parent / "segments" / f"{s['name']}.flac", SR, 1)[:, 0] * es.db(s["gain_db"])
        i0 = int(round(s["start"] * SR))
        v[i0:i0 + len(a)] += a[: len(v) - i0]
    return v


def main():
    tmp = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/claude-0/bed")
    tmp.mkdir(parents=True, exist_ok=True)
    sa, da = song_a()
    sb, db_ = song_b()
    a, ma = render(sa, da, "a", tmp)
    b, mb = render(sb, db_, "b", tmp)
    gap = np.zeros((SR, 2), np.float32)
    report = {"a": {"bpm": 96, "dur_s": round(len(a) / SR, 2), **ma}, "b": {"bpm": 100, "dur_s": round(len(b) / SR, 2), **mb}}
    report["sample_bed.mp3"] = mp3(np.concatenate([a, gap, beep(), gap, b]), HERE / "sample_bed.mp3")
    # demo: 20 s of option (a) under the hook (music sits 17 dB under the voice, ducked 6 dB more while it speaks)
    v = hook_voice()
    n = int(20.0 * SR)
    mixd = es.mix(voice=v, music=a[:n], music_rel_db=-17.0, duck_db=6.0, n=n)
    w = tmp / "under_voice.wav"
    es.master(mixd, w, target=-14.0, ceiling=-1.5, fade_out=1.2)
    y = es.load_audio(w, SR, 2)
    report["sample_bed_under_voice.mp3"] = mp3(y, HERE / "sample_bed_under_voice.mp3")
    (HERE / "sample_bed_measurements.json").write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
