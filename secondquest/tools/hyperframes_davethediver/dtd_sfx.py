#!/usr/bin/env python3
"""Dave the Diver sound pass (free CC0 catalog only, music OFF): episode-level SFX + ambience beds, mixed with the narration.

  python3 dtd_sfx.py            # writes public/episodes/davethediver/audio/{sfx,mix}.wav + build/dtd_sfx_cues.json

stage_assets.py cuts mix.wav (narration + SFX, stereo) per block when it exists. Every cue is keyed to a narration word
token of episodes/davethediver/timings.json ('p03.w7' = start of word 7 of line p03; the same tokens the templates use),
so a new narration (Bram) re-times the whole mix. Sounds come from scripts/sfx_pick.py (no file twice within 20 s,
varispeed, tilt, gain jitter on every render). Rules: fewer, better cues (SHOT_PLAN SFX column pruned to ~75), cues ~7 dB
under the voice (bus limiter keeps the SFX peak >= HEADROOM dB under the voice peak), one ambience bed per location about
25 dB under the voice, all ducked 3 dB under spoken words. The -14 LUFS master is applied by join.py on the full cut.
"""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf, scipy.signal as ss

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / 'scripts')); sys.path.insert(0, str(HERE))
from sfx_pick import Picker, LAYERS, _varispeed, _kweight_lufs, SR  # noqa
from blocks import table, cues as tcues, ORDER  # noqa

TAB = table(tcues())
HEADROOM = 7.0
DUCK_DB = -3.0
PEAK_BASE = -3.0      # dB re the voice peak for a cue with db = 0 (the bus is ducked a further 3 dB under words)
CUE_BASE = PEAK_BASE
BED_BASE = -24.0      # dB re voice LUFS for a bed with db = 0
END = tcues()[list(tcues())[-1]]['end'] + 2.5


def T(k, off=0.0):
    return TAB[k] + off


def C(k, spec, db=0.0, why='', pan=0.0, off=0.0, **kw):
    """word token, sfx_pick category / LAYERS preset / 'cat+cat' / [(cat, dB, offset, filters)], dB re CUE_BASE, why."""
    return dict(k=k, spec=spec, db=db, pan=pan, why=why, off=off, kw=kw)


CUES = {
 'A': [
  C('p01.w9', 'hit+thump', 0, 'harpoon thunk: "speared" (A02)', -.2),
  C('p02.w8', 'click', -3, 'controller click: "Welcome" (A04)', .2, tags=['tap', 'marimba']),
  C('p02.w12', 'notify', -2, 'console power-on chime into the dive: "job" (A05)', 0, tags=['complete', 'confirmation']),
  C('p03.w4', [('whoosh', -2, 0, {}), ('foley-water', 0, .05, {'tags': ['splash']})], 0, 'boat splash: "dive" (A06)', -.25),
  C('p03.w12', 'hit+thump', -1, 'harpoon thunk: "spear" (A08)', .25),
  C('p03.w16', 'scifi', -5, 'low-O2 beep: "oxygen" (A09)', 0, tags=['beep']),
  C('p04.w5', 'misc', -4, 'clock tick stops: "makes" (A12)', .3, tags=['clock', 'tick']),
  C('p05.w8', 'click', -3, 'digit tick: "ten" (A14)', 0, tags=['tap', 'marimba'], semis=3),
  C('p06.w1', 'riser', -3, 'rising swell: "Ten million" (A15)', 0, off=-.9, max_dur=2.2),
  C('p06.w7', 'impact-soft', -1, 'punch-clock stamp: "clocking out" (A16)', 0, tags=['stamp']),
  C('p07.w9', 'bell', -3, 'award chime: "award" (A17)', 0),
  C('p08.w1', 'pop+sparkle', -3, 'bubble ring pop-in + sparkle: "So" (A20)', 0),
  C('p08.w2.end', 'bell', -9, 'gold bar clink after the silence hold (A21)', .2, off=.7, max_dur=1.8),
 ],
 'B': [
  C('p09.w1', 'cartoon', -3, 'ukulele-ish pluck sting: "Meet" (B01)', 0, folder='pluck_pizz'),
  C('p09.w8', 'cartoon', -3, 'cartoon sag: "hero" (B02)', -.2, folder='slide_down'),
  C('p10.w10', 'notify', -4, 'phone ring: "calls" (B07)', .3, tags=['phone']),
  C('p11.w10', 'foley-water', -3, 'splash: "likes" sushi (B10)', .2, tags=['splash']),
  C('p14.w4', 'sting', -4, 'ominous sting: "worse" (B17)', 0, tags=['falling', 'hit']),
  C('p14.w12', 'impact-soft', -1, 'stamp 1: "archaeologist" (B19)', -.2, tags=['stamp']),
  C('p14.w14', 'impact-soft', -1, 'stamp 2 pitch+: "weapons" (B20)', 0, tags=['stamp'], semis=2),
  C('p14.w17', 'impact-soft', -1, 'stamp 3 pitch++: "reporter" (B21)', .2, tags=['stamp'], semis=4),
  C('p15.w17', 'notify', -4, 'calendar ping: "boss" (B24)', 0, tags=['notify', 'confirmation']),
  C('p15.w27', 'notify', -3, 'sad error bump: "weren\'t in" (B25)', .1, tags=['error']),
 ],
 'C': [
  C('p17.w8', 'retro', -7, '8-bit blip: "Pixel art" (C02)', 0),
  C('p18.w3', 'sting', -4, 'turn: "isn\'t only cozy" (C05)', 0, tags=['falling', 'hit']),
  C('p18.w28', 'misc', -4, 'tank hiss: "oxygen" (C09)', -.2, tags=['hisses', 'steam']),
  C('p18.w34', 'impact-soft', -1, 'chomp: "bitten" (C10)', .2, tags=['bite', 'hit']),
  C('p19.w3', 'bell', -4, 'rice-above bell: "Rice" (C12)', 0),
  C('p19.w12', 'notify', -4, 'Monday buzzer: "Mondays" (C13)', 0, tags=['buzzer']),
  C('p20.w17', 'door', -3, 'office door: "quit the office" (C16)', .2, tags=['open', 'close']),
  C('p20b.w2', 'notify', -4, 'question ping: "why" (C19)', 0, tags=['question']),
 ],
 'D': [
  C('p21.w1', 'sparkle', -4, 'sun chime: "Start" (D01)', 0, tags=['chime']),
  C('p22.w7', 'whoosh', -3, 'whoosh down into the Blue Hole (D03)', 0),
  C('p23.w11', 'click', -4, 'gauge tick: "gauge" (D07)', .2, tags=['click', 'select']),
  C('p23.w15', 'scifi', -4, 'oxygen alarm: "oxygen runs out" (D08)', 0, tags=['beep']),
  C('p23.w25', 'bell', -4, 'dive-log ding: "one thing" (D10)', 0),
  C('p25.w10', 'notify', -4, 'phone buzz: "phone" (D16)', -.3, tags=['phone']),
  C('p26.w37', 'riser', -4, 'pressure swell: "forty meters" (D21)', 0, tags=['tension', 'drain'], max_dur=3.0),
  C('p26.w41', 'scifi', -5, 'sonar ping: "eight hundred" (D22)', .2, tags=['beep']),
  C('p27.w9', [('foley-metal', 0, 0, {'max_dur': 1.2}), ('cartoon-comedy', -8, .05, {'folder': 'boing'})], -2, 'tank clang + boing: "bigger tank" (D24)', 0),
 ],
 'E': [
  C('p30.w2', 'wood', -3, 'knife on the board: "Bancho" (E04)', -.2, tags=['chop', 'hit'], max_dur=1.2),
  C('p30.w31', 'sting', -3, 'dramatic chord: "roasted shark head" (E09)', 0, tags=['hit', 'jingles']),
  C('p31.w6', 'whoosh+cloth', -3, 'cutscene whoosh: "anime cutscenes" (E10)', .3),
  C('p31.w8', 'metal', -4, 'steel ring: "Knives" (E11)', -.3, tags=['knife', 'sword', 'unsheathe']),
  C('p32.w6', 'pop', -3, 'pop: "Tea" (E15)', -.2),
  C('p32.w8', 'pop', -3, 'pop: "Plates" (E15)', .2),
  C('p32.w12', 'bell', -4, 'closing bell: "closing" (E17)', 0),
  C('p32.w20', 'sting', -3, 'score fanfare: "score" (E18)', 0, tags=['jingles', 'rising']),
  C('p33.w15', 'misc', -4, 'plate sizzle: "plate" (E23)', .2, tags=['hisses', 'steam']),
  C('p34.w19', 'impact-soft', -2, 'folder thud: "another folder" (E28)', 0, tags=['thump', 'hit']),
  C('p36.w5', 'chime', -3, 'warm ding: "dinner" (E34)', 0, tags=['chime', 'soft']),
 ],
 'F': [
  C('p39.w14', 'paper', -3, 'calendar pages: "long time" (F07)', -.2, tags=['flip', 'bed'], max_dur=1.5, not_match='BookFlip1|Stationery'),
  C('p40.w2', 'whoosh', -3, 'descent whoosh: "deep under" (F10)', 0),
  C('p40.w14', 'crowd', -6, 'village cheer: "need Dave" (F12)', 0, tags=['cheers', 'hurray'], max_dur=3.0),
  C('p42.w5', 'riser', -4, 'avatar grid fills: "thousand" (F15)', 0, off=-.8, max_dur=2.0),
  C('p42.w22', 'crowd', -6, 'party giggles: "sushi bar" (F18)', .2, tags=['giggling', 'happy'], max_dur=3.0),
  C('p44.w21', 'notify', -3, 'camera shutter: "friends" (F27)', 0, tags=['camera']),
 ],
 'G': [
  C('p45.w8', 'door', -3, 'door: "come home" (G02)', -.2, tags=['close', 'open'], not_match='kenney/door'),
  C('p46.w15', 'door', -3, 'lock: "a day" (G06)', 0, tags=['lock', 'key']),
  C('p47.w10', 'chime', -4, 'warm chime: "glad" (G09)', 0, tags=['chime', 'soft']),
  C('p50.w6', 'impact-soft', -3, 'controller set down: "down" (G17)', .2, tags=['small', 'light'], max_dur=.7),
  C('p50.w9', 'misc', -3, 'morning clock alarm: "real job" (G18)', 0, tags=['clock'], not_match='tick'),
  C('p51.w10', 'foley-water', -3, 'splash: "clock out" (G22)', .2, tags=['splash']),
  C('p51.w15', 'bell', -4, 'closing-time bell (G23)', 0),
  C('p52.w13', 'chime', -5, 'quiet chord: "first one" (G27)', 0, tags=['chime', 'soft']),
 ],
 'H': [
  C('p53.w13', 'pop', -3, 'pop: "why?" (H02)', 0),
  C('p53.w15', 'notify', -4, 'comment ping: "Tell me" (H03)', .2, tags=['notify', 'confirmation']),
  C('p54.w4', 'foley-water', -3, 'end-card splash: "next quest" (H05)', 0, tags=['splash']),
 ],
}

# ambience beds: location timeline (start token, location); a bed runs until the next entry, None = silence beat / void
TIMELINE = [
 ('p01.w1', 'BAR'), ('p02.w8', 'LR'), ('p03.w1', 'SEA'), ('p03.w6', 'UW'), ('p03.w19', 'BAR'), ('p04.w1', 'LR'),
 ('p05.w1', 'SEA'), ('p05.w6', None), ('p06.w1', 'CITY'), ('p07.w1', 'LR'), ('p08.w1', 'UW'), ('p08.w2.end', None),
 ('p09.w1', 'SEA'), ('p12.w1', 'BAY'), ('p12.w10', 'UW'), ('p14.w1', 'SEA'), ('p15.w1', 'CITY'), ('p15.w17', 'OFF'), ('p16.w1', 'SEA'),
 ('p17.w1', 'SEA'), ('p17.w14', 'BAY'), ('p18.w6', 'UW'), ('p19.w3', 'BAR'), ('p19.w12', 'OFF'), ('p20.w1', 'LR'), ('p20.w17', 'OFF'),
 ('p20.w20', 'SEA'), ('p20b.w1', 'LR'),
 ('p21.w1', 'SEA'), ('p22.w7', 'UW'), ('p24.w1', 'OFF'), ('p24.w21', 'LR'), ('p25.w1', 'UW'), ('p28.w1', 'OFF'),
 ('p29.w1', 'BAY'), ('p30.w1', 'BAR'), ('p33.w1', 'SEA'), ('p33.w12', 'BAR'), ('p34.w1', 'OFF'), ('p35.w15', 'BAR'),
 ('p37.w1', 'BAY'), ('p37.w5', 'BAR'), ('p40.w1', 'UW'), ('p42.w19', 'BAR'), ('p44.w1', 'CITY'), ('p44.w7', 'SEA'),
 ('p45.w1', 'CITY'), ('p45.w7', 'LR'), ('p46.w1', None), ('p47.w1', 'UW'), ('p47.w8', 'BAR'), ('p48.w1', 'BAYD'), ('p48.w19', 'BAR'),
 ('p49.w1', 'BAYD'), ('p50.w1', 'LR'), ('p50.w9', 'OFF'), ('p51.w1', 'LR'), ('p51.w9', 'SEA'), ('p51.w14', 'BAR'), ('p52.w1', 'LR'),
 ('p52.w11', 'BAY'), ('p53.w1', 'UW'),
]
# location -> layers [(catalog file substrings, rotated per use; lowpass Hz; highpass Hz; dB re BED_BASE)]
BEDS = {  # one or two layers per location; second layers only where they add something
 'SEA': [(['loop_water_03', 'rubberduck_water/loop_water_02', 'loop_water_01'], 2500, 60, 0), (['park_ambience_wind'], 1800, None, -2)],
 'BAY': [(['loop_water_03', 'rubberduck_water/loop_water_02'], 2200, 60, -2), (['crickets_1', 'cricket_1', 'cricket_2'], 7000, 800, -2)],
 'BAYD': [(['loop_water_01', 'loop_water_03'], 2500, 60, -2), (['birds_isaiah658'], 6000, 500, -3)],
 'UW': [(['sfx_19a', 'sfx_19b', 'sfx_19c'], 600, 30, 2), (['loop_bubbles_02', 'loop_bubbles_1'], 1800, 150, 3)],
 'BAR': [(['Temple_Background'], 2200, 120, 0)],
 'CITY': [(['loop_highway'], 1400, 60, 4)],
 'OFF': [(['loop_machine_02', 'machine_08'], 1800, 80, 1)],
 'LR': [(['ambient_03', 'loop_ambient_04'], 900, 60, -3)],
}
FADE = .8


def loudness(x):
    import pyloudnorm as pyln
    return pyln.Meter(SR).integrated_loudness(x.astype(np.float64))


def entry_for(pk, sub):
    es = [e for e in pk.files if sub in e['file'] and e['duration'] >= 3]
    if not es:
        raise LookupError('bed file not in the (CC0) catalog: ' + sub)
    return sorted(es, key=lambda e: (pk.uses.get(e['file'], 0), e['file']))[0]


def lowhigh(x, lp, hp):
    if lp:
        x = ss.sosfilt(ss.butter(2, lp, 'low', fs=SR, output='sos'), x, axis=1)
    if hp:
        x = ss.sosfilt(ss.butter(2, hp, 'high', fs=SR, output='sos'), x, axis=1)
    return x.astype(np.float32)


def main():
    narr, sr = sf.read(str(ROOT / 'public/episodes/davethediver/audio/narration.wav'), dtype='float32')
    assert sr == SR
    n = int(round(END * SR))
    narr = np.concatenate([narr, np.zeros(max(0, n - len(narr)), np.float32)])[:n]
    vl = loudness(narr[:, None])
    vpk = float(np.abs(narr).max())
    print('voice %.1f LUFS, peak %.1f dBFS, mix length %.2f s' % (vl, 20 * np.log10(vpk), END))
    pk = Picker(seed='dtd')
    fx = np.zeros((2, n), np.float32)

    def put(y, t, pan=0.0):
        i = int(round(t * SR))
        if i < 0:
            y = y[:, -i:]; i = 0
        seg = y[:, :n - i]
        th = (max(-.6, min(.6, pan)) + 1) * np.pi / 4
        fx[0, i:i + seg.shape[1]] += seg[0] * np.cos(th) * np.sqrt(2)
        fx[1, i:i + seg.shape[1]] += seg[1] * np.sin(th) * np.sqrt(2)

    # ---- beds
    tl = [(T(k), loc) for k, loc in TIMELINE]
    segs = []
    for (t0, loc), nxt in zip(tl, tl[1:] + [(END, None)]):
        if segs and segs[-1][2] == loc and loc is not None and abs(segs[-1][1] - t0) < 1e-6:
            segs[-1][1] = nxt[0]
        else:
            segs.append([t0, nxt[0], loc])
    nb, locs = 0, []
    for t0, t1, loc in segs:
        if loc is None or t1 - t0 < .5:
            continue
        L = t1 - t0 + FADE
        for files, lp, hp, db in BEDS[loc]:
            e = entry_for(pk, files[nb % len(files)])
            y = pk.render(e['category'], t0, entry=e, length=L, pitch=0.0, stretch=0.0, fade_out=.05)
            y = lowhigh(y, lp, hp)
            y = y * 10 ** ((vl + BED_BASE + db - _kweight_lufs(y)) / 20)
            k = np.minimum(1, np.minimum(np.arange(y.shape[1]), y.shape[1] - np.arange(y.shape[1])) / (FADE * SR)).astype(np.float32)
            put(y * k, max(0.0, t0 - FADE / 2))
        nb += 1
        locs.append(loc)
    print('beds', nb, sorted(set(locs)))

    # ---- cues
    cl = []
    for blk in ORDER:
        for c in CUES[blk]:
            t = T(c['k']) + c['off']
            kw = dict(c['kw'])
            semis = kw.pop('semis', 0)
            spec = c['spec']
            before = len(pk.history)
            target = 20 * np.log10(vpk) + PEAK_BASE + c['db']        # dB peak
            if isinstance(spec, list) or '+' in spec or spec in LAYERS:
                y = pk.layer(spec, t)
                lead = getattr(pk, 'last_layer_lead', 0.0)
                y = y * 10 ** (target / 20) / float(np.abs(y).max())
                t_put = t + lead
            else:
                y = None
                for flt in tuple({'dark': d, **{k: v for k, v in kw.items() if k != 'tags' or tg}} for d in (3200, 4800) for tg in (True, False)) + (kw,):   # darker takes first
                    try:
                        y = pk.render(spec, t, **flt)
                        break
                    except LookupError:
                        continue
                t_put = t
            if semis:
                y = _varispeed(y, semis)
            if not (isinstance(spec, list) or '+' in spec or spec in LAYERS):
                y = y * 10 ** (target / 20) / float(np.abs(y).max())
            put(y, t_put, c['pan'])
            cl.append((blk, t, c, pk.history[before][2]))
    # ---- duck under the voice, bus limit (voice peak - HEADROOM)
    duck = np.ones(n, np.float32)
    for c in tcues().values():
        for w in c['words']:
            duck[int(w['start'] * SR):int(w['end'] * SR)] = 10 ** (DUCK_DB / 20)
    duck = np.convolve(duck, np.ones(int(.06 * SR)) / int(.06 * SR), 'same').astype(np.float32)
    fx *= duck
    from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
    ceil = vpk * 10 ** (-HEADROOM / 20)
    a = maximum_filter1d(np.abs(fx).max(0), int(.004 * SR))
    g = np.minimum(1, ceil / (a + 1e-9)).astype(np.float32)
    g = minimum_filter1d(g, int(.03 * SR))
    g = np.minimum(g, uniform_filter1d(g, int(.03 * SR), mode='nearest')).astype(np.float32)
    print('bus limiter: max %.1f dB reduction, active %.2f s' % (-20 * np.log10(g.min()), (g < .99).sum() / SR))
    fx *= g
    out = ROOT / 'public/episodes/davethediver/audio'
    sf.write(str(out / 'sfx.wav'), np.clip(fx, -1, 1).T, SR, subtype='PCM_16')
    mix = narr[None, :] + fx
    pkm = float(np.abs(mix).max())
    if pkm > .98:
        mix *= .98 / pkm
    sf.write(str(out / 'mix.wav'), mix.T, SR, subtype='PCM_16')
    (ROOT / 'build').mkdir(exist_ok=True)
    allc = [{'t': round(t, 3), 'rel_db': round(CUE_BASE + c['db'] + DUCK_DB, 1), 'spec': 'public/shared/sfx/' + f, 'why': c['why']} for b, t, c, f in cl]
    (ROOT / 'build/dtd_sfx_cues.json').write_text(json.dumps(allc, indent=1))
    rel = []
    for b, t, c, f in cl:
        i = int(t * SR); sp = float(np.abs(fx[:, i:i + SR]).max()); vp = float(np.abs(narr[max(0, i - SR // 2):i + SR // 2]).max())
        rel.append(20 * np.log10(max(vp, 1e-4) / max(sp, 1e-5)))
    print('cue peak under local voice peak: median %.1f dB, min %.1f, max %.1f (cues over a silent voice excluded by 1e-4 floor)' % (np.median(rel), min(rel), max(rel)))
    print('cues', {b: sum(1 for x in cl if x[0] == b) for b in ORDER}, 'total', len(cl))
    print('voice %.1f LUFS | sfx bus %.1f LUFS | mix peak %.3f' % (vl, loudness(fx.T), float(np.abs(mix).max())))
    print(pk.report().splitlines()[-1])


if __name__ == '__main__':
    main()
