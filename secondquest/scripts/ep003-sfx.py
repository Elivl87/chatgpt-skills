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
sys.path.insert(0, str(HERE / 'animatic')); sys.path.insert(0, str(HERE))
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
     'coins': K_ / 'handleCoins2.ogg', 'coins1': SFX / 'cc0/owlish_202/Money_02.ogg', 'strike1': SFX / 'cc0/owlish_202/Stationery_Stationery_18.ogg', 'creak': K_ / 'creak2.ogg', 'cloth': K_ / 'cloth2.ogg', 'latch': K_ / 'metalClick.ogg',
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


from blocks import hook_anchors  # noqa  (the hook's warp, exactly as build.py uses it)
_ANC = hook_anchors()[0]


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
    if base == 'roomtone':                                               # a quiet room: soft low noise, no gaps (v3.3.1)
        L = int(8 * SR); n = rng.standard_normal(L)
        b, a_ = ss.butter(2, [60 / (SR / 2), 700 / (SR / 2)], 'band'); x = ss.lfilter(b, a_, n)
        x = x / np.sqrt(np.mean(x ** 2)) * .1                            # -20 dBFS RMS before the bed gain
        f = int(.5 * SR); x[:f] = x[:f] * np.linspace(0, 1, f) + x[-f:] * np.linspace(1, 0, f); x = x[:-f]   # seamless loop
        return x.astype(np.float32)
    if base == 'swell':                                                  # water rising: low noise swell + the water loop
        x = load('water')[:int(1.4 * SR)]
        L = len(x); t = env_t(L)
        b, a_ = ss.butter(2, 900 / (SR / 2))
        rum = ss.lfilter(b, a_, rng.standard_normal(L)); rum /= np.abs(rum).max()
        env = np.sin(np.pi * np.minimum(1, t / 1.4)) ** 1.5
        return ((x / (np.abs(x).max() + 1e-9) * .8 + rum * .5) * env).astype(np.float32)
    if base == 'gull':                                                   # our gull call: two "kee-ow" glides, nasal harmonics
        L = int(.75 * SR); t = env_t(L); out = np.zeros(L)
        for k0, d in ((0, .32), (.38, .34)):
            i0, n = int(k0 * SR), int(d * SR); u = np.arange(n) / SR
            f = 1500 + 900 * np.sin(np.pi * np.minimum(1, u / d) * .55) - 700 * (u / d) ** 2 + 18 * np.sin(2 * np.pi * 23 * u)
            ph = 2 * np.pi * np.cumsum(f) / SR
            x = np.sin(ph) + .55 * np.sin(2 * ph) + .3 * np.sin(3 * ph) + .12 * np.sin(5 * ph)
            out[i0:i0 + n] += x * np.sin(np.pi * u / d) ** .7
        return (out / (np.abs(out).max() + 1e-9)).astype(np.float32)
    if base == 'flap':                                                   # wing flaps: three soft low noise whumps
        L = int(.5 * SR); t = env_t(L); n = rng.standard_normal(L)
        b, a_ = ss.butter(2, [180 / (SR / 2), 1400 / (SR / 2)], 'band'); n = ss.lfilter(b, a_, n)
        env = sum(np.exp(-((t - c) / .035) ** 2) for c in (.06, .22, .38))
        return (n * env / (np.abs(n * env).max() + 1e-9)).astype(np.float32)
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
_PK = None
PK_FILES = {}


def pick(name, t):
    """'pk:<category>': a catalog sound via scripts/sfx_pick.py (never the same file twice, varied render), mono."""
    global _PK
    if _PK is None:
        from sfx_pick import Picker
        _PK = Picker(seed='ep003-v33')
    cat, *opts = name[3:].split(';')                    # 'pk:pop;dark=1800;not_match=Mouth|bubble;max_dur=.6'
    kw = {}
    for o in opts:
        k, v = o.split('=', 1)
        kw[k] = float(v) if k.endswith('_dur') or k in ('dark', 'bright', 'pitch') else v
    f = _PK.file(cat, t=t, **kw)
    PK_FILES[(round(t, 4), name)] = f
    x, sr = soundfile.read(str(f), dtype='float32', always_2d=True)
    x = x.mean(1)
    return ss.resample_poly(x, SR, sr).astype(np.float32) if sr != SR else x


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
WHY = {}


def cues():
    """(time s, sound, gain dB, pan -1..1). Gains are relative to full scale before SFX_GAIN and the voice-ducking."""
    c = []

    def a(t, name, db, pan=0., why=''):
        c.append((float(t), name, float(db), float(pan)))
        WHY[(round(float(t), 4), name)] = why

    def train(t0, t1, n, name, db, pan=0., ease=None, fade=0.):
        """n cues between t0 and t1; ease 'in' = accelerating (power2.in), 'out' = decelerating, 'ramp' = slow-fast-slow."""
        for k in range(n):
            u = k / max(1, n - 1)
            if ease == 'in':
                u = u ** .5
            elif ease == 'out':
                u = 1 - (1 - u) ** .5
            a(t0 + (t1 - t0) * u, name, db - fade * u, pan)

    # ================================================================== A · the hook (script v3.3, 2026-10-17)
    # index.template.html: reused shots on v2 seconds (HK), the chat / H8 on h-tokens. Rebuilt to the rubric's budget
    # (DESIGN_RUBRIC §7: <= 12 onsets/min, <= 3 in 2 s, >= 35 % rest): 8 onsets in the hook, one per beat that needs a
    # sound, picked from the catalog with scripts/sfx_pick.py (no file twice, varied render); the beds carry the rest.
    # v3.3.1 (retention critic): the title is up from frame 0 (no landing cue); the cue goes to the fish leap on "A lot of
    # fish"; the slap sits on the cut to art 02; Bought #2 gets its pop (pitched between #1 and #3); the fleet explosion
    # layer and the wordmark cues inside the "So, why?" rest are gone (that rest keeps only a very low water bed).
    a(HK(5.6) - .05, 'pk:foley-water;not_match=slime|toilet|mud|Fizz|Drink;dark=4500', -22, P(170), why='"A lot of fish.": the first fish leaps out')
    a(HK(10.2), 'pk:impact-heavy;not_match=rock|breaking|deep|slam|hit37|impact\\.wav', -14, -.15, why='SLAP: cut to art 02 (flash + shake)')
    a(HK(10.2), 'pk:impact-soft;not_match=bite|error|scratch|hit\\d|Generic|falling|stones;dark=4500', -22, -.15, why='SLAP: body layer')
    a(T('h06.w1') + .16, 'pk:pop;not_match=Mouth|bubble|3pops', -20, -.15, why='first "Bought." sticker punches in')
    a(T('h06.w2') + .16, 'pk:pop;not_match=Mouth|bubble|3pops;pitch=2.5', -19, .15, why='second "Bought." (pitched between the first and the third)')
    a(T('h06.w3') + .16, 'coins1', -15, why='third "Bought." (biggest kick, the loudest of the three): everyone paid')
    a(T('h07.w12'), 'drain', -24, why='"not": the dots vanish, Leo greys out')
    a(T('h08.w4'), 'pk:pop;not_match=Mouth|Pop_|pop\\d|3pops', -24, P(850), why='H8: Leo\'s "I\'ll get it later." bubble pops up out of his empty place')
    a(HK(28.12), 'pk:impact-soft;not_match=bite|error|scratch|hit\\d|Generic|Punch|falling|stones;dark=4500', -18, why='"To do everything else." card slams')

    # ================================================================== B · the invitation (blockB.template.html, v3.3)
    a(T('b01.w4.end') + .1, 'creak', -26, .2, why='the $7.99 tag swings in on its string')
    a(T('b01.w4.end') + .12, 'pk:foley-wood', -24, .2, why='the tag swings in: body')
    a(T('b01.w8'), 'strike1', -18, .2, why='"not": the red strike through $7.99')
    a(T('b02.w19'), 'wood_m', -18, why='"ten million": the reel lands, 10,000,000+ (v3.3.3: a soft thump; stamps only on the words that matter)')
    a(T('b03.w18') - .05, 'place', -17, why='"their own copy": the game boxes pop up into their hands (cardboard)')

    # ================================================================== C-G · rebuilt to the rubric's budget (2026-10-17)
    # Design critic (CRITIC_v332_0-110.md): C had 108 onsets in 44 s and none of its cues had a "why". Every block now keeps
    # DESIGN_RUBRIC §7: <= 12 onsets/min, <= 3 onsets in 2 s, >= 35 % rest, one cue per story beat, each with its reason;
    # the water / night / room beds carry everything else. (Two layers starting together count as one onset.)

    # ---------------------------------------------------------------- C · the adult way (44.2 s -> 8 onsets)
    a(T('l12.w1') - .05, 'notify', -22, why='C opens on the lively chat: it keeps pinging')
    a(T('l17.w4'), 'stamp', -20, why='"later": the LATER sticker slaps onto the calendar after the page run')
    nz = T('l17.w15')
    a(nz, 'thud', -16, why='"a new noise": the car clunks (v3.3.3: a darker take than the metal latch)')
    a(nz, 'tin', -28, why='the car clunk: a little metal on top')
    qt, dies = T('l17.w19') - .1, T('l17.w20')
    a(qt + (dies + .7 - T('l17.w19')) * 1020 / 1320, 'flatline:1.4', -30, .2, why='"the plan dies": the ECG goes flat')
    a(T('l18.w17') + .26, 'stamp', -14, why='"not even time": NOT IT stamps the clock')
    a(T('l19.w13') - .1, 'door_open', -16, why='the door swings open, light pours in on the kid')
    a(T('l19.w26') - .06, 'door_knock', -14, why='"Nobody": the door slams, the light cuts')
    a(T('l20.w5') + .04, 'stamp', -14, why='$7.99 stamps out "asking"')
    a(T('l20.w5') + .04, 'punch', -22, why='$7.99 stamp: body layer')

    # ---------------------------------------------------------------- D · why fishing (57.3 s -> 11 onsets)
    a(T('l21.w3') + .05, 'thud', -18, why='"FISHING?" lands in its slot (a soft thump)')
    a(T('l21.w12') + .05, 'jackpot', -24, why='the slot reels stop on the fish')
    a(T('l21.w12') + .05, 'coins1', -20, why='the jackpot: coin layer')
    a(T('l22.w3') + .06, 'place', -20, -.4, why='"solves": the small $7.99 PAID mark lands on the phone (a paper thump)')
    a(T('l22.w10') + .07, 'pk:impact-soft;not_match=bite|error|scratch|hit\\d|Generic|falling|stones;dark=4500', -18, -.4, why='"meet.": the green SOLVED check stamps on')
    a(T('l22.w11'), 'question', -24, .4, why='"what to do": the "?" pops over the empty boat')
    a(T('l24.w34') - .25, 'pk:foley-water;not_match=slime|toilet|mud|Fizz|Drink;dark=4500', -22, -.35, why='"fish": the fish surfaces by the bobber')
    a(T('l24.w44') + .02, 'place', -20, .2, why='"job.": the name badge clips onto the bubble')
    a(T('l25.w7') + .03, 'stamp', -16, why='"alibi": the ALIBIS header slaps onto the board')
    a(T('l25.w16') + .3, 'coins1', -22, .1, why='"poker night": the chip stack topples')
    a(T('l26') + .29, 'wood_m', -14, why='the phone slams onto the board in the empty slot')
    a(T('l26.w14'), 'notify', -16, why='"chat.": the pinned phone pings')

    # ---------------------------------------------------------------- E · the alibi falls apart (76 s -> 15 onsets)
    yt = T('l28.w9')
    a(yt, 'cloth', -16, .2, why='"immediately": the props list is yeeted (a cloth swish with body)')
    a(yt + .56, 'splash', -21, .45, why='the list lands in the lake')
    a(T('l29.w11'), 'impact', -18, why='"dynamite" slams into its slot (shake)')
    a(T('l29.w15'), 'money', -20, why='"sell your catch": +$1,250')
    a(T('l29.w17') - .1, 'roulette:%.2f' % (T('l29.w19') + .05 - T('l29.w17') + .3), -22, why='"gamble": the roulette spins')
    a(T('l29.w19') + .05, 'drain', -18, why='"the money": it rolls to $0, the wallet faints')
    a(T('l29.w22'), 'lowboom', -18, why='"bosses": a boss shadow passes under the boat')
    a(T('l31.w9'), 'stamp', -12, why='FAILURE stamps the screen')
    a(T('l31.w9'), 'impact', -20, why='FAILURE: body layer')
    a(T('l32.w5') - .06, 'splash_b', -14, .4, why='someone falls in the water (FAIL x1)')
    a(T('l32.w31') - .02, 'boom', -20, -.5, why='launched across the island: the blast')
    a(T('l32.w42'), 'boop', -16, .4, why='"poked.": the giant eye gets booped')
    hit = T('l33.w19') + .02
    a(hit, 'punch', -13, .1, why='THE SLAP: flash, hitstop, shake')
    a(hit, 'impact', -19, .1, why='the slap: body layer')
    a(T('l33.w21'), 'done', -20, -.2, why='REVIVED!')
    a(T('l35.w26'), 'notify', -18, why='"context,": THE SLAP posts to the group, years later')
    a(T('l35.w32') + .05, 'notify', -24, why='"confusion": the new member answers "???"')

    # ---------------------------------------------------------------- F · friendslop and the Tuesday night (54.7 s -> 10 onsets)
    a(T('l36.w11') - .1, 'wood', -18, why='the tag flips on its string: FRIENDSLOP (a wooden clack)')
    a(T('l36.w24') - .02, 'pop', -26, -.2, why='"playing": the four friends pop up in a row')
    a(T('l37.w10'), 'tin', -17, .4, why='"garbage": the lid flips off the can')
    a(T('l38.w4'), 'drain', -20, why='"short.": the PLAYTIME bar drains red')
    a(T('l38.w12') + .2, 'place', -18, .25, why='"hit.": #1 lands on the calendar (a paper thump)')
    a(T('l40.w12') - .1, 'notify', -18, .1, why='"same boat": the group-chat banner drops in (Max: on?)')
    a(T('l41.w16'), 'roll:0.9', -21, -.1, why='"never": the clock starts racing round to morning (v3.3.4: +5 dB, was -26: the retention critic could not hear it)')
    a(T('l42.w23') + .12, 'drain', -22, why='"not done well.": the chart line crashes off the bottom (oof.)')
    a(T('l42.w34') - .04, 'squish', -18, .2, why='"silly": the doodle slap in the yearbook')
    a(T('l43.w8') + .02, 'notify', -22, why='"group": every screen pings at once')

    # ---------------------------------------------------------------- G · payoff + end (33.2 s -> 6 onsets)
    a(T('l44.w13') + .3, 'drip', -18, P(760), why='"fish?": one drop falls and the ripple breaks the text')
    a(T('l48.w4') + .87, 'splash', -18, P(880), why='the struck FISH drops into the lake')
    snt = T('l50.w12')
    a(snt + .5, 'notify', -16, why='the answer: "Bought."')
    w = T('l51.w14')
    a(w - .05, 'swell', -18, why='the wordmark rises from the lake')
    q = T('l52.w5')
    a(q + 1.32, 'splash', -18, why='the dive into the lake')
    return c


def night():
    """Crickets (looped): Quest's room at night (B1); the "almost nothing" gag (E3); the blue-hour lake + 1 AM; G."""
    # v3.3.1: A/B room beds at about -35 dBFS RMS in the mix (-32 after the -14 LUFS master): no dead air before 62 s;
    # each crosses its cut by 0.3 s (L-cut / J-cut) so the room tone carries the edit
    return [(T('h05.w1') - .12 - .3, T('h08.w1') - .1 + .3, -15, .3),       # A: the chat (the night room)
            (B0['B'] - .3, T('b03.w11') + .1, -15, .3),                              # B: Quest's room, the numbers, the stage until "Everyone"
            (T('l29.w5'), T('l29.w6') - .1, -32),
            # v3.3.3 (retention critic: the bed vanished after 66 s): C-G beds at the hook's level, continuous across joins
            (T('l39.w6'), T('l41') + .3, -20, .3), (B0['G'] - .3, T('l52.end') + 2.5, -19, .5)]


def ambience():
    """A low water bed under the lake scenes (looped CC0), by block."""
    return [(0, T('h05.w1') - .12 + .3, -6, .3), (T('h08.w1') - .1 - .3, T('h10.end') + .15, -6, .3),   # A: the lake (not the chat)
            (T('h10.end') + .1, B0['B'] + .3, -26, .3),                           # the "So, why?" rest: only a very low water bed
            (T('b03.w11') - .2, B0['C'] + .3, -8, .3),                                # B2: the boat on the stage (from "Everyone")
            # v3.3.3: C-G at the hook's level (gaps about -35 dBFS after the master), each crossing its cut by 0.3 s
            (B0['D'] - .3, T('l25') - .2 + .3, -8, .3),                             # D: the lake, the split, the polaroid, the calm boat
            (T('l26.w9') - .05 - .3, B0['E'] + .3, -10, .3),                        # D: the breath; the lake in the chat
            (B0['E'] - .3, T('l35') + .3, -8, .3),                                  # E: the props list, the game world, the failure run, the slap
            (T('l38.w1') - .36 - .3, T('l41') + .3, -8, .3),                        # F: summer, the sunset, the blue-hour boat
            (T('l43.w9') - .3, B0['G'] + .3, -12, .3),                              # F: the black lake (the rest before G, at bed level)
            (B0['G'] - .3, T('l52.end') + 2.5, -8, .5)]                             # G: the night lake


def rooms():
    """Other room tones: the doorway yard (wind), the 1 AM living room (TV hum)."""
    # v3.3.1: a gapless room tone under the crickets (the cricket loop has ~0.1 s holes) and into block C's opening
    return [('roomtone', T('h05.w1') - .12 - .3, T('h08.w1') - .1 + .3, -18), ('roomtone', B0['B'] - .3, T('b03.w11') + .1, -18),
            ('roomtone', B0['C'] - .3, B0['D'] + .3, -18),                         # C: phones, calendar, map, clock, the door (v3.3.3: all of C)
            ('roomtone', T('l25') - .2 - .3, T('l26.w9') - .05 + .3, -18),        # D: the evidence board
            ('roomtone', T('l35') - .3, B0['F'] + .3, -18),                         # E: years later, the polaroid table
            ('roomtone', B0['F'] - .3, T('l38.w1') - .36 + .3, -18),               # F: the FRIENDSLOP stage
            ('roomtone', T('l41') - .3, T('l43.w9') + .3, -18),                     # F: 1 AM, the yearbook, the wall of phones
            ('wind', T('l19.w13'), T('l19.w26'), -40), ('tvhum', T('l41') - .03, T('l42.w1') - .1, -42)]


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
    # v3.3.4: the mix runs to the video's end (l52.end + 2.5 s = 328.4 s): the narration is padded with silence and the
    # G night beds (water + crickets) keep going, so the end-card splash rings out instead of the audio stopping at 327.06 s
    n_end = int(round((T('l52.end') + 2.5) * SR))
    if n_end > len(narr):
        narr = np.concatenate([narr, np.zeros(n_end - len(narr), np.float32)])
    n = len(narr)
    fx = np.zeros((2, n), np.float32)
    rng = np.random.default_rng(2026)
    seen, per_cue = {}, []
    cl = sorted(cues())
    for t, name, db, pan in cl:
        x = pick(name, t) if name.startswith('pk:') else load(name)
        seen[name] = seen.get(name, 0) + 1
        if seen[name] > 1 and not name.startswith('pk:'):                                               # repeats never machine-gun: +-3 semitones, +-2 dB
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
    for t0, t1, db, *fd in ambience():
        bed(fx, 'water', t0, t1, db, n, fd[0] if fd else .6)
    for t0, t1, db, *fd in night():
        bed(fx, 'crickets', t0, t1, db, n, fd[0] if fd else (1.2 if t1 - t0 > 3 else .25))
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
    ab = []
    for t, name, db, pan in cl:
        if t < B0['C']:
            f = PK_FILES.get((round(t, 4), name)) or S.get(name)
            spec = str(Path(f).resolve().relative_to(ROOT)) if f else name
            ab.append({'t': round(t, 3), 'rel_db': db, 'spec': spec, 'why': WHY.get((round(t, 4), name), '')})
    (ROOT / 'build').mkdir(exist_ok=True)
    (ROOT / 'build/ep003_sfx_cues_AB.json').write_text(json.dumps(ab, indent=1))
    for k, (b0, b1) in {'C': (B0['C'], B0['D']), 'D': (B0['D'], B0['E']), 'E': (B0['E'], B0['F']), 'F': (B0['F'], B0['G']), 'G': (B0['G'], len(narr) / SR)}.items():
        bl = []
        for t, name, db, pan in cl:
            if b0 <= t < b1:
                f = PK_FILES.get((round(t, 4), name)) or S.get(name)
                spec = str(Path(f).resolve().relative_to(ROOT)) if f else name
                bl.append({'t': round(t - b0, 3), 'rel_db': db, 'spec': spec, 'why': WHY.get((round(t, 4), name), '')})
        (ROOT / f'build/ep003_sfx_cues_{k}.json').write_text(json.dumps(bl, indent=1))
        print('%s cue list: build/ep003_sfx_cues_%s.json (%d cues, %.2f s)' % (k, k, len(bl), b1 - b0))
    allc = [{'t': round(t, 3), 'rel_db': db, 'spec': str(Path(PK_FILES.get((round(t, 4), name)) or S.get(name)).resolve().relative_to(ROOT)) if (PK_FILES.get((round(t, 4), name)) or S.get(name)) else name,
             'why': WHY.get((round(t, 4), name), '')} for t, name, db, pan in cl]
    (ROOT / 'build/ep003_sfx_cues_all.json').write_text(json.dumps(allc, indent=1))
    print('A-B cue list for sfx_audit: build/ep003_sfx_cues_AB.json (%d cues, A+B end %.2f s)' % (len(ab), B0['C']))


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
