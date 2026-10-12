#!/usr/bin/env python3
"""EP003 sound pass (free sounds only: our engine synths + CC0 libraries listed in public/shared/sfx/SOURCES.md).
Music stays OFF (channel rule).

  EPISODE=ep003 python3 scripts/ep003-sfx.py

The cue list follows the Hyperframes choreography beat by beat (audit #20): tools/hyperframes_ep003/src/
index.template.html (block A, the hook) and block{B..G}.template.html. Every cue sits on the SAME word token the
template keys its move on ({{l09.w11}} there == T('l09.w11') here: block tokens are block-relative, T() is absolute,
same word). Plain seconds in a block template are block-relative: B0['D'] + 0.24 = 0.24 s into block D. The hook was
authored on narration v2 and is warped onto the current narration by build.py; HK(t_v2) applies the same warp, so
hook cues are written with the hook's own numbers (HK(10.62) = the slap).
Note: timings.json splits "Friendslop" in l36, so from l36.w11 on the index is +1 ("Half" = l36.w12); the cues use
block F's tokens.

Out (48 kHz, 16-bit, STEREO): public/episodes/ep003/audio/sfx.wav (the SFX bed alone) and mix.wav (narration +
SFX). The narration is identical in both channels (centred); cues carry gentle pans (|pan| <= 0.6, constant-power,
centre = unity), so the mono fold-down stays within ~1 dB of the old mono mix. stage_assets.py cuts mix.wav with
ffmpeg (pcm_s16le copy keeps the two channels). SFX sit ~7 dB+ under the voice peaks and are ducked -4 dB while a
word is spoken.
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
     'select': SFX / 'ui_select.wav', 'done': SFX / 'ui_complete.wav', 'poof': SFX / 'poof.wav', 'rumble': SFX / 'rumble.wav',
     'buzzer': SFX / 'buzzer.wav', 'wind': SFX / 'wind.wav', 'crickets': SFX / 'crickets.wav',
     'clunk': K_ / 'metalLatch.ogg', 'lid': K_ / 'impactPlate_light_000.ogg', 'paper': K_ / 'scratch_004.ogg',
     'paper2': K_ / 'scratch_005.ogg', 'click': K_ / 'click_001.ogg', 'knock': K_ / 'impactGeneric_light_000.ogg',
     'wood': K_ / 'impactWood_light_002.ogg', 'wood_m': K_ / 'impactWood_medium_001.ogg', 'punch': K_ / 'impactPunch_heavy_002.ogg',
     'page': K_ / 'bookFlip1.ogg', 'page2': K_ / 'bookFlip2.ogg', 'door_open': K_ / 'doorOpen_1.ogg', 'door_slam': K_ / 'doorClose_2.ogg',
     'coins': K_ / 'handleCoins2.ogg', 'creak': K_ / 'creak2.ogg', 'cloth': K_ / 'cloth2.ogg', 'latch': K_ / 'metalClick.ogg',
     'switch': K_ / 'switch_002.ogg', 'drop': K_ / 'drop_002.ogg', 'powerup': K_ / 'powerUp3.ogg', 'forcefield': K_ / 'forceField_002.ogg',
     'tvhum': K_ / 'computerNoise_000.ogg',
     # HF pass (2026-10-12): more CC0 Kenney (impact / interface / sci-fi / digital / rpg / ui packs)
     'door_knock': K_ / 'impactWood_heavy_000.ogg', 'plank': K_ / 'impactPlank_medium_000.ogg', 'thud': K_ / 'impactSoft_heavy_000.ogg',
     'squish': K_ / 'impactSoft_medium_000.ogg', 'tin': K_ / 'impactTin_medium_000.ogg', 'chip': K_ / 'impactGlass_light_000.ogg',
     'tick': K_ / 'tick_001.ogg', 'scroll': K_ / 'scroll_001.ogg', 'confirm': K_ / 'confirmation_001.ogg', 'error': K_ / 'error_006.ogg',
     'pluck': K_ / 'pluck_001.ogg', 'question': K_ / 'question_001.ogg', 'hud_on': K_ / 'maximize_001.ogg', 'hud_off': K_ / 'minimize_001.ogg',
     'boom': K_ / 'explosionCrunch_000.ogg', 'lowboom': K_ / 'lowFrequency_explosion_000.ogg', 'launch': K_ / 'phaserUp1.ogg',
     'lowdown': K_ / 'lowDown.ogg', 'jackpot': K_ / 'highUp.ogg', 'place': K_ / 'bookPlace1.ogg', 'step': K_ / 'footstep_wood_000.ogg',
     'step2': K_ / 'footstep_wood_001.ogg', 'leather': K_ / 'dropLeather.ogg', 'key': K_ / 'click2.ogg',
     'splash': W_ / 'splash_03.ogg', 'splash_s': W_ / 'splash_07.ogg', 'splash_b': W_ / 'splash_11.ogg', 'slime': W_ / 'slime_04.ogg',
     'bubble': W_ / 'bubble_02.ogg', 'water': W_ / 'loop_water_02.ogg'}
SFX_GAIN = 7.0          # dB on every cue: the audit measured cues ~16 dB under the voice, inaudible on a phone (2026-10-12)
PAN_MAX = .6            # gentle: mono-compatible

# ---------------------------------------------------------------- time helpers (block starts, the hook's warp)
sys.path.insert(0, str(ROOT / 'tools/hyperframes_ep003'))
from blocks import span  # noqa  (read only: the blocks' time spans on the current narration)
B0 = {b: span(b)[0] for b in 'ABCDEFG'}


def _hook_warp():
    """build.py's piecewise-linear warp from the hook's authoring narration (v2) onto the current one."""
    def table(cues):
        t = {}
        for k, c in cues.items():
            t[k] = c['start']; t[k + '.end'] = c['end']
            for i, w in enumerate(c['words']):
                t[f'{k}.w{i + 1}'] = w['start']; t[f'{k}.w{i + 1}.end'] = w['end']
        t['DUR'] = round(cues['l07']['end'] + 1.5, 3)
        return t
    ep = ROOT / 'episodes/ep003'
    A = table(json.loads((ep / 'timings_v2.json').read_text())['cues'])
    N = table(json.loads((ep / 'timings.json').read_text())['cues'])
    lines = [f'l0{i}' for i in range(1, 9)]
    keys = sorted((k for k in A if k in N and k.split('.')[0] in lines and k != 'DUR'), key=lambda k: A[k])
    anc = [(0.0, 0.0)]
    for k in keys:
        a, n = A[k], N[k]
        if a > anc[-1][0] + .02 and n > anc[-1][1] + .02 and a <= A['DUR']:
            anc.append((a, n))
    anc.append((A['DUR'], N['DUR']))
    return anc


_ANC = _hook_warp()


def HK(t):
    for (a0, n0), (a1, n1) in zip(_ANC, _ANC[1:]):
        if t <= a1:
            return n0 + (t - a0) * (n1 - n0) / (a1 - a0)
    return t - _ANC[-1][0] + _ANC[-1][1]


def P(x):
    """pan from a frame x (0..1280 px)"""
    return float(np.clip((x - 640) / 640 * PAN_MAX, -PAN_MAX, PAN_MAX))


# ---------------------------------------------------------------- sounds
def synth(name):
    """Our own synths (free, made here). 'name:arg' passes a length in seconds."""
    rng = np.random.default_rng(3)
    base, _, arg = name.partition(':')
    a = float(arg) if arg else None
    env_t = lambda L: np.arange(L) / SR  # noqa
    if base in ('zip', 'zip_slack'):                                    # fishing line: a filtered noise sweep
        L = int((.32 if base == 'zip' else .25) * SR); t = env_t(L)
        n = rng.standard_normal(L)
        f0, f1 = (5500, 1800) if base == 'zip' else (1500, 700)
        out = np.zeros(L)
        for i in range(0, L, 512):                                       # moving band-pass, block by block
            f = f0 + (f1 - f0) * i / L
            b, a_ = ss.butter(2, [f * .7 / (SR / 2), min(.99, f * 1.3 / (SR / 2))], 'band')
            out[i:i + 512] = ss.lfilter(b, a_, n[i:i + 512])
        env = np.minimum(1, t / .02) * np.exp(-t * (6 if base == 'zip' else 10))
        return (out * env / (np.abs(out).max() + 1e-9)).astype(np.float32)
    if base == 'swell':                                                  # water rising: low noise swell + the water loop
        x = load('water')[:int(1.4 * SR)]
        L = len(x); t = env_t(L)
        b, a_ = ss.butter(2, 900 / (SR / 2))
        rum = ss.lfilter(b, a_, rng.standard_normal(L)); rum /= np.abs(rum).max()
        env = np.sin(np.pi * np.minimum(1, t / 1.4)) ** 1.5
        return ((x / (np.abs(x).max() + 1e-9) * .8 + rum * .5) * env).astype(np.float32)
    if base == 'drip':                                                   # a water drop: a fast upward pitch blip
        L = int(.09 * SR); t = env_t(L)
        f = 900 + 2600 * t / .09
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55)).astype(np.float32)
    if base in ('beep', 'beep_lo'):                                      # scope lock / thermometer / ECG monitor
        L = int(.075 * SR); t = env_t(L)
        f = 1650 if base == 'beep' else 980
        x = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)
        return (x / 1.25 * np.minimum(1, t / .004) * np.minimum(1, (t[-1] - t) / .01)).astype(np.float32)
    if base == 'flatline':                                               # the last beat never comes
        d = a or 1.3; L = int(d * SR); t = env_t(L)
        x = np.sin(2 * np.pi * 980 * t) + .25 * np.sin(2 * np.pi * 1960 * t)
        return (x / 1.25 * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .5)).astype(np.float32)
    if base in ('rise', 'fall'):                                         # mercury / progress rise; slide-whistle fall
        d = a or .7; L = int(d * SR); t = env_t(L); u = t / d
        f = (420 + 900 * u ** 1.4) if base == 'rise' else (1500 * (1 - u) ** 1.6 + 260)
        f = f * (1 + .012 * np.sin(2 * np.pi * 6 * t))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR)
        return (x * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .08) * .8).astype(np.float32)
    if base == 'deflate':                                                # air out of a balloon heart: hiss + falling whine
        d = a or .55; L = int(d * SR); t = env_t(L); u = t / d
        n = rng.standard_normal(L); out = np.zeros(L)
        for i in range(0, L, 512):
            f = 3200 - 2200 * i / L
            b, a_ = ss.butter(2, [f * .6 / (SR / 2), f * 1.4 / (SR / 2)], 'band')
            out[i:i + 512] = ss.lfilter(b, a_, n[i:i + 512])
        out /= np.abs(out).max() + 1e-9
        wh = np.sin(2 * np.pi * np.cumsum(520 - 300 * u + 30 * np.sin(2 * np.pi * 23 * t)) / SR)
        return ((out * .7 + wh * .35) * np.minimum(1, t / .02) * (1 - u) ** .8).astype(np.float32)
    if base == 'boop':                                                   # a comic poke
        L = int(.2 * SR); t = env_t(L)
        f = 700 * np.exp(-t * 5) + 260
        x = np.sin(2 * np.pi * np.cumsum(f) / SR)
        return (x * np.minimum(1, t / .006) * np.exp(-t * 14)).astype(np.float32)
    if base == 'rewind':                                                 # tape rewind chirps
        d = a or .4; L = int(d * SR); t = env_t(L); u = t / d
        f = 600 + 2600 * (u * 7 % 1)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .6 + rng.standard_normal(L) * .15
        return (x * np.minimum(1, t / .01) * np.minimum(1, (d - t) / .05)).astype(np.float32)
    if base in ('roll', 'fuse'):                                         # golf ball on the green / a lit fuse
        d = a or 1.0; L = int(d * SR); t = env_t(L); u = t / d
        n = rng.standard_normal(L)
        if base == 'roll':
            b, a_ = ss.butter(2, [120 / (SR / 2), 700 / (SR / 2)], 'band')
            x = ss.lfilter(b, a_, n); x /= np.abs(x).max() + 1e-9
            x *= (1 + .5 * np.sin(2 * np.pi * (14 - 10 * u) * t)) * (1 - u) ** 1.5
        else:                                                            # hiss + crackle
            b, a_ = ss.butter(2, 3500 / (SR / 2), 'high')
            x = ss.lfilter(b, a_, n) * .25
            cr = (rng.random(L) < 70 / SR).astype(float)
            cr = np.convolve(cr, np.exp(-np.arange(200) / 30), 'same') * (rng.random(L) * .8 + .2)
            x = x + cr * .9; x /= np.abs(x).max() + 1e-9
            x *= np.minimum(1, t / .05) * np.minimum(1, (d - t) / .1)
        return (x * np.minimum(1, t / .02)).astype(np.float32)
    if base == 'roulette':                                               # wheel whirr + the ball's ticks slowing down
        d = a or 1.0; L = int(d * SR); t = env_t(L); u = t / d
        b, a_ = ss.butter(2, [300 / (SR / 2), 2400 / (SR / 2)], 'band')
        wh = ss.lfilter(b, a_, rng.standard_normal(L)); wh /= np.abs(wh).max() + 1e-9
        x = wh * .25 * (1 - u) ** 1.2
        tk = load('chip'); tk = tk / (np.abs(tk).max() + 1e-9)
        # tick times: angle follows power3.out (1 - (1 - u)^3); one tick per pocket of a 24-pocket wheel, several turns
        turns = 5 * 24
        k = np.arange(1, turns)
        ut = 1 - (1 - k / turns) ** (1 / 3)
        for v in ut:
            i = int(v * d * SR)
            g = .35 * (1 - v) ** .5 + .1
            seg = tk[:min(len(tk), L - i)]
            x[i:i + len(seg)] += seg * g
        return (x / (np.abs(x).max() + 1e-9) * np.minimum(1, t / .03)).astype(np.float32)
    raise KeyError(name)


_CACHE = {}


def load(name):
    if name in _CACHE:
        return _CACHE[name]
    if name not in S:
        x = synth(name)
    else:
        x, sr = soundfile.read(str(S[name]), dtype='float32', always_2d=True)
        x = x.mean(1)
        x = ss.resample_poly(x, SR, sr).astype(np.float32) if sr != SR else x
    _CACHE[name] = x
    return x


# ---------------------------------------------------------------- the cue list
def cues():
    """(time s, sound, gain dB, pan -1..1). Gains are relative to full scale before SFX_GAIN and the voice-ducking."""
    c = []

    def a(t, name, db, pan=0.):
        c.append((float(t), name, float(db), float(pan)))

    def train(t0, t1, n, name, db, pan=0., ease=None, fade=0.):
        """n cues between t0 and t1; ease 'in' = accelerating (power2.in), 'out' = decelerating, 'ramp' = slow-fast-slow."""
        for k in range(n):
            u = k / max(1, n - 1)
            if ease == 'in':
                u = u ** .5
            elif ease == 'out':
                u = 1 - (1 - u) ** .5
            a(t0 + (t1 - t0) * u, name, db - fade * u, pan)

    # ================================================================== A · the hook (index.template.html; HK = v2 seconds)
    for t in (1.44, 1.86, 2.06):                                    # "How" "to" "Fish." drop in with a bounce
        a(HK(t) + .08, 'wood', -22)
    a(HK(3.0), 'whoosh', -28)                                       # the title shrinks up
    a(HK(3.2) - .05, 'whoosh', -20, -.45); a(HK(3.65), 'splash_s', -26, -.1)    # "A boat." slides in, settles in its wake
    a(HK(4.88), 'wood_m', -16); a(HK(4.92), 'creak', -26)           # "A rod." drops, springs
    LEAPS = [(40, 170, 0.00, -6), (1180, 1060, 0.12, -6), (120, 260, 0.22, 0), (1010, 1150, 0.36, 0)]
    for x0, x1, d, back in LEAPS:                                   # "A lot of fish." leaps: out-splash, in-splash
        t0 = HK(5.6 + d)
        a(t0 - .05, 'splash_s', -22 + back, P(x0)); a(t0 + .9, 'splash', -21 + back, P(x1))
    a(HK(5.78), 'splash_s', -24, P(940))                            # the companion leaps... freezes... drops
    a(HK(7.08), 'splash_b', -18, P(985))
    for x, t in ((640, 6.81), (560, 6.98), (720, 7.12), (800, 7.24)):   # the crew pops into the boat
        a(HK(t) + .12, 'pop', -20, P(x))
    a(HK(6.95), 'wood', -22)                                        # the boat dips under them
    a(HK(7.95), 'zip_slack', -30)                                   # the line casts out
    a(HK(8.3), 'bubble', -26, P(1010))                              # the companion peeks, unimpressed
    a(HK(10.06), 'whip', -16, .2)                                   # whip to the pair
    a(HK(10.24), 'cloth', -22, .25)                                 # the wind-up
    a(HK(10.5), 'whip', -16, .25)                                   # the swing
    a(HK(10.62), 'punch', -14, .25); a(HK(10.62), 'impact', -20, .25)   # SLAP (flash + shake)
    a(HK(10.8), 'sparkle', -26, .25)                                # KO stars
    # insert: the fish money (table, lantern)
    a(HK(12.38), 'whoosh', -22, -.4); a(HK(12.6), 'slime', -18, -.1)    # the fish slides onto the table
    for dt in (.2, .4, .5):                                          # the chips bounce down
        a(HK(12.7) + dt, 'chip', -22 + (dt > .3) * -5, .2)
    a(HK(12.9), 'coins', -20, .2); a(HK(12.82), 'pop', -24, .1)     # money marker
    # insert: the scope
    a(HK(14.06), 'whoosh', -24, -.3); a(HK(14.84), 'beep', -30); a(HK(15.08), 'beep', -28); a(HK(15.06), 'latch', -20)
    # numbers: the lake out of focus
    a(HK(16.48), 'wood', -24, -.2); a(HK(16.55), 'creak', -28, -.2)  # the $7.99 tag swings in on its string
    a(HK(17.8), 'pop', -22)                                          # "hoped" marker
    train(HK(19.3), HK(20.35), 9, 'tick', -26, ease='out')            # 0 -> 200,000 counts up
    a(HK(21.5), 'paper', -18)                                        # the red strike
    a(HK(22.0), 'whoosh', -28); a(HK(22.45), 'pop', -22)              # set aside, the big number pops
    train(HK(22.7), HK(24.7), 16, 'tick', -24, ease='out')            # the reel rolls to 10,000,000
    a(HK(24.8), 'stamp', -16); a(HK(24.8), 'impact', -22); a(HK(24.85), 'sparkle', -24); a(HK(25.0), 'pop', -24)
    # fleet: "Millions of people bought a fishing game."
    for i, (x, dt) in enumerate(((640, .15), (420, .5), (860, .6), (240, 1.0), (1040, 1.1), (120, 1.45), (1180, 1.55))):
        a(HK(25.95) + dt + .1, 'pop', -24 - (i > 2) * 3, P(x))
    a(HK(28.12), 'stamp', -16)                                       # "To do everything else." card slams
    for i in range(7):                                               # chaos in the boats, left to right
        t, x, kind = HK(28.3 + i * .2), 140 + i * 165, ('dynamite', 'chips', 'fish')[i % 3]
        if kind == 'dynamite':
            a(t, 'whoosh', -30, P(x)); a(t + .5, 'boom', -24, P(x))
        elif kind == 'chips':
            a(t, 'pop', -24, P(x)); a(t + 1.25, 'paper2', -30, P(x))
        else:
            a(t, 'splash_s', -28, P(x)); a(t + .65, 'splash_s', -28, P(x))
    a(HK(31.25), 'cloth', -28); a(HK(31.3), 'creak', -30)             # "Together." they lean in, the boat creaks
    # wordmark option 1 "The catch" (Producer, 2026-10-12): the line drops, reel clicks, bobber plop, slack, leaves
    w = T('l07.w2')
    a(w - .38, 'zip', -20)
    for i in range(9):
        a(w + .03 + .065 * i, 'click', -24 + i * .4)
    a(w + .2, 'splash_s', -28, P(900))                              # the companion bobs up, looks at the catch
    a(w + .55, 'bubble', -20); a(w + .56, 'wood', -30)              # the bobber dip (logo lands, small shake)
    a(w + 1.15, 'zip_slack', -28); a(w + 1.3, 'whoosh', -32)        # slack, the line leaves

    # ================================================================== B · the invitation (blockB.template.html)
    price, its, inv = T('l08.w4.end'), T('l08.w12'), T('l08.w14')
    a(price + .1, 'wood', -22, .2); a(price + .14, 'creak', -28, .2)     # the $7.99 tag swings in on its string
    a(T('l08.w6'), 'coins', -22, .2)                                  # "Eight dollars": a little gold punch
    a(T('l08.w8'), 'paper', -18, .2); a(T('l08.w8') + .02, 'knock', -24)   # "not": the red strike + camera kick
    a(T('l08.w11'), 'cloth', -28, -.2)                                # Quest leans in
    a(its, 'pluck', -18, .2)                                          # "It's": the string snaps
    a(its + .04, 'page', -20); a(its + .62, 'place', -22)             # the tag flips into an envelope, lands
    a(inv - .05, 'sparkle', -28)                                      # the shine
    a(inv, 'pop', -18); a(inv + .3, 'page2', -22); a(inv + .62, 'paper2', -24); a(inv + .78, 'select', -24)  # seal, flap, card, burst
    bec = T('l09.w1')
    a(bec - .04, 'whip', -16, -.3)                                    # whip out on "Because" / the stage whips in
    a(T('l09.w10') - .02, 'pop', -18); a(T('l09.w10') + .25, 'select', -26)   # "alone": one avatar, spotlit
    ev = T('l09.w11')
    a(ev - .05, 'switch', -18)                                        # "Everyone": the lights come up
    for x, d in ((296, 0), (755, .12), (984, .24)):                   # the others slide in
        a(ev + d, 'whoosh', -26, P(x))
    bt = T('l09.w14')
    a(bt - .2, 'splash', -22); a(bt - .1, 'wood_m', -24)               # the boat rises under them
    for i, x in enumerate((296, 525, 755, 984)):                       # they drop into their seats
        a(bt + .32 + i * .05, 'wood', -28, P(x))
    cp = T('l09.w18')
    for i, x in enumerate((296, 525, 755, 984)):                       # four game boxes rain down, one each
        a(cp - .18 + i * .13 + .3, 'thud', -22, P(x)); a(cp - .18 + i * .13 + .32, 'pop', -28, P(x))
    a(T('l09.w24') + .1, 'knock', -28, P(984)); a(T('l09.w24') + .26, 'knock', -30, P(984))   # the last box rattles
    way, msg = T('l09.w25'), T('l09.w27')
    a(way, 'whoosh', -22, .3); a(msg - .26, 'whip', -20)              # it spins to the centre and flips into the phone
    a(msg, 'select', -22)                                             # the phone lands
    a(T('l09.w30'), 'pop', -26)                                       # "group chat" header punch
    train(T('l09.w31.end') - .05, T('l09.w33') - .15, 3, 'tick', -30)  # typing dots
    for t in (T('l09.w33') - .08, T('l09.w34'), T('l09.w34') + .24, T('l09.w35'), T('l09.w36'), T('l09.w37')):
        a(t, 'key', -24)                                              # "It's eight dollars. Just get it." types in
    a(T('l09.w37') + .02, 'notify', -18)                              # sent: the bubble punches
    train(T('l10.w3'), T('l10.w6') - .15, 3, 'tick', -30)             # typing dots
    for i, k in enumerate(('l10.w6', 'l10.w7', 'l10.w8')):            # Bought. Bought. Bought. - bigger each time
        a(T(k) + .16, 'stamp', -20 + 3 * i, (-.15, .15, 0)[i]); a(T(k) + .18, 'notify', -20 + i)
    a(T('l10.w8') + .3, 'tick', -28)                                  # read receipt
    train(T('l11.w4'), T('l11.w6') - .15, 3, 'tick', -30)             # typing dots
    for k in ('l11.w6', 'l11.w7', 'l11.w8', 'l11.w9'):                # "I'll get it later." types in
        a(T(k), 'key', -26)
    a(T('l11.w9') + .2, 'notify', -24)
    # the FREEZE: nothing moves, nothing sounds
    train(T('l11.w10'), T('l11.w12') - .15, 3, 'tick', -32)           # "He": the dots come back...
    a(T('l11.w12'), 'drain', -26)                                     # ...vanish on "not"; Leo greys out
    a(T('l11.w12') + .12, 'bubble', -26, P(1045))                     # the fish peeks in at the frame edge

    # ================================================================== C · the adult way (blockC.template.html)
    now, cmp_, adl = T('l12.w1'), T('l12.w2'), T('l12.w8')
    a(now - .05, 'notify', -22)                                       # the lively chat keeps going
    a(now + .3, 'whoosh', -28, -.3); a(now + .32, 'pop', -22, -.1)    # a message flies in, the phone punches
    for i, x in enumerate((30, 500, 40, 540)):                        # stickers spill out of the phone
        a(now + .1 + i * .36 + .3, 'pop', -28, P(x + 200))
    a(cmp_ - .04, 'whoosh', -22, .2)                                  # "compare": the split wipes in
    a(cmp_ + .5, 'notify', -26, -.3); a(cmp_ + .82, 'pop', -26, -.2)   # the lively side keeps pinging
    a(adl - .3, 'notify', -28, -.3)
    a(adl - .05, 'whoosh', -24, .3)                                   # "adults": the silent side wins
    a(T('l12.w13') + .05, 'switch', -20, .3)                          # ...and the window goes dark
    for k, x in (('l13', 205), ('l14', 495), ('l15', 785), ('l16', 1075)):   # four phones, one line each
        a(T(k) - .06, 'notify', -18, P(x))
    a(T('l14.w2') + .1, 'pop', -22, .1)                               # "Definitely": the heart bounces
    a(T('l15.w4'), 'deflate', -22, .15)                               # "three weeks": the heart deflates
    a(T('l15.w5') + .3, 'wood', -24); a(T('l15.w5') + .4, 'wood', -30)  # the "3 WKS" chip drops
    a(T('l16.w3') + .05, 'pop', -26, .4); a(T('l16.w3') + .2, 'creak', -32, .4)   # a lone half-hearted thumb
    # calendar speed-ramp: 21 pages, slow - blur - slow
    t0, D = T('l17.w2') - .05, T('l17.w4') - T('l17.w2') + .05
    g = lambda u: u + .85 * np.sin(2 * np.pi * u) / (2 * np.pi)  # noqa
    for k in range(21):
        u = k / 21
        a(t0 + D * g(u), 'page' if k % 2 == 0 else 'page2', -24 - 6 * np.sin(np.pi * u))
    a(T('l17.w4'), 'stamp', -20); a(T('l17.w4') + .15, 'paper', -24)  # "later": the sticker, the circled day
    # thermometer
    sick = T('l17.w8')
    a(T('l17.w6') - .1, 'whoosh', -28)                                # the KID card slides up
    a(sick - .05, 'rise:0.7', -28)                                    # the mercury shoots up
    for i in range(3):                                                # fever: the thermometer beeps
        a(sick + .62 + i * .12, 'beep', -30)
    # the car's new noise
    a(T('l17.w10') - .05, 'whoosh', -28)                              # the CAR card drops
    a(T('l17.w9') - .1, 'rumble', -34)                                # idling
    nz = T('l17.w15')
    a(nz, 'clunk', -18); a(nz + .02, 'tin', -24); a(nz + .35, 'clunk', -21); a(nz + .1, 'poof', -22)
    # the plan dies in the chat
    train(T('l17.w18'), T('l17.w20') - .6, 4, 'tick', -32)            # typing dots ... and they vanish
    a(T('l17.w20') - .55, 'hud_off', -30)
    qt, dies = T('l17.w19') - .1, T('l17.w20')
    dur = dies + .7 - T('l17.w19')
    for x, k in ((110, 1), (260, 1), (380, .8), (560, .6), (960, .22)):   # the ECG: beats fading out
        a(qt + dur * (x + 20) / 1320, 'beep_lo', -24 + 20 * np.log10(k), P(x))
    a(qt + dur * (1000 + 20) / 1320, 'flatline:1.4', -32, .2)
    a(T('l17.w23') - .1, 'bubble', -26, -.2)                          # the fish cutaway pops up
    a(T('l17.w27'), 'scroll', -22); a(T('l17.w27') + .05, 'whoosh', -26)   # whip-scroll back...
    a(T('l17.w28') + .02, 'knock', -24); a(T('l17.w28') + .06, 'poof', -24)  # ...to the dusty first message
    # not distance
    a(T('l18') + .3, 'knock', -22, P(330)); a(T('l18.w3') + .3, 'knock', -22, P(960))   # two pins drop
    a(T('l18.w3') + .2, 'paper2', -28)                                # the route draws
    a(T('l18.w3') + .9, 'pop', -28); a(T('l18.w5') - .05, 'wood', -22)  # "60 min" marker; HARD slams
    dst = T('l18.w13')
    a(dst, 'whoosh', -26); a(dst + .3, 'knock', -20)                  # the pins snap together
    a(dst + .62, 'stamp', -14)                                        # stamped out
    # not even time
    a(T('l18.w14') - .1, 'whip', -16, .3)                             # whip pan in
    it2, tm = T('l18.w14'), T('l18.w17') + .14
    train(it2, tm, 18, 'tick', -26, ease='in')                        # the hands spin faster and faster
    for i in range(12):                                               # the alarm-clock rattle
        a(T('l18.w16') + i * .07, 'tin', -32)
    a(tm + .12, 'stamp', -14)
    # "asking": the cursor
    pr, adm, l18e = T('l18.w20'), T('l18.w24'), T('l18.end')
    train(pr, adm - .25, 14, 'key', -28)                              # "want to hang o" typed...
    train(adm, l18e + .1, 14, 'tick', -28)                            # ...backspaced letter by letter
    # the doorway
    ak = T('l19.w6')
    a(ak, 'step', -26); a(ak + .12, 'step2', -28)                     # a kid's feet arrive under the door
    a(T('l19.w9'), 'door_knock', -16); a(T('l19.w10'), 'door_knock', -18)   # knock, knock
    dr = T('l19.w13')
    a(dr - .1, 'door_open', -16); a(dr + .1, 'chime', -30)            # the door swings open, the light pours in
    a(T('l19.w16') - .04, 'paper2', -28)                              # "Want to play?" writes itself
    a(T('l19.w23'), 'whoosh', -24, .3)                                # "lost": the letters scatter like leaves
    nb = T('l19.w26')
    a(nb - .06, 'door_slam', -14); a(nb + .02, 'wood_m', -20)         # "Nobody": the door slams, the light cuts
    # "Eight dollars removes the asking."
    rm, ask2 = T('l20.w3'), T('l20.w5')
    train(rm, rm + .5, 10, 'key', -30)                                # it types itself
    a(rm + .6, 'click', -18); a(rm + .66, 'whoosh', -26); a(rm + .7, 'confirm', -24); a(rm + .95, 'tick', -28)
    a(ask2 + .04, 'stamp', -14); a(ask2 + .04, 'punch', -22)          # $7.99 stamps out "asking"

    # ================================================================== D · why fishing (blockD.template.html)
    d0 = B0['D']
    a(d0 + .22, 'bubble', -18); a(d0 + .24, 'splash_s', -26)          # the bobber drops
    a(T('l21.w2') + .05, 'stamp', -18); a(T('l21.w3') + .05, 'stamp', -14)   # WHY / FISHING? slam
    of = T('l21.w4')
    a(of - .2, 'whoosh', -28); a(of - .05, 'pop', -22)                # the title shrinks, the slot machine pops
    train(of, T('l21.w12') - .1, 14, 'tick', -28, ease='out')         # the reels spin
    for k, pn in (('l21.w10', -.25), ('l21.w11', 0), ('l21.w12', .25)):   # ...and stop, one by one
        a(T(k), 'clunk', -20, pn)
    a(T('l21.w12') + .05, 'jackpot', -24); a(T('l21.w12') + .1, 'coins', -20)   # on the fish
    l22 = T('l22')
    a(l22 - .42, 'whoosh', -24)                                       # the slot leaves
    a(l22 - .4, 'whoosh', -26, .45); a(l22 + .45, 'splash_s', -28, .3)   # the boat sails in
    a(l22 - .05, 'whoosh', -26, -.45)                                 # the chat panel slides in
    for i in range(3):
        a(T('l22.w1') + .45 + i * .14, 'pop', -28, -.4)                # Bought. Bought. Bought. (mini)
    a(T('l22.w3') + .06, 'stamp', -18, -.4)                           # $7.99 stamp
    a(T('l22.w5'), 'pop', -24, .4); a(T('l22.w5') + .12, 'pop', -26, .45)   # two empty seats
    a(T('l22.w8'), 'paper2', -28, -.4)                                # "how to meet" marker
    a(T('l22.w10') + .07, 'stamp', -14, -.4)                          # OK stamp on "meet"
    a(T('l22.w11'), 'paper2', -28, .4); a(T('l22.w11'), 'question', -24, .4)   # "what to do": the "?"
    a(T('l22.w16'), 'whoosh', -20)                                    # "there.": zoom through to the photo
    # the polaroid
    l23 = T('l23')
    a(l23 + .3, 'place', -20)
    a(T('l23.w5') - .2, 'page', -22)                                  # it flips
    a(T('l23.w11') + .4, 'squish', -30, .2)                           # rack focus: the fish, offended
    for k in ('l23.w16', 'l23.w17', 'l23.w19', 'l23.w20'):            # the faces get circled
        a(T(k) - (.08 if k == 'l23.w19' else 0), 'paper2', -28)
    # calm cuts on the lake
    a(T('l24.w14') - .3, 'pop', -26)                                  # an empty speech bubble pops...
    a(T('l24.w16'), 'deflate', -26)                                   # ...and deflates
    pov0 = T('l24.w22') - .15
    a(pov0 + .05, 'bubble', -24); a(pov0 + .4, 'bubble', -30)          # POV: the fish rises and looks up
    a(T('l24.w27') + .75, 'drip', -26, -.2); a(T('l24.w31') + .35, 'drip', -28, -.2)   # drops off the oar
    for k in ('l24.w34', 'l24.w37'):                                  # the bobber dips twice
        a(T(k), 'bubble', -22, -.35)
    rs = T('l24.w39')
    a(rs - .45, 'splash_s', -22, -.35)                                # the fish surfaces
    a(rs + .22, 'wood', -22, -.35); a(rs + .25, 'creak', -28, -.35)   # "a reason" tag lands on it, swings
    a(T('l24.w42') - .1, 'pop', -24)                                  # the empty bubble again...
    a(T('l24.w44') + .02, 'latch', -18, .2)                           # ...a name badge clips onto it: "job."
    # the evidence board
    d5 = T('l25') - .2
    a(d5, 'whip', -14, -.2)
    a(T('l25.w7') + .03, 'stamp', -16); a(T('l25.w7') + .12, 'click', -24)   # ALIBI header slaps on, pinned
    a(T('l25.w11') - .25, 'whoosh', -26, -.4)                         # the golf polaroid grows into the frame
    a(T('l25.w11'), 'roll:1.05', -26); a(T('l25.w11') + 1.05, 'wood', -32, .05)   # the ball rolls to the lip... stops
    a(T('l25.w14') - .1, 'whip', -16)                                 # whip to poker
    nt = T('l25.w16')
    for j in range(6):                                                # the chip stack topples
        a(nt + .38 + j * .05, 'chip', -24 - j, .1 + j * .04)
    a(nt + .3, 'coins', -20)
    a(T('l25.w17') - .1, 'whip', -16)                                 # whip to the garage
    tl0, tl1 = T('l25.w23') - .25, T('l25.w26') + .2
    train(tl0, tl1, 22, 'tick', -30, ease=None)                       # the time-lapse clock
    a(T('l25.w27') - .05, 'whoosh', -26); a(T('l25.w27') + .45, 'place', -24)   # back into its polaroid
    for k, x in (('l25.w36', 320), ('l25.w38', 640), ('l25.w41', 960)):   # three red X's
        a(T(k) + .04, 'stamp', -18, P(x))
    a(T('l25.w42') + .25, 'pop', -24)                                 # the empty 4th pin
    for t in (T('l25.w43'), T('l25.w45') - .3, T('l25.w45') + .1):    # red strings link them
        a(t, 'zip_slack', -30)
    a(T('l25.w48'), 'question', -26)                                  # "excuse": the "?" wobbles
    l26 = T('l26')
    a(l26 + .29, 'wood_m', -14); a(l26 + .32, 'paper', -28); a(l26 + .4, 'click', -24)   # the phone slams onto the board
    a(T('l26.w7') + .04, 'stamp', -16)                                # NEWEST
    a(T('l26.w9') - .05, 'whoosh', -28)                               # back to the lake for a breath
    for i in range(4):
        a(T('l26.w9') + i * .04 + .1, 'pop', -30)
    a(T('l26.w10'), 'whoosh', -22)                                    # "fits": the lake shrinks into the chat
    a(T('l26.w10') + .6, 'tick', -28)
    a(T('l26.w14'), 'notify', -16)                                    # "chat.": ping

    # ================================================================== E · the alibi falls apart (blockE.template.html)
    e0 = B0['E']
    pr = T('l27.w9')
    a(pr - .05, 'whoosh', -26, -.3); a(pr + .4, 'place', -20, -.3); a(pr + .5, 'paper2', -30, -.3)   # the props list drops in
    for k in ('l27.w11', 'l27.w13', 'l27.w15'):                       # three ticks, each answered by the world
        a(T(k), 'click', -16, -.3)
    a(T('l27.w11') + .1, 'wood', -24); a(T('l27.w13') + .1, 'pluck', -24, .2); a(T('l27.w15'), 'bubble', -26, P(730))
    a(T('l28.w2') + .4, 'tension', -32, -.3)                          # anticipation: the trembling hold
    yt = T('l28.w9')
    a(yt, 'whip', -16, .2); a(yt + .1, 'whoosh', -22, .4)             # YEET
    a(yt + .56, 'splash', -21, .45)
    a(yt + .85, 'bubble', -24, .45)                                   # the fish surfaces wearing it
    # the game world (HUD on)
    a(T('l29') - .02, 'hud_on', -26)
    a(T('l29.w5'), 'drop', -24, -.3)                                  # "almost nothing.": one seashell (a feeble plop)
    b6 = T('l29.w6') - .1
    a(b6 + .2, 'plank', -18); a(b6 + .4, 'plank', -28)                # the shop board drops (bounce)
    a(T('l29.w9') - .1, 'stamp', -22); a(T('l29.w9'), 'clunk', -18, -.15)   # SOLD, the pistol slams into its slot
    a(T('l29.w10'), 'whoosh', -28, -.4)                               # the seashell gets kicked out
    a(T('l29.w10') - .06, 'stamp', -22); a(T('l29.w10') + .04, 'clunk', -18, -.3)   # the shotgun
    a(T('l29.w11'), 'clunk', -16); a(T('l29.w11'), 'impact', -22)     # dynamite (shake)
    a(T('l29.w12') - .35, 'whoosh', -26)                              # the board leaves
    a(T('l29.w12') - .1, 'wood', -24, P(225))                         # the SELL crate pops up
    a(T('l29.w13'), 'whoosh', -28, -.1); a(T('l29.w13') + .6, 'slime', -18, P(225))   # a fish into the crate
    a(T('l29.w15'), 'money', -20); a(T('l29.w15') + .05, 'coins', -24)  # +$1,250
    a(T('l29.w17') - .15, 'whoosh', -26)                              # the roulette drops in
    sp0 = T('l29.w17') - .1
    a(sp0, 'roulette:%.2f' % (T('l29.w19') + .05 - T('l29.w17') + .3), -22)
    a(T('l29.w17'), 'pop', -26, .35)                                  # the Wallet
    a(T('l29.w19') + .05, 'drain', -18); a(T('l29.w19') + .3, 'leather', -18, .35)   # money to 0, the Wallet faints
    w21 = T('l29.w21')
    a(w21 - .2, 'rumble', -16); a(T('l29.w22'), 'lowboom', -18)        # a boss shadow passes under the boat
    a(T('l29.w22'), 'forcefield', -28); a(T('l29.w22') + .4, 'splash_s', -28, .4)
    a(T('l29.w23') - .05, 'hud_off', -28)
    # the developers' own description, verbatim
    a(T('l29.w26'), 'pop', -24); a(T('l29.w30'), 'wood', -24)
    for i in range(33, 41):                                           # "cartoon violence towards fish and gambling..."
        a(T(f'l29.w{i}') - .02, 'key', -24, (-.15, .15)[i % 2])
    a(T('l29.w34') + .3, 'impact', -28)                               # "violence" shakes
    a(T('l29.w40') + .2, 'pop', -26)
    a(T('l29.w43') + .28, 'knock', -20, .15)                          # "(no real money)." drops in small and late
    # the goal
    a(T('l30.w1') + .45, 'wood', -22, .4); a(T('l30.w1') + .5, 'creak', -28, .4)   # the GOAL tag swings in
    a(T('l30.w5'), 'drip', -28, .4)                                   # the fish sweats
    a(T('l30.w12'), 'paper', -18, .4)                                 # "point.": GOAL struck
    a(T('l30.w17'), 'stamp', -14)                                     # ALIBI
    a(T('l30.end') + .2, 'splash_s', -24, .55)                        # the fish swims off
    a(T('l31.w9'), 'stamp', -12); a(T('l31.w9'), 'impact', -20); a(T('l31.w9') + .05, 'error', -26)   # FAILURE
    # the failure run (HUD on, FAIL xN)
    a(T('l32') - .06, 'hud_on', -26)
    a(T('l32.w2'), 'whoosh', -24, .3)                                 # someone falls...
    a(T('l32.w5') - .06, 'splash_b', -14, .4)                         # ...in the water
    fz0, fz1 = T('l32.w5') + .1, T('l32.w6') - .2
    a(fz0, 'click', -20); a(fz0 + .05, 'error', -22)                  # freeze frame, FAIL x1
    a(fz1, 'splash_s', -28, .4); a(fz1 + .2, 'bubble', -26, .4)       # unfreeze, he sinks
    a(T('l32.w6') - .12, 'whip', -16, .3)
    a(T('l32.w7'), 'chime', -24, -.1)                                 # a weapon, in holy light
    a(T('l32.w9'), 'wood', -22, -.1)
    a(T('l32.w9'), 'fuse:%.2f' % (T('l32.w16') - T('l32.w9')), -30, -.1)   # the fuse sizzles
    a(T('l32.w12') - .02, 'whip', -20); a(T('l32.w12'), 'impact', -18)   # crash zoom on "clearly"
    a(T('l32.w16') + .05, 'error', -22, .3)                           # deadpan fish, FAIL x2
    a(T('l32.w17') - .12, 'whip', -16, .3)                            # whip to the casino
    a(T('l32.w18'), 'coins', -16, -.2); a(T('l32.w18') + .1, 'pop', -24)   # all in
    a(T('l32.w17') - .08, 'roulette:%.2f' % (T('l32.w20') + .04 - T('l32.w17') + .3), -20, .1)
    a(T('l32.w20'), 'drain', -18); a(T('l32.w20') + .06, 'error', -22)  # -$3,480, FAIL x3
    a(T('l32.w22') - .12, 'whip', -16, .3)                            # the pointing loop
    for i, k in enumerate(('l32.w23', 'l32.w24', 'l32.w25')):
        a(T(k) - .08, 'whip', -22 - i, .2)
    for i in range(4):
        a(T('l32.w22') + .1 + i * .3, 'pop', -30, (-.3, .3)[i % 2])
    a(T('l32.w26') - .06, 'whoosh', -20)                              # the camera spins round to "was."
    a(T('l32.w29') - .12, 'whip', -16, .3)
    l31 = T('l32.w31')
    a(l31, 'launch', -20, .3); a(l31, 'splash', -20, .5)              # launched across the island
    a(T('l32.w36') - .12, 'rewind:0.45', -24)                         # rewind to the water...
    a(T('l32.w36') + .12, 'creak', -16, .45); a(T('l32.w36') + .2, 'rumble', -24, .45)   # ...a giant eye opens
    a(T('l32.w38'), 'squish', -30, .45)                               # the iris looks
    a(T('l32.w42'), 'boop', -16, .4); a(T('l32.w42') + .02, 'squish', -24, .45)   # "poked.": boop
    a(T('l32.w42') + .12, 'error', -24)                               # FAIL x4
    a(T('l32.end') + .04, 'whip', -20, -.4); a(T('l32.end') + .26, 'splash_s', -28, -.55)   # the distant splash
    # the slap revive
    a(T('l33.w6') - .1, 'thud', -18); a(T('l33.w6') + .12, 'wood', -26)   # he goes down; the boat bumps
    a(T('l33.w6') + .05, 'lowdown', -28); a(T('l33.w6') + .12, 'sparkle', -28)   # the last heart empties, KO stars
    a(T('l33.w10'), 'select', -26)                                    # [E] Pick up
    a(T('l33.w15'), 'cloth', -22)                                     # picked up, wobbly
    a(T('l33.w17') + .05, 'cloth', -24, .15); a(T('l33.w17') + .1, 'select', -28)   # [E] Slap; the hand winds back
    hit = T('l33.w19') + .02
    a(hit - .1, 'whip', -12, .1)
    a(hit, 'punch', -13, .1); a(hit, 'impact', -19, .1)               # SLAP: flash, hitstop, shake
    a(hit + .1, 'squish', -20, .1)
    a(hit + .25, 'powerup', -24)                                      # the heart refills
    a(T('l33.w21'), 'done', -20, -.2)                                 # REVIVED!
    # how friendships handle feelings
    a(T('l34.w4') + .1, 'squish', -22, .1)                            # the handprint
    for k in ('l34.w6', 'l34.w7', 'l34.w8', 'l34.w9', 'l34.w10'):
        a(T(k) - .04, 'pop', -28)
    # years later, the same group chat
    a(T('l35') + .35, 'place', -20, -.1)                              # the "perfect" polaroid drops
    a(T('l35.w7'), 'drain', -30)                                      # ...greyed out
    a(T('l35.w8') + .1, 'whoosh', -26, -.4)                           # it slides away
    for k, x in (('l35.w11', 450), ('l35.w12', 790), ('l35.w13', 500), ('l35.w14', 820)):   # four fail frames slam
        a(T(k) + .02, 'place', -18, P(x)); a(T(k) + .02, 'wood', -28, P(x))
    a(T('l35.w15'), 'switch', -24)                                    # the lamp flickers
    train(T('l35.w17'), T('l35.w17') + 1.0, 6, 'tick', -24, ease='out')   # 2026 -> 2031
    a(T('l35.w18'), 'pop', -24); a(T('l35.w17') + 1.05, 'pop', -26)
    a(T('l35.w23') - .15, 'whoosh', -26)                              # the phone slides up
    a(T('l35.w23') + .15, 'tick', -28); a(T('l35.w24'), 'notify', -24)   # date, "joined"
    a(T('l35.w26'), 'notify', -18)                                    # "context,": the lone message
    train(T('l35.w29'), T('l35.w32') - .15, 4, 'tick', -32)           # the new member types...
    a(T('l35.w32') + .05, 'notify', -22)                              # "what?"
    a(T('l35.w34'), 'tick', -26)                                      # seen

    # ================================================================== F · friendslop and the Tuesday night (blockF.template.html)
    a(T('l36.w2') + .2, 'wood', -22, -.15); a(T('l36.w2') + .24, 'creak', -28, -.15)   # the blank tag drops in, swings
    a(T('l36.w10'), 'clunk', -16); a(T('l36.w10') + .05, 'tin', -26)   # a spotlight clunks on over the trash can
    slop = T('l36.w11')
    a(slop - .14, 'page', -20); a(slop + .16, 'stamp', -18)           # the tag flips: FRIENDSLOP
    a(T('l36.w12') + .12, 'sparkle', -22, -.1)                        # "Half a joke": FRIEND goes gold
    a(T('l36.w15'), 'deflate:0.5', -26, .1)                           # "half an insult": SLOP sags...
    for i in range(4):                                                # ...and drips
        for k in range(2):
            at = T('l36.w17') + .2 + i * .31 + k * 1.25 + .55
            if at < T('l38.w1') - .3:
                a(at, 'drip', -30 - 2 * k, .15)
    for k, x in (('l36.w18', 470), ('l36.w19', 690), ('l36.w20', 930)):   # three stickers slap on
        a(T(k) + .02, 'squish', -18, P(x - 200)); a(T(k) + .04, 'paper2', -28, P(x - 200))
    for i in range(4):                                                # four friend discs pop
        a(T('l36.w24') + i * .17 + .1, 'pop', -26, -.2 + i * .13)
    a(T('l37.w1'), 'hud_off', -30)                                    # the discs leave
    gb = T('l37.w10')
    a(gb, 'tin', -17, .4); a(gb + .02, 'whoosh', -26, .45)            # "garbage": the lid flips off
    a(gb + .98, 'tin', -20, .55); a(gb + 1.08, 'tin', -28, .55)       # ...lands, bounces
    a(gb + .35, 'slime', -28, .4)                                     # the fish rises out of the can
    a(T('l37.w13') - .3, 'whoosh', -28)                               # the tag leaves
    for k, d in (('A', 0), ('B', .06), ('P', .1), ('Q', .16)):        # the four slide in
        a(T('l37.w13') + d, 'whoosh', -28, {'A': -.4, 'B': .4, 'P': -.5, 'Q': .5}[k])
    a(T('l37.w15'), 'squish', -20, .4); a(T('l37.w15') + .02, 'cloth', -20, .4); a(T('l37.w15') + .1, 'tin', -30, .4)   # squeeze!
    a(T('l37.w17') + .09, 'tin', -22, .4); a(T('l37.w17') + .1, 'pop', -30, .4)   # the lid lands on the fish like a hat
    so = T('l38.w1')
    a(so - .36, 'whip', -16, -.2)                                     # whip out to summer
    a(so + .1, 'pop', -24)                                            # PLAYTIME bar
    a(so + .3, 'rise:%.2f' % (T('l38.w4') - so - .35), -32)           # it fills
    sh = T('l38.w4')
    a(sh, 'drain', -20); a(sh + .02, 'creak', -30)                    # "short.": it drains red, the hourglass flips
    a(sh + .4, 'buzzer', -26)                                         # time's up (shake + flash)
    a(T('l38.w5') - .2, 'whoosh', -22, -.45)                          # the bar flies off
    a(T('l38.w5') + .25, 'plank', -18, .25); a(T('l38.w5') + .5, 'plank', -30, .25)   # the calendar drops (bounce)
    a(T('l38.w9') - .1, 'chime', -28, .25)                            # the sun rises
    for i in range(3):                                                # "summer": three pages tear off
        a(T('l38.w11') - .04 + i * .09, 'paper' if i % 2 == 0 else 'paper2', -22, .25 + (-.2, .1, .3)[i])
    a(T('l38.w12') + .2, 'stamp', -16, .25)                           # "hit.": #1
    a(T('l39.w8'), 'switch', -20, -.3)                                # the lantern clicks on (rest beat)
    a(T('l40.w8') + .1, 'cloth', -28)                                 # the crew squeezes together
    a(T('l40.w13'), 'wood', -24); a(T('l40.w13') + .05, 'splash_s', -30)   # the boat dips
    a(T('l40.w16') - .1, 'notify', -18, .1)                           # "Tuesday": the group-chat banner
    pl = T('l40.w19')
    a(pl + .26, 'wood', -22, .4); a(pl + .3, 'creak', -28, .4)        # "☐ FISH" pins to the rod
    for t in np.arange(pl - .1, T('l40.end') + .5, .26):              # Leo juggles dynamite behind (catches)
        a(t, 'wood', -36, -.25)
    a(T('l40.w22') + .05, 'creak', -28, .4)                           # "fish.": the empty box wobbles
    a(T('l40.w26') + .12, 'bubble', -26, .4)                          # hard cut: the fish yawns on the rod
    # the living room at 1 AM: the clock wheel
    for i, t in enumerate((T('l41.w6'), T('l41.w14') + .05, T('l41.w16') + .38, T('l41.w19'))):
        a(t - .02, 'clunk', -20 + i, -.1); a(t, 'tick', -24)
        for j in range(2 + i):                                        # snacks multiply
            a(t + .1 + j * .07, 'pop', -30, (-.4, .4, -.2, .2, 0, .3)[j])
    a(T('l41.w13') - .17, 'pop', -24, -.2)                            # "last round." marker
    a(T('l41.w16'), 'paper', -18, -.2)                                # "never": LAST struck
    # the founders in three page-turns
    bk = T('l42.w1') - .12
    a(bk, 'page', -21)
    a(T('l42.w3') + .1, 'place', -22, -.3); a(T('l42.w3') + .3, 'place', -24, .3)   # two photos
    a(T('l42.w6') + .1, 'squish', -20); a(T('l42.w6') + .12, 'paper2', -28)   # FOUNDERS sticker
    a(T('l42.w12') - .05, 'paper2', -28); a(T('l42.w12') + .6, 'pop', -28)    # the doodle heart
    a(T('l42.w14'), 'paper', -28)                                     # "high school" circled
    a(T('l42.w16') - .32, 'page2', -18)                               # page turn 1
    a(T('l42.w17') + .25, 'paper2', -30)                              # the chart line draws up...
    a(T('l42.w21'), 'fall:%.2f' % (T('l42.w23') - T('l42.w21') + .1), -26)   # ...and crashes off the bottom
    a(T('l42.w23') + .12, 'thud', -20); a(T('l42.w23') + .15, 'pop', -26)     # oops
    a(T('l42.w24') - .3, 'page', -18)                                 # page turn 2
    a(T('l42.w24') + .1, 'pluck', -22); a(T('l42.w24') + .8, 'latch', -24)   # the line bounces back, the hook
    a(T('l42.w28') - .1, 'paper2', -30)                               # the boat doodle draws on
    a(T('l42.w34') - .04, 'squish', -18, .2); a(T('l42.w34') - .06, 'whip', -26, .2)   # "silly": B slaps A
    a(T('l42.w35'), 'sparkle', -26)                                   # little hearts
    # one phone -> millions of phones
    g0 = T('l42.end') + .18
    a(g0 + .14, 'stamp', -20); a(g0 + .16, 'notify', -22)             # "Bought."
    a(T('l43.w2'), 'whoosh', -22)                                     # the exponential zoom out
    rng = np.random.default_rng(43)
    for k in range(14):                                               # each ring of phones pops in
        u = (k / 13) ** .5
        a(T('l43.w2') + (T('l43.w5') + .25 - T('l43.w2')) * u, 'pop', -30 - 2 * u, float(rng.uniform(-.55, .55)))
    train(T('l43.w4'), T('l43.w7') - .1, 14, 'tick', -26, ease='out')  # the reel to 10,000,000+
    a(T('l43.w7'), 'stamp', -18); a(T('l43.w7') + .05, 'sparkle', -26)
    gp = T('l43.w8') + .02
    for i, pn in enumerate((-.55, -.3, -.1, .1, .3, .55)):            # "group": every screen pings at once
        a(gp + i * .012, 'notify', -24, pn)
    a(gp, 'confirm', -24)
    # "chat.": hard cut to the black lake - stillness

    # ================================================================== G · payoff + end (blockG.template.html)
    hit = T('l44.w13') + .3                                           # one drop falls on "fish?"; the ripple breaks the text
    a(hit, 'drip', -18, P(760)); a(hit + .02, 'splash_s', -30, P(760))
    nb = T('l45.w2')
    a(nb, 'splash_s', -22, P(930)); a(nb + .1, 'bubble', -28, P(930))  # the fish surfaces, hopes
    a(T('l45.w6'), 'pop', -26, .1)                                    # the Fish-o-dex card
    a(T('l45.w9') + .5, 'splash_s', -26, P(930))                      # a hopeful little hop
    a(T('l46.w9') - .55, 'hud_off', -32, .1)
    a(T('l46.w9') - .1, 'pop', -24, P(330))                           # "fishing tuesday?" from the boat
    a(T('l46.w11') + 1.32, 'bubble', -22, P(930))                     # it sinks; one bubble
    for k in ('l47.w1', 'l47.w2', 'l47.w3'):                          # the hook's title, small and slow
        a(T(k) + .15, 'wood', -28)
    a(T('l47.w7') + .1, 'pop', -22)                                   # TUTORIAL?
    a(T('l47.w9'), 'cloth', -30)                                      # the shrug
    a(T('l47.w11') + .3, 'sparkle', -30, -.1)                         # a shooting star
    f48 = T('l48.w4')
    a(f48 - .04, 'paper', -18); a(f48 + .18, 'creak', -28)            # FISH struck, comes loose...
    a(f48 + .87, 'splash', -18, P(880))                               # ...and drops into the lake
    l49 = T('l49')
    a(l49 - .02, 'hud_on', -28)                                       # the chat box
    a(T('l50.w4'), 'key', -24)                                        # "I"
    for k in range(5):
        a(T('l50.w5') - .06 + k * .045, 'key', -26)                   # "miss"
    for k in range(4):
        a(T('l50.w6') + k * .05, 'key', -26)                          # " you"
    for k in range(10):                                               # hesitation... backspace
        a(T('l50.w8') + k * .05 - k * k * .0015, 'tick', -26)
    for k in range(13):                                               # "boat tonight?"
        a(T('l50.w9') - .05 + k * .05, 'key', -28)
    snt = T('l50.w12')
    a(snt - .1, 'click', -18); a(snt, 'whoosh', -26); a(snt + .02, 'confirm', -24)   # sent
    a(snt + .5, 'notify', -16)                                        # "Bought."
    # the CTA: ghosts in the empty seats; the wordmark rises from the lake
    for d in (-.02, .16):
        a(T('l51.w8') + d + .1, 'poof', -28, -.45)
    a(T('l51.w8') + .05, 'wood', -28, -.45)
    # wordmark option 2 "Rising from the lake": the water swells, drips fall, the fish surfaces with a small bubble
    w = T('l51.w14')
    a(w - .05, 'swell', -18); a(w + .05, 'splash_s', -26)
    for i, dt in enumerate((.75, .95, 1.2, 1.5, 1.85)):
        a(w + dt, 'drip', -28 - 2 * (i % 2), (-.2, .2, -.1, .15, 0)[i])
    a(w + .95, 'wood', -30); a(w + .95, 'bubble', -22); a(w + 1.0, 'splash_s', -30)   # the bar settles; the fish surfaces
    tell = T('l51.w16')
    a(tell, 'whoosh', -28, -.3); a(tell + .18, 'select', -24, -.4); a(tell + .32, 'select', -24, .45)   # CONTINUE? menu
    a(T('l51.w20'), 'click', -24, .45)                                # the cursor on JOIN
    q = T('l52.w5')
    a(q + .04, 'pop', -22); a(q + .82, 'whoosh', -28)                 # "quest.": WOW, then the dive
    spl = q + .82 + .5
    a(spl, 'splash', -18); a(spl + .05, 'sparkle', -26, -.2); a(spl + .55, 'done', -20, -.4)   # the splash lights NEXT QUEST
    return c


def night():
    """Crickets (looped): Quest's room at night (B1); the "almost nothing" gag (E3); the blue-hour lake + 1 AM; G."""
    return [(B0['B'], T('l09.w1'), -42), (T('l29.w5'), T('l29.w6') - .1, -32),
            (T('l39.w6'), T('l41') - .1, -36), (B0['G'], T('l52.end') + 2.5, -37)]


def ambience():
    """A low water bed under the lake scenes (looped CC0), by block."""
    return [(0, HK(12.1), -34), (HK(14.06), T('l07.end') + 1.4, -38),            # A (not the table insert)
            (T('l09.w14') - .2, T('l09.w27'), -38),                               # B2: the boat on the stage
            (B0['D'], T('l25') - .2, -34), (T('l26.w9') - .05, T('l26.w10') + .6, -36),   # D: lake; the breath
            (B0['E'], T('l29.w23'), -35), (T('l30') - .04, T('l35') - .06, -36),  # E: the lake world
            (T('l39') - .02, T('l41') - .03, -34), (T('l43.w9'), B0['G'], -44),   # F: dusk/blue hour; the black lake
            (B0['G'], T('l52.end') + 2.5, -33)]                                   # G: the night lake


def rooms():
    """Other room tones: the doorway yard (wind), the 1 AM living room (TV hum)."""
    return [('wind', T('l19.w13'), T('l19.w26'), -40), ('tvhum', T('l41') - .03, T('l42.w1') - .1, -42)]


# ---------------------------------------------------------------- mix
def pan_gains(p):
    th = (p + 1) * np.pi / 4
    return np.cos(th) * np.sqrt(2), np.sin(th) * np.sqrt(2)


def bed(fx, name, t0, t1, db, n, fade_s):
    x = load(name)
    i0, i1 = max(0, int(t0 * SR)), min(n, int(t1 * SR))
    L = i1 - i0
    if L <= 0:
        return
    fade = np.minimum(1, np.minimum(np.arange(L), L - np.arange(L)) / (fade_s * SR))
    off = len(x) // 2                                                   # R = the loop half a cycle on: a wide, mono-safe bed
    for ch, o in ((0, 0), (1, off)):
        src = np.roll(x, -o)
        fx[ch, i0:i1] += np.tile(src, L // len(src) + 1)[:L] * 10 ** (db / 20) * fade


HEADROOM = 7.0          # dB: the SFX bus never peaks closer than this to the voice's peak (stacked hits get caught here)


def bus_limit(fx, ceil):
    """A transparent safety limiter on the SFX bus (both channels linked): 2 ms attack window, ~60 ms release."""
    from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
    a = np.abs(fx).max(0)
    pk = maximum_filter1d(a, int(.004 * SR))
    g = np.minimum(1, ceil / (pk + 1e-9)).astype(np.float32)
    g = minimum_filter1d(g, int(.03 * SR))                              # hold, then smooth (never above the raw need)
    g = np.minimum(g, uniform_filter1d(g, int(.03 * SR), mode='nearest')).astype(np.float32)
    return g


def main():
    narr, sr = soundfile.read(str(ROOT / 'public/episodes/ep003/audio/narration.wav'), dtype='float32')
    assert sr == SR
    n = len(narr)
    fx = np.zeros((2, n), np.float32)
    rng = np.random.default_rng(2026)
    seen, per_cue = {}, []
    cl = sorted(cues())
    for t, name, db, pan in cl:
        x = load(name)
        seen[name] = seen.get(name, 0) + 1
        if seen[name] > 1:                                               # repeats never machine-gun: +-3 semitones, +-2 dB
            r = 2 ** (rng.uniform(-3, 3) / 12)
            x = np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x).astype(np.float32)
            db += rng.uniform(-2, 2)
        x = x * 10 ** ((db + SFX_GAIN) / 20)
        i = int(t * SR)
        if 0 <= i < n:
            gl, gr = pan_gains(max(-PAN_MAX, min(PAN_MAX, pan)))
            seg = x[:n - i]
            fx[0, i:i + len(seg)] += seg * gl
            fx[1, i:i + len(seg)] += seg * gr
            per_cue.append((t, name, float(np.abs(seg).max() * max(gl, gr))))
    for t0, t1, db in ambience():
        bed(fx, 'water', t0, t1, db, n, .6)
    for t0, t1, db in night():
        bed(fx, 'crickets', t0, t1, db, n, 1.2 if t1 - t0 > 3 else .25)
    for name, t0, t1, db in rooms():
        bed(fx, name, t0, t1, db, n, .5)
    tm = json.loads((ROOT / 'episodes/ep003/timings.json').read_text())['cues']
    duck = np.ones(n, np.float32)                                         # -4 dB under spoken words
    for c in tm.values():
        for w in c['words']:
            duck[int(w['start'] * SR):int(w['end'] * SR)] = 10 ** (-4 / 20)
    duck = np.convolve(duck, np.ones(int(.05 * SR)) / int(.05 * SR), 'same').astype(np.float32)
    fx *= duck
    lim = bus_limit(fx, np.abs(narr).max() * 10 ** (-HEADROOM / 20))
    if lim.min() < .99:
        i = int(np.argmin(lim)); print('limiter deepest at %.2f s' % (i / SR))
    print('bus limiter: max %.1f dB gain reduction, active %.2f s of %.0f s' % (-20 * np.log10(lim.min()), (lim < .99).sum() / SR, n / SR))
    fx *= lim
    out = ROOT / 'public/episodes/ep003/audio'
    soundfile.write(str(out / 'sfx.wav'), np.clip(fx, -1, 1).T, SR, subtype='PCM_16')
    mix = narr[None, :] + fx                                              # the narration centred, identical in L and R
    peak = np.abs(mix).max()
    if peak > .98:
        mix *= .98 / peak
    soundfile.write(str(out / 'mix.wav'), mix.T, SR, subtype='PCM_16')
    report(narr, fx, mix, cl, per_cue, duck)


def report(narr, fx, mix, cl, per_cue, duck):
    db = lambda v: 20 * np.log10(max(float(v), 1e-9))  # noqa
    npk = np.abs(narr).max()
    blocks = list('ABCDEFG')
    edges = [B0[b] for b in blocks] + [1e9]
    cnt = {b: sum(1 for t, *_ in cl if edges[i] <= t < edges[i + 1]) for i, b in enumerate(blocks)}
    print('cues', len(cl), ' per block', cnt)
    print('narration peak %.1f dBFS | sfx peak %.1f dBFS (%.1f dB under the voice peak) | mix peak %.3f'
          % (db(npk), db(np.abs(fx).max()), db(npk) - db(np.abs(fx).max()), float(np.abs(mix).max())))
    # each cue's own peak (after gain, pan, ducking) against the voice peak in the 1 s around it
    worst = []
    for t, name, pk in per_cue:
        i = int(t * SR)
        pk *= float(duck[min(i, len(duck) - 1)])
        v = np.abs(narr[max(0, i - SR // 2):i + SR // 2]).max()
        worst.append((db(npk) - db(pk), db(v) - db(pk) if v > 1e-3 else 99, t, name))
    worst.sort()
    print('closest cues to the voice peak (dB under global voice peak, dB under local voice peak, t, sound):')
    for w in worst[:6] + [w for w in worst[6:] if w[1] < 4]:
        print('   %.1f  %.1f  %.2f  %s' % w)
    try:
        import pyloudnorm as pyln
        m = pyln.Meter(SR)
        lv, lf, lm = m.integrated_loudness(narr), m.integrated_loudness(fx.T), m.integrated_loudness(mix.T)
        print('loudness: voice %.1f LUFS, sfx bed %.1f LUFS (%.1f LU under), mix %.1f LUFS (master to -14 at the final)'
              % (lv, lf, lv - lf, lm))
    except ImportError:
        pass
    mono = mix.mean(0)
    print('mono fold-down peak %.1f dBFS; L/R correlation %.3f' % (db(np.abs(mono).max()), float(np.corrcoef(mix[0], mix[1])[0, 1])))


if __name__ == '__main__':
    main()
