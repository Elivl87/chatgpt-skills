#!/usr/bin/env python3
"""EP003 sound pass (free sounds only: our engine synths + CC0 libraries listed in public/shared/sfx/SOURCES.md).
Music stays OFF (channel rule). Every cue is tied to a word of the narration (T()), so it follows any re-timing.

  EPISODE=ep003 python3 scripts/ep003-sfx.py

Out: public/episodes/ep003/audio/sfx.wav (SFX bed alone) and mix.wav (narration + SFX), 48 kHz mono. The block
renders use mix.wav when it exists. SFX sit well under the voice (about -14 to -24 dB below narration peaks) and are
ducked further while a word is being spoken.
"""
import json, os, sys
from pathlib import Path
import numpy as np, soundfile, scipy.signal as ss

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / 'animatic'))
os.environ.setdefault('EPISODE', 'ep003')
from lib import ROOT, T  # noqa

SR = 48000
SFX = ROOT / 'public/shared/sfx'
W_ = SFX / 'cc0/rubberduck_water'
K_ = SFX / 'cc0/kenney'
S = {'whoosh': SFX / 'whoosh.wav', 'pop': SFX / 'pop.wav', 'notify': SFX / 'notify.wav', 'stamp': SFX / 'stamp.wav',
     'money': SFX / 'money.wav', 'sparkle': SFX / 'sparkle.wav', 'chime': SFX / 'chime.wav', 'drain': SFX / 'drain.wav',
     'tension': SFX / 'tension.wav', 'keys': SFX / 'keyboard.wav', 'whip': SFX / 'whip.wav', 'impact': SFX / 'impact.wav',
     'select': SFX / 'ui_select.wav', 'done': SFX / 'ui_complete.wav', 'poof': SFX / 'poof.wav',
     'clunk': K_ / 'metalLatch.ogg', 'lid': K_ / 'impactPlate_light_000.ogg', 'paper': K_ / 'scratch_004.ogg',
     'click': K_ / 'click_001.ogg', 'knock': K_ / 'impactGeneric_light_000.ogg',
     'splash': W_ / 'splash_03.ogg', 'splash_s': W_ / 'splash_07.ogg', 'splash_b': W_ / 'splash_11.ogg',
     'bubble': W_ / 'bubble_02.ogg', 'water': W_ / 'loop_water_02.ogg'}


def synth(name):
    """Our own synths for the wordmark moments (free, made here)."""
    rng = np.random.default_rng(3)
    if name in ('zip', 'zip_slack'):                                    # fishing line: a filtered noise sweep
        L = int((.32 if name == 'zip' else .25) * SR); t = np.arange(L) / SR
        n = rng.standard_normal(L)
        f0, f1 = (5500, 1800) if name == 'zip' else (1500, 700)
        out = np.zeros(L)
        for i in range(0, L, 512):                                       # moving band-pass, block by block
            f = f0 + (f1 - f0) * i / L
            b, a_ = ss.butter(2, [f * .7 / (SR / 2), min(.99, f * 1.3 / (SR / 2))], 'band')
            out[i:i + 512] = ss.lfilter(b, a_, n[i:i + 512])
        env = np.minimum(1, t / .02) * np.exp(-t * (6 if name == 'zip' else 10))
        return (out * env / (np.abs(out).max() + 1e-9)).astype(np.float32)
    if name == 'swell':                                                  # water rising: low noise swell + the water loop
        x = load('water')[:int(1.4 * SR)]
        L = len(x); t = np.arange(L) / SR
        b, a_ = ss.butter(2, 900 / (SR / 2))
        rum = ss.lfilter(b, a_, rng.standard_normal(L)); rum /= np.abs(rum).max()
        env = np.sin(np.pi * np.minimum(1, t / 1.4)) ** 1.5
        return ((x / (np.abs(x).max() + 1e-9) * .8 + rum * .5) * env).astype(np.float32)
    if name == 'drip':                                                   # a water drop: a fast upward pitch blip
        L = int(.09 * SR); t = np.arange(L) / SR
        f = 900 + 2600 * t / .09
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55)).astype(np.float32)
    raise KeyError(name)


def load(name):
    if name not in S:
        return synth(name)
    x, sr = soundfile.read(str(S[name]), dtype='float32', always_2d=True)
    x = x.mean(1)
    return ss.resample_poly(x, SR, sr).astype(np.float32) if sr != SR else x


def cues():
    """(time, sound, gain dB). Gains are relative to full scale before the voice-ducking."""
    c = []
    a = c.append
    # A · hook
    a((T('l01.w9') - .2, 'whoosh', -20)); a((T('l01.w11'), 'knock', -16))
    for i, dt in enumerate((0, .25, .5)):
        a((T('l01.w13') + dt, 'splash_s', -18)); a((T('l01.w13') + dt + .85, 'splash', -20))
    a((T('l03') - .05, 'whip', -14)); a((T('l03') + .02, 'impact', -14))
    a((T('l03.w9'), 'money', -18)); a((T('l03.w13'), 'select', -18))
    a((T('l04'), 'pop', -16)); a((T('l04.w6'), 'pop', -18)); a((T('l04.w16'), 'stamp', -16))
    a((T('l05'), 'whoosh', -22)); a((T('l05.w8'), 'pop', -20))
    # wordmark option 1 "The catch" (Producer, 2026-10-12): reel clicks, the line zip, one soft bobber plop; no sparkle
    w = T('l07.w2') - .35
    for i in range(9):
        a((w + .38 + .07 * i, 'click', -24 + i * .4))
    a((w + .02, 'zip', -20)); a((w + 1.12, 'bubble', -20)); a((w + 1.42, 'zip_slack', -28))
    # B · invitation
    a((T('l08.w12') - .15, 'whoosh', -20)); a((T('l08.w12'), 'paper', -18))
    for i in range(4):
        a((T('l09.w11') + .12 * i, 'pop', -22))
    a((T('l09.w26'), 'whoosh', -22)); a((T('l09.w32'), 'notify', -16))
    for k in ('l10.w6', 'l10.w7', 'l10.w8'):
        a((T(k), 'notify', -16))
    a((T('l11.w6'), 'notify', -18)); a((T('l11.w10') + .3, 'bubble', -20))
    # C · the adult way
    for k in ('l13', 'l14', 'l15', 'l16'):
        a((T(k), 'notify', -18))
    for i in range(3):
        a((T('l17') + .35 * i, 'paper', -18))
    a((T('l17.w5'), 'chime', -22)); a((T('l17.w9'), 'clunk', -14)); a((T('l17.w9') + .45, 'clunk', -16))
    a((T('l17.w16'), 'drain', -18))
    a((T('l18.w12'), 'stamp', -20)); a((T('l18.w14'), 'stamp', -20)); a((T('l18.w18'), 'done', -16))
    a((T('l19.w16'), 'chime', -18)); a((T('l19.w26'), 'knock', -14)); a((T('l20'), 'stamp', -14))
    # D · why fishing
    a((T('l22.w7'), 'pop', -18)); a((T('l22.w11'), 'pop', -18)); a((T('l23') - .1, 'whoosh', -20))
    a((T('l23.w14'), 'select', -20))
    for k in ('l25.w11', 'l25.w14', 'l25.w17'):
        a((T(k) - .1, 'whoosh', -22))
    a((T('l25.w27'), 'stamp', -22)); a((T('l25.w42'), 'whoosh', -20)); a((T('l26.w9'), 'notify', -18))
    # E · the alibi falls apart
    for k in ('l27.w10', 'l27.w12', 'l27.w14'):
        a((T(k), 'click', -16))
    a((T('l28'), 'whoosh', -18)); a((T('l28') + .9, 'splash', -18))
    for k in ('l29.w6', 'l29.w12', 'l29.w16', 'l29.w20'):
        a((T(k), 'pop', -18))
    a((T('l29.w16'), 'money', -20)); a((T('l29.w23'), 'paper', -20))
    a((T('l30.w13'), 'stamp', -14)); a((T('l31.w9'), 'stamp', -14))
    a((T('l32') + .55, 'splash_b', -14)); a((T('l32.w6') + .3, 'tension', -22)); a((T('l32.w17'), 'money', -18))
    a((T('l32.w29'), 'whoosh', -16)); a((T('l32.w29') + 1.3, 'splash_s', -22))
    a((T('l33.w15'), 'poof', -22)); a((T('l33.w19') - .04, 'whip', -12)); a((T('l33.w19'), 'impact', -12))
    for i in range(4):
        a((T('l35') + .5 + 1.3 * i, 'notify', -20))
    # F · friendslop and the Tuesday night
    a((T('l36.w11'), 'stamp', -14)); a((T('l37.w10'), 'lid', -14)); a((T('l37.w10') + .1, 'bubble', -22))
    for i in range(4):
        a((T('l37.w11') + .1 * i, 'pop', -22))
    a((T('l40.w16'), 'click', -18)); a((T('l41.w12'), 'select', -18)); a((T('l41.w14'), 'click', -14))
    a((T('l42.w11'), 'pop', -20)); a((T('l42.w16') + .2, 'drain', -20))
    for i in range(18):
        a((T('l43') + .12 * i, 'notify', -26))
    # G · payoff + end
    a((T('l45') + .2, 'bubble', -18)); a((T('l46') + .6, 'splash_s', -22))
    a((T('l48') + .2, 'stamp', -18))
    for i in range(10):
        a((T('l50') + .25 + .12 * i, 'keys', -26))
    # wordmark option 2 "Rising from the lake": the water swells, drips fall, the fish surfaces with a small bubble
    w = T('l51.w14')
    a((w - .05, 'swell', -18))
    for i, dt in enumerate((.75, .95, 1.2, 1.5, 1.85)):
        a((w + dt, 'drip', -28 - 2 * (i % 2)))
    a((w + .55, 'splash_s', -26)); a((w + .7, 'bubble', -22)); a((T('l51.w16') + .6, 'select', -20))
    return c


def ambience():
    """A low water bed under the lake scenes (looped CC0)."""
    return [(T('l01') - .3, T('l03') - .1, -34), (T('l24') - .1, T('l25') - .1, -32), (T('l39') - .1, T('l41') - .1, -34),
            (T('l44') - .1, T('l52.end') + 2.5, -33)]


def main():
    narr, sr = soundfile.read(str(ROOT / 'public/episodes/ep003/audio/narration.wav'), dtype='float32')
    n = len(narr)
    fx = np.zeros(n, np.float32)
    for t, name, db in cues():
        x = load(name) * 10 ** (db / 20)
        i = int(t * SR)
        if 0 <= i < n:
            fx[i:i + len(x)] += x[:n - i]
    water = load('water')
    for t0, t1, db in ambience():
        i0, i1 = int(t0 * SR), min(n, int(t1 * SR))
        L = i1 - i0
        bed = np.tile(water, L // len(water) + 1)[:L] * 10 ** (db / 20)
        fade = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (.6 * SR))
        fx[i0:i1] += bed * fade
    tm = json.loads((ROOT / 'episodes/ep003/timings.json').read_text())['cues']
    duck = np.ones(n, np.float32)                                         # -4 dB under spoken words
    for c in tm.values():
        for w in c['words']:
            duck[int(w['start'] * SR):int(w['end'] * SR)] = 10 ** (-4 / 20)
    duck = np.convolve(duck, np.ones(int(.05 * SR)) / int(.05 * SR), 'same').astype(np.float32)
    fx *= duck
    out = ROOT / 'public/episodes/ep003/audio'
    soundfile.write(str(out / 'sfx.wav'), np.clip(fx, -1, 1), SR, subtype='PCM_16')
    mix = narr + fx
    peak = np.abs(mix).max()
    if peak > .98:
        mix *= .98 / peak
    soundfile.write(str(out / 'mix.wav'), mix, SR, subtype='PCM_16')
    print('cues', len(cues()), 'sfx peak dB', round(20 * np.log10(np.abs(fx).max() + 1e-9), 1), 'mix peak', round(float(np.abs(mix).max()), 3))


if __name__ == '__main__':
    main()
