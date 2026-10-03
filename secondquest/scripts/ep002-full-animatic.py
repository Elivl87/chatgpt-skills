#!/usr/bin/env python3
"""EP002 full animatic v1 (planning only): the whole episode with the assets available today.

  python3 scripts/ep002-full-animatic.py            # docs/ep002/EP002_full_animatic_v1.mp4 + MISSING list
  python3 scripts/ep002-full-animatic.py --stills   # one still per shot (contact sheet) instead of the video

Sequence 01 is the approved cartridge animatic v10 (scripts/ep002-cartridge-animatic.py), reused as is.
Sequences 02-30 follow the Director's Scene Book v2 and the Producer's storyboard. Anything that does not exist yet is
shown as a MISSING plate/box or as a labelled planning preview (e.g. Quest's hoodie recoloured green = Hero-of-Time
outfit to be made). Pixie plays every female role (Producer). Only free sounds: Bram + the approved seq-01 mix.
"""
import importlib.util, json, math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, str(Path(__file__).resolve().parent / 'animatic'))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools/fx'))
from lib import *  # noqa
import lib as L
import fairy as fairy_fx  # noqa: E402

FF = imageio_ffmpeg.get_ffmpeg_exe()
spec = importlib.util.spec_from_file_location('cart', ROOT / 'scripts/ep002-cartridge-animatic.py')
CART = importlib.util.module_from_spec(spec); spec.loader.exec_module(CART)
SEQ01_END = CART.T_END

# ------------------------------------------------------------------ plates and helpers
LIVING = ('img', 'public/art/core/backgrounds/living_room_night_gaming.png')
BEDROOM = ('img', 'public/art/core/backgrounds/quest_bedroom_morning.png')
DOORS = ('img', 'public/art/episodes/ep001/backgrounds/fantasy_doors.png')
STORM = ('img', 'public/art/core/backgrounds/storm_low_horizon.png')
SUNSET = ('proc', 'field', (('time', 'sunset'),))
FIELD = ('proc', 'field', (('time', 'dawn'),))
FIELD_DAY = ('proc', 'field', (('time', 'day'),))
FIELD_NIGHT = ('proc', 'field', (('time', 'night'),))
FOREST = ('proc', 'forest')
TEMPLE = ('proc', 'temple')
TREE = ('proc', 'tree')
DARK = ('proc', 'dark')
RELICS = ('proc', 'dark', (('label', 'relic shots: ocarina / sword are MISSING props (free 3D next) · Triforce = engraved plates'),))
N64_SETUP = 'public/art/ep002/seq01/room_n64_setup_cart_in.png'
TRI = ROOT / 'docs/ep002/triforce'

STILL = ((1.0, .5, .5), (1.0, .5, .5))
def push(z=1.08, x=.5, y=.5, z0=1.0, x0=.5, y0=.5):
    return ((z0, x0, y0), (z, x, y))

hero = lambda pose, x, y, h, **k: dict(char=f'quest:{pose}' if ':' not in pose else pose, costume='hero', x=x, y=y, h=h, **k)
young = lambda pose, x, y, h, **k: dict(char=f'quest:{pose}' if ':' not in pose else pose, costume='hero', young=True, x=x, y=y, h=h, **k)
quest = lambda pose, x, y, h, **k: dict(char=pose if ':' in pose else f'quest:{pose}', x=x, y=y, h=h, **k)
pixie = lambda pose, x, y, h, costume=None, **k: dict(char=f'pixie:{pose}', costume=costume, x=x, y=y, h=h, **k)
navi = lambda *keys, **k: ('fairy', [(a, x, y, *s) for a, x, y, *s in keys], k)
hover = lambda t0, t1, x, y, s=1.0: navi((t0, x, y, s), ((T(t0) + T(t1)) / 2 if not isinstance(t0, str) else f'{t0}+{(T(t1) - T(t0)) / 2:.2f}', x + .01, y - .015, s), (t1, x, y, s))

# ------------------------------------------------------------------ the shot list (Scene Book v2 sequences 02-30)
S = []
def shot(seq, start, plate, layers=(), cam=STILL, fx=(), movers=(), boxes=(), note=''):
    S.append(dict(seq=seq, start=start, plate=plate, layers=list(layers), cam=cam, fx=list(fx), movers=list(movers), boxes=list(boxes), note=note))

# 02 QUEST ENTERS OCARINA: threshold, Navi leads, push through the light; outfit changes on the flash
shot('02 QUEST ENTERS OCARINA', SEQ01_END, DOORS, [quest('walking_back', .5, .98, .55)], push(1.35, .5, .45),
     [navi((SEQ01_END, .62, .42, 1.2), ('l03.w5', .52, .34, 1.0), ('l03.w9', .5, .3, .8)), ('glow', 'l03.w7', 'l04-0.2', .5, .38, .35, (200, 230, 255), .6),
      ('flash', 'l04-0.25', .25)])
# 03 THE THREE ANCHORS: ocarina, sword, Triforce; Navi guides the eye
shot('03 THE THREE ANCHORS', 'l04-0.1', RELICS, [], push(1.05),
     [('relic', 'l04-0.1', 'l05-0.1', 'MISSING · ocarina (blue, own 3D prop next, free)'), ('relic', 'l05-0.1', 'l06-0.1', 'MISSING · master sword (own 3D prop next, free)'),
      ('triforce', 'l06-0.1', 'l07-0.1'), navi(('l04', .72, .4), ('l05', .3, .45), ('l06', .7, .3), ('l07-0.2', .55, .25))])
# 04 YOU: Hero Quest + Navi facing Hyrule; hold on "You."; Navi starts forward, Quest follows; cut on "So, why?"
shot('04 YOU', 'l07-0.1', FIELD, [hero('walking_back', .5, .97, .42)], push(1.06, .5, .62),
     [navi(('l07', .56, .5), ('l08', .54, .48), ('l09', .55, .46), ('l10', .5, .38, .8))])
# 05 THE GAME + THE ROOM (childhood memory room, afternoon)
shot('05 THE GAME + THE ROOM', 'l11-0.1', BEDROOM, [young('quest2:floor_gaming', .42, .93, .42), ], push(1.05, .45, .6),
     [('grade', (255, 170, 90), .18)], boxes=[((.66, .38, .9, .78), 'CRT TV + N64 (free 3D: TV next)')])
shot('05 · the room', 'l13-0.1', BEDROOM, [young('quest2:floor_gaming', .42, .93, .42)], 'continue', [('grade', (255, 170, 90), .18)],
     boxes=[((.66, .38, .9, .78), 'CRT TV + N64 (free 3D: TV next)')])
shot('05 · the television', 'l14-0.1', BEDROOM, [young('quest2:floor_gaming', .42, .93, .42)], push(1.6, .78, .58, 1.6, .78, .58),
     [('grade', (255, 170, 90), .18), ('glow', 'l14', 'l15', .78, .55, .25, (180, 220, 255), .45)], boxes=[((.66, .38, .9, .78), 'CRT TV + N64')])
# 06 SARIA / CHILDHOOD -> the friend who knew where to go: young Quest + Pixie (forest friend) + Navi
shot('06 FRIEND / FOREST', 'l15-0.1', FOREST, [young('quest2:thinking_chin', .38, .95, .5), pixie('laughing_pointing', .62, .95, .4, costume='forest', young=True)],
     push(1.08, .5, .62), [hover('l15', 'l16', .5, .4)])
shot('05 · Saturday afternoon', 'l16-0.1', BEDROOM, [young('quest2:floor_gaming', .36, .93, .42), pixie('sitting_relaxed', .56, .93, .36, young=True, label='Pixie as the childhood friend · young (planning)')],
     push(1.1, .45, .62), [('grade', (255, 160, 80), .22)], boxes=[((.66, .38, .9, .78), 'CRT TV + N64')])
# 07 BECAUSE YOU WERE SMALLER: young hero Quest tiny, field dominates
shot('07 BECAUSE YOU WERE SMALLER', 'l17-0.1', FIELD, [young('walking_back', .5, .9, .2)], push(1.0, .5, .5, 1.25, .5, .62),
     [navi(('l17', .54, .6, .6), ('l19', .52, .58, .6))])
# 08 MEMORY DOESN'T REMEMBER SPECS: same field (camera continues), tech overlays invade then disappear
shot('08 MEMORY VS SPECS', 'l20-0.1', FIELD, [young('walking_back', .5, .9, .2)], 'continue',
     [('tech', 'l21', 'l24-0.3'), navi(('l20', .52, .58, .6), ('l24', .53, .57, .6))])
# 09 THE WORLD IN YOUR HEAD: forest -> music -> castle -> forever -> room light
shot('09 forest', 'l24-0.1', FOREST, [young('walking_back', .5, .95, .45)], push(1.12, .5, .5), [hover('l24', 'l25', .55, .45)])
shot('09 music', 'l25-0.1', FIELD, [young('walking_back', .5, .9, .2)], push(1.15, .5, .55), [('notes', 'l25', 'l26')])
shot('09 castle in the distance', 'l26-0.1', FIELD, [young('walking_back', .5, .9, .2)], 'continue', [], )
S[-1]['cam'] = 'continue_to', (1.6, .51, .5)
shot('09 forever', 'l27-0.1', FIELD_DAY, [young('walking_back', .45, .9, .2)], push(1.0, .62, .5, 1.25, .38, .5))
shot('09 the room in the head', 'l28-0.1', BEDROOM, [], push(1.05), [('grade', (255, 170, 90), .25), ('memory', 'l28', 'l32-0.2')],
     boxes=[((.66, .38, .9, .78), 'CRT TV + N64')])
# 10 THE REMAKE UPGRADES THE WORLD: same setup, world updates in place, Hero Quest + Navi constant
shot('10 REMAKE UPGRADES THE WORLD', 'l32-0.1', FIELD, [hero('walking_back', .5, .97, .42)], push(1.08, .5, .6),
     [('xfade', FIELD_DAY, 'l33', 'l37.end'), ('caption', 'l33', 'l34', 'NEW VISUALS'), ('caption', 'l34', 'l35', 'VOICED CUTSCENES'),
      ('caption', 'l35', 'l36', 'EXPANDED DIALOGUE'), ('caption', 'l36', 'l37', 'ORCHESTRAL SCORE'), ('caption', 'l37', 'l38', 'MODERN CONTROLS + CAMERA'),
      navi(('l32', .56, .5), ('l38', .55, .48))])
shot('10 · take something beloved', 'l38-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], 'continue', [navi(('l38', .55, .48), ('l42', .56, .5))])
# 11 BETTER IS MEASURABLE / FAMILIAR IS NOT
shot('11 BETTER IS MEASURABLE', 'l42-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], 'continue',
     [('meters', 'l42', 'l47.w4'), navi(('l42', .56, .5), ('l48', .55, .48))])
# 12 EVERY IMPROVEMENT CHANGES SOMETHING
shot('12A empty field 1998', 'l48-0.1', FIELD, [young('walking_back', .5, .9, .15)], push(1.0, .5, .5, 1.2, .5, .6))
shot('12A rebuilt literally', 'l49-0.1', FIELD_DAY, [], push(1.0, .5, .5, 1.1, .5, .55), [('caption', 'l50', 'l51-0.2', '...EMPTY')])
shot('12B the silent hero', 'l51-0.1', FIELD_DAY, [hero('quest2:thinking_chin', .5, 1.02, .9)], push(1.05, .5, .45), [('voice', 'l52', 'l54-0.2'), hover('l51', 'l54', .7, .3)])
shot('12C the camera you fought', 'l54-0.1', FIELD, [hero('walking_back', .5, .97, .42)], push(1.12, .4, .55, 1.12, .6, .55), [('jitter', 'l54', 'l55+0.3'), navi(('l54', .56, .5), ('l58', .5, .46))])
shot('12C · fix it', 'l56-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], push(1.0, .5, .55, 1.12, .5, .6), [navi(('l56', .55, .5), ('l58', .58, .5), ('l58.end', .56, .52))])
shot('12 · every improvement', 'l59-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], 'continue', [navi(('l59', .56, .52), ('l63', .55, .48))])
# 13 ONE REMAKE, TWO AUDIENCES: one Hyrule; player one = Quest (returning), player two = Pixie (new) — no labels
shot('13 TWO AUDIENCES', 'l63-0.1', FIELD_DAY, [hero('walking_back', .4, .97, .4), pixie('looking_up_awe', .63, .97, .34, costume='forest')], push(1.05),
     [navi(('l63', .5, .45), ('l66', .5, .42))])
shot('13 · player one knows', 'l66-0.1', FIELD_DAY, [hero('quest2:nostalgic_smile', .5, 1.02, .85)], push(1.1, .5, .45), [('echo', 'young', 'l66', 'l67')])
# 14 THE RETURNING PLAYER ALREADY KNOWS: chain of recognition
shot('14 ocarina', 'l67-0.1', RELICS, [], push(1.1), [('relic', 'l67-0.1', 'l68-0.1', 'MISSING · ocarina (own 3D prop next, free)')])
shot('14 the sword', 'l68-0.1', TEMPLE, [hero('walking_back', .5, .95, .45)], push(1.0, .5, .55, 1.25, .5, .6), [('glow', 'l68.w7', 'l69', .5, .55, .2, (210, 220, 255), .5)])
shot('14 three golden triangles', 'l69-0.1', DARK, [], push(1.04), [('triforce', 'l69-0.1', 'l70-0.1')])
shot('14 a very bad decision', 'l69.w13-0.1', STORM, [], push(1.0, .5, .5, 1.15, .5, .45), [('villain', 'l69.w13', 'l70-0.1')])
shot('14 wisdom, power, courage', 'l70-0.1', DARK, [], STILL, [('triforce_names', 'l70-0.1', 'l71-0.1')])
# 15 PLAYER TWO MEETS THE GREAT DEKU TREE: Pixie (player two) small before the tree
shot('15 PLAYER TWO', 'l71-0.1', TREE, [pixie('looking_up_awe', .5, .95, .3, costume='forest')], push(1.0, .5, .55, 1.12, .5, .6), [hover('l71', 'l75', .58, .55, .7)])
# 16 SAME HYRULE, TWO INTERNAL WORLDS
shot('16 SAME HYRULE', 'l75-0.1', FIELD_DAY, [pixie('looking_up_awe', .55, .97, .32, costume='forest')], push(1.04, .5, .55), [hover('l75', 'l78', .62, .5)])
shot('16 · two jobs', 'l78-0.1', FIELD_DAY, [hero('walking_back', .4, .97, .4), pixie('wave_happy', .63, .97, .34, costume='forest')], push(1.04),
     [('card', 'l80', 'l81-0.1', '1998  →  2026'), ('card', 'l82', 'l84-0.2', 'DISCOVERY, AGAIN')])
shot('16 · looking for the Hyrule in their head', 'l84-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], push(1.06),
     [('echo', 'young', 'l85', 'l86'), ('echo', 'room', 'l85.w5', 'l86+0.6'), ('echo', 'pixie_forest', 'l85.w7', 'l86+1.2'), navi(('l84', .56, .5), ('l87', .55, .47))])
# 17 THE SAFE REMAKE / MUSEUM
shot('17 SAFE REMAKE / MUSEUM', 'l87-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], STILL,
     [('glass', 'l87', 'l93.w4'), ('caption', 'l88', 'l89', 'SHARPER TEXTURES'), ('caption', 'l89', 'l90', 'BETTER RESOLUTION'), ('caption', 'l90', 'l91', 'CLEANER CONTROLS')])
# 18 OCARINA FELT NEW: flat -> depth, Navi travels foreground -> background
shot('18 FELT NEW', 'l94-0.1', FIELD, [hero('walking_back', .5, .97, .42)], push(1.0, .5, .5, 1.3, .5, .5),
     [('flat', 'l94', 'l96.w6'), navi(('l96', .2, .85, 2.2), ('l97', .5, .5, 1.0), ('l99', .52, .42, .45))])
# 19 TIME MATTERED: temple, fixed axis, young -> adult
shot('19 TIME MATTERED', 'l100-0.1', TEMPLE, [], STILL,
     [('swap_char', young('walking_back', .5, .95, .5), hero('walking_back', .5, .95, .5), 'l104', 'l106'), hover('l100', 'l109', .58, .55), ('flash', 'l103', .3), ('darken', 'l105', 'l106', .45)])
shot('19 · two eras', 'l108-0.1', TEMPLE, [hero('walking_back', .5, .95, .5)], 'continue_to', [hover('l108', 'l109', .58, .55)])
S[-1]['cam'] = ('continue_to', (1.12, .5, .6))
# 20 PRESERVE THE FEELING, NOT THE LIMITATION
shot('20 PRESERVE THE FEELING', 'l109-0.1', FIELD_DAY, [hero('walking_back', .5, .97, .42)], STILL, [('glass_fade', 'l109', 'l112')])
shot('20 · feel that again', 'l112-0.1', FIELD_DAY, [], push(1.0, .5, .55, 1.12, .5, .6),
     [('walker', hero('walking_back', .45, .97, .42), 'l112', 'l115', (.45, .97, .42), (.52, .9, .3)), navi(('l112', .6, .5), ('l115', .55, .4, .7))])
# 21 THE ORIGINAL STILL EXISTS: back to the N64 in the living room
shot('21 THE ORIGINAL STILL EXISTS', 'l115-0.1', LIVING, [dict(img=N64_SETUP, full=True), quest('quest2:nostalgic_smile', .55, .87, .6)], push(1.0, .5, .5, 1.2, .6, .58))
shot('21 · why do we want it again', 'l119-0.1', LIVING, [dict(img=N64_SETUP, full=True), quest('quest2:thinking_chin', .55, .87, .6)], push(1.5, .58, .45, 1.6, .58, .45))
# 22 WHAT STAYS / WHAT CHANGES
shot('22 the forest', 'l121-0.1', FOREST, [young('walking_back', .5, .95, .45)], push(1.08), [hover('l121', 'l122', .56, .45)])
shot('22 the ocarina', 'l122-0.1', RELICS, [], push(1.06), [('relic', 'l122-0.1', 'l123-0.1', 'MISSING · ocarina (own 3D prop next, free)')])
shot('22 the sword waits', 'l123-0.1', TEMPLE, [], push(1.0, .5, .55, 1.3, .5, .62))
shot('22 the Triforce', 'l124-0.1', DARK, [], STILL, [('triforce_names', 'l124-0.1', 'l125-0.1')])
shot('22 the person holding the controller', 'l125-0.1', LIVING, [dict(img=N64_SETUP, full=True), quest('quest2:floor_gaming', .52, .95, .5)], push(1.1, .55, .6))
# 23 SARIA CALLBACK -> adult in the same forest
shot('23 CALLBACK: childhood forest', 'l126-0.1', FOREST, [young('quest2:thinking_chin', .38, .95, .5), pixie('wave_happy', .62, .95, .4, costume='forest', young=True)], push(1.04), [hover('l126', 'l128', .5, .4)])
shot('23 · the child became an adult', 'l128-0.1', FOREST, [hero('quest2:nostalgic_smile', .4, .97, .62)], 'continue', [hover('l128', 'l130', .55, .4)])
# 24 EPONA / SAME ROAD
shot('24 SAME ROAD (young, on foot)', 'l130-0.1', FIELD, [], push(1.15, .5, .62),
     [('walker', young('walking_back', .5, .98, .3), 'l130', 'l130.w8', (.5, .98, .3), (.5, .8, .16)), navi(('l130', .56, .6, .6), ('l130.w8', .53, .5, .5))])
shot('24 · decades later (adult, on horseback)', 'l130.w9-0.1', SUNSET, [], push(1.15, .5, .62),
     [('epona', 'l130.w9', 'l131-0.1'), navi(('l130.w9', .62, .45), ('l131', .58, .43))])
# 25 SAME ROAD. DIFFERENT PERSON.
shot('25 SAME ROAD. DIFFERENT PERSON.', 'l131-0.1', SUNSET, [hero('walking_back', .42, .97, .45)], push(1.04, .5, .58, 1.12, .48, .6),
     [('echo', 'young', 'l132', 'l133'), hover('l131', 'l137', .52, .5)], boxes=[((.52, .5, .82, .97), 'his own horse, standing (NEW_ART)')])
# 26 YOU CANNOT REBUILD THE ROOM
shot('26 YOU CANNOT REBUILD THE ROOM', 'l137-0.1', BEDROOM, [quest('quest2:nostalgic_smile', .3, .95, .62)], push(1.0, .5, .5, 1.1, .55, .55),
     [('grade', (255, 170, 90), .2), ('echo', 'child_room', 'l144', 'l145')], boxes=[((.66, .38, .9, .78), 'CRT TV + N64')])
# 27 BUT IT CAN REBUILD HYRULE
shot('27 BUT IT CAN REBUILD HYRULE', 'l145-0.1', BEDROOM, [quest('quest2:nostalgic_smile', .3, .95, .62)], 'continue',
     [('glow', 'l145', 'l147', .78, .55, .55, (255, 245, 220), .9), navi(('l145.w3', .78, .5), ('l147', .6, .45))], boxes=[((.66, .38, .9, .78), 'CRT TV + N64')])
shot('27 · two moments meet', 'l147-0.1', FIELD, [hero('walking_back', .5, .97, .42)], push(1.0, .5, .55, 1.08, .5, .58), [('fade', 'l147-0.1', 'l147+0.6', 'in', (255, 245, 220))])
# 28 THE PERSON YOU BECAME
shot('28 THE PERSON YOU BECAME', 'l149-0.1', FIELD, [hero('quest2:nostalgic_smile', .5, 1.02, .88)], push(1.04, .5, .45),
     [('echo', 'young', 'l149', 'l150'), ('echo', 'room', 'l150', 'l151'), hover('l149', 'l151', .7, .32)])
# 29 YOU BOTH GREW UP: final hero image, hold
shot('29 YOU BOTH GREW UP', 'l151-0.1', SUNSET, [hero('walking_back', .42, .97, .45)], push(1.0, .5, .58, 1.06, .48, .6),
     [hover('l151', 'l155', .5, .5), ('echo', 'young', 'l152', 'l153')], boxes=[((.52, .5, .82, .97), 'his own horse, standing beside him (NEW_ART)')])
# 30 SECONDQUEST CTA
shot('30 CTA', 'l155-0.1', SUNSET, [hero('walking_back', .42, .97, .45)], 'continue',
     [('brand', 'l155', 'end'), hover('l155', 'l157.end', .5, .5)], boxes=[((.52, .5, .82, .97), 'his own horse (NEW_ART)')])


# ------------------------------------------------------------------ FX
def tri_plates():
    out = {}
    for n in ('power', 'wisdom', 'courage', 'crest'):
        im = Image.open(TRI / f'plate_{n}.png').convert('RGBA').resize((720, 720), Image.LANCZOS)
        out[n] = im
    return out
TRI_IM = None


def villain_sil():
    im = Image.open(TRI / 'plate_power.png').convert('RGBA').resize((720, 720), Image.LANCZOS)
    return im


def fx_apply(fr, sh, t, box, t1):
    d = ImageDraw.Draw(fr)
    global TRI_IM
    for f in sh['fx']:
        kind = f[0]
        if kind == 'fairy':
            keys = [(T(a), x, y, (s[0] if s else 1)) for a, x, y, *s in f[1]]
            if t >= keys[0][0] - 0.05:
                fr = fairy_fx.draw(fr, [k[:3] for k in keys], t, size=float(0.07 * np.interp(t, [k[0] for k in keys], [k[3] for k in keys])))
        elif kind == 'glow':
            _, a, b, x, y, r, col, peak = f
            ta, tb = T(a), T(b)
            if ta <= t <= tb:
                k = (t - ta) / max(.01, tb - ta)
                sx, sy = to_screen(x, y, box)
                fr = CART.glow(fr, sx, sy, r * H * 1.6, col, peak * math.sin(math.pi * k))
        elif kind == 'flash':
            ta = T(f[1])
            if 0 <= t - ta < f[2]:
                fr = Image.blend(fr, Image.new('RGB', fr.size, 'white'), 0.7 * (1 - (t - ta) / f[2]))
        elif kind == 'grade':
            ov = Image.new('RGB', fr.size, f[1]); fr = Image.blend(fr, ov, f[2])
        elif kind == 'darken':
            ta, tb = T(f[1]), T(f[2])
            if t >= ta:
                k = min(1, (t - ta) / max(.01, tb - ta)) * f[3]
                fr = Image.blend(fr, Image.new('RGB', fr.size, (20, 20, 40)), k)
        elif kind == 'fade':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                k = (t - ta) / (tb - ta)
                fr = Image.blend(fr, Image.new('RGB', fr.size, f[4]), 1 - k if f[3] == 'in' else k)
        elif kind == 'xfade':
            ta, tb = T(f[2]), T(f[3])
            if t >= ta:
                k = ease((t - ta) / max(.01, tb - ta))
                other = shot_base(dict(sh, plate=f[1]))
                fr = Image.blend(fr, other.crop(box).resize((W, H), Image.BILINEAR), k)
        elif kind in ('caption', 'card'):
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                font = FBIG if kind == 'card' else F(30)
                tw = d.textlength(f[3], font=font)
                y = H * .42 if kind == 'card' else H * .14
                d = ImageDraw.Draw(fr)
                d.rectangle(((W - tw) / 2 - 18, y - 10, (W + tw) / 2 + 18, y + (60 if kind == 'card' else 44)), fill=(10, 10, 20))
                d.text(((W - tw) / 2, y), f[3], font=font, fill=(255, 225, 140))
        elif kind == 'relic':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                fr = CART.glow(fr, W / 2, H / 2, 300, (180, 200, 255), .5)
                d = ImageDraw.Draw(fr)
                d.rectangle((W / 2 - 170, H / 2 - 120, W / 2 + 170, H / 2 + 120), outline=(255, 80, 80), width=4)
                d.text((W / 2 - 160, H / 2 - 110), f[3], font=FLAB, fill=(255, 220, 220))
        elif kind in ('triforce', 'triforce_names'):
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                if TRI_IM is None:
                    TRI_IM = tri_plates()
                fr = CART.glow(fr, W / 2, H / 2 - 20, 380, (240, 190, 90), .45)
                k = ease((t - ta) / 0.9) if kind == 'triforce' else 1
                tri = Image.new('RGBA', (720, 720))
                offs = {'power': (0, -260), 'wisdom': (-300, 200), 'courage': (300, 200), 'crest': (0, 300)}
                for n, im in TRI_IM.items():
                    ox, oy = offs[n]
                    tri.alpha_composite(im, (int(ox * (1 - k)), int(oy * (1 - k))))
                tri = tri.crop((90, 90, 630, 630)).resize((560, 560), Image.LANCZOS)
                base = fr.convert('RGBA'); base.alpha_composite(tri, (W // 2 - 280, H // 2 - 300)); fr = base.convert('RGB')
                if kind == 'triforce_names':
                    d = ImageDraw.Draw(fr)
                    for i, (word, (x, y)) in enumerate((('WISDOM', (W / 2 - 330, H / 2 + 70)), ('POWER', (W / 2 - 60, H / 2 - 330)), ('COURAGE', (W / 2 + 200, H / 2 + 70)))):
                        if t >= ta + 0.5 + i * 0.6:
                            d.text((x, y), word, font=F(32), fill=(245, 232, 200), stroke_width=3, stroke_fill='black')
        elif kind == 'villain':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                d = ImageDraw.Draw(fr)
                d.rectangle((W / 2 - 150, H * .18, W / 2 + 150, H * .82), outline=(255, 70, 70), width=4, fill=(20, 5, 5))
                d.text((W / 2 - 140, H * .18 + 10), 'MISSING · villain (Ganondorf-like)', font=FLAB, fill=(255, 220, 220))
        elif kind == 'epona':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                k = (t - ta) / (tb - ta)
                x = lin(-.1, .75, k) * W
                d = ImageDraw.Draw(fr)
                d.rectangle((x - 140, H * .45, x + 140, H * .85), outline=(255, 70, 70), width=4, fill=(60, 15, 15))
                d.text((x - 130, H * .45 + 8), 'MISSING · adult hero Quest on his horse', font=FLAB, fill=(255, 220, 220))
        elif kind == 'tech':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                ov = Image.new('RGBA', fr.size); od = ImageDraw.Draw(ov)
                hz = H * .55
                for k in range(-12, 13):
                    od.line([(W / 2 + k * 30, hz), (W / 2 + k * 160, H)], fill=(80, 255, 200, 150), width=2)
                for k in range(8):
                    y = hz + (H - hz) * (k / 8) ** 1.6
                    od.line([(0, y), (W, y)], fill=(80, 255, 200, 150), width=2)
                for i, (lab, at) in enumerate((('POLYGONS: 4,096', 'l21'), ('TEXTURE: 64 x 64', 'l21.w4'), ('480i', 'l21.w7'), ('N64 TEXTURE FILTERING', 'l23.w5'))):
                    if t >= T(at):
                        od.rectangle((W - 360, 60 + i * 44, W - 30, 96 + i * 44), fill=(0, 20, 20, 210))
                        od.text((W - 350, 66 + i * 44), lab, font=F(22), fill=(110, 255, 210))
                base = fr.convert('RGBA'); base.alpha_composite(ov); fr = base.convert('RGB')
        elif kind == 'meters':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                d = ImageDraw.Draw(fr)
                rows = (('GEOMETRY', 'l43'), ('LIGHTING', 'l44'), ('ANIMATION', 'l45'), ('SOUND', 'l46'), ('CAMERA', 'l46.end'))
                for i, (lab, at) in enumerate(rows):
                    k = ease((t - T(at)) / 0.6) if t >= T(at) else 0
                    y = 60 + i * 46
                    d.rectangle((30, y, 400, y + 34), fill=(10, 14, 24))
                    d.text((40, y + 6), lab, font=F(20), fill=(220, 230, 255))
                    d.rectangle((190, y + 8, 190 + 200 * k, y + 26), fill=(110, 230, 140))
        elif kind == 'notes':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                d = ImageDraw.Draw(fr)
                for i in range(6):
                    ph = (t - ta) * 0.6 + i / 6
                    x = W * (.25 + .5 * ((i * .37) % 1)); y = H * (.7 - (ph % 1) * .5)
                    d.text((x, y), '♪' if i % 2 else '♫', font=F(46), fill=(255, 245, 210), stroke_width=2, stroke_fill=(60, 40, 20))
        elif kind == 'memory':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                k = math.sin(math.pi * (t - ta) / (tb - ta))
                other = shot_base(dict(sh, plate=FIELD, layers=[], boxes=[])).resize((W, H))
                fr = Image.blend(fr, other, .35 * k)
        elif kind == 'voice':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                d = ImageDraw.Draw(fr)
                for i in range(18):
                    a = abs(math.sin(t * 9 + i)) * 40 + 6
                    x = W * .62 + i * 14
                    d.rectangle((x, H * .3 - a, x + 8, H * .3 + a), fill=(255, 225, 140))
        elif kind == 'jitter':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                fr = fr.transform(fr.size, Image.AFFINE, (1, 0, 9 * math.sin(t * 23), 0, 1, 6 * math.cos(t * 17)))
        elif kind == 'glass':
            ta, tc = T(f[1]), T(f[2])
            if t >= ta:
                d = ImageDraw.Draw(fr)
                d.rectangle((70, 50, W - 70, H - 50), outline=(235, 240, 255), width=6)
                for k in range(4):
                    d.line([(160 + k * 220, 70), (60 + k * 220, H - 70)], fill=(255, 255, 255), width=3)
                if t >= tc:
                    for k in range(9):
                        a = k * 40 + 10
                        d.line([(W * .55, H * .45), (W * .55 + math.cos(math.radians(a)) * 420, H * .45 + math.sin(math.radians(a)) * 420)], fill=(255, 255, 255), width=3)
        elif kind == 'glass_fade':
            ta, tb = T(f[1]), T(f[2])
            k = 1 - min(1, max(0, (t - ta) / (tb - ta)))
            if k > 0:
                ov = Image.new('RGBA', fr.size); od = ImageDraw.Draw(ov)
                od.rectangle((70, 50, W - 70, H - 50), outline=(235, 240, 255, int(255 * k)), width=6)
                base = fr.convert('RGBA'); base.alpha_composite(ov); fr = base.convert('RGB')
        elif kind == 'flat':
            ta, tb = T(f[1]), T(f[2])
            if ta <= t <= tb:
                k = ease((t - ta) / (tb - ta))
                sq = fr.resize((W, max(2, int(H * lin(.45, 1, k)))))
                bg = Image.new('RGB', fr.size, (20, 20, 30)); bg.paste(sq, (0, (H - sq.height) // 2)); fr = bg
        elif kind == 'echo':
            ta, tb = T(f[2]), T(f[3])
            if ta <= t <= tb:
                k = math.sin(math.pi * (t - ta) / (tb - ta)) * .38
                ech = {'young': young('walking_back', .3, .97, .3), 'child_room': young('quest2:floor_gaming', .4, .95, .4),
                       'pixie_forest': pixie('wave_happy', .72, .97, .3, costume='forest', young=True), 'room': None}[f[1]]
                if ech is None:
                    other = plate(BEDROOM).resize((W, H)); fr = Image.blend(fr, other, k * .7)
                else:
                    lay = Image.new('RGBA', (PW, PH)); place(lay, dict(ech, shadow=False, label=None, costume=ech.get('costume')))
                    lay = lay.crop(box).resize((W, H))
                    al = lay.getchannel('A').point(lambda v: int(v * k)); lay.putalpha(al)
                    base = fr.convert('RGBA'); base.alpha_composite(lay); fr = base.convert('RGB')
        elif kind == 'swap_char':
            a_spec, b_spec, ta, tb = f[1], f[2], T(f[3]), T(f[4])
            lay = Image.new('RGBA', (PW, PH))
            if t < ta:
                place(lay, a_spec)
            elif t >= tb:
                place(lay, b_spec)
            else:
                k = (t - ta) / (tb - ta)
                tmp = Image.new('RGBA', (PW, PH)); place(tmp, dict(a_spec, label=None)); al = tmp.getchannel('A').point(lambda v: int(v * max(0, 1 - 2 * k))); tmp.putalpha(al); lay.alpha_composite(tmp)
            lay = lay.crop(box).resize((W, H))
            base = fr.convert('RGBA'); base.alpha_composite(lay); fr = base.convert('RGB')
        elif kind == 'walker':
            spec_, ta, tb, p0, p1 = f[1], T(f[2]), T(f[3]), f[4], f[5]
            k = ease((t - ta) / max(.01, tb - ta))
            lay = Image.new('RGBA', (PW, PH))
            place(lay, dict(spec_, x=lin(p0[0], p1[0], k), y=lin(p0[1], p1[1], k), h=lin(p0[2], p1[2], k)))
            lay = lay.crop(box).resize((W, H))
            base = fr.convert('RGBA'); base.alpha_composite(lay); fr = base.convert('RGB')
        elif kind == 'brand':
            ta = T(f[1]); k = min(1, max(0, (t - ta) / 2.5))
            if k > 0:
                wm = Image.open(ROOT / 'public/art/core/brand/secondquest_wordmark.png').convert('RGBA')
                wm.thumbnail((620, 300))
                al = wm.getchannel('A').point(lambda v: int(v * k)); wm.putalpha(al)
                fr = Image.blend(fr, Image.new('RGB', fr.size, (10, 10, 20)), .45 * k)
                base = fr.convert('RGBA'); base.alpha_composite(wm, ((W - wm.width) // 2, int(H * .28))); fr = base.convert('RGB')
    return fr


# ------------------------------------------------------------------ rendering
_base_cache = {}


def shot_base(sh):
    key = (sh['plate'], json.dumps(sh['layers'], sort_keys=True, default=str), json.dumps(sh['boxes'], default=str))
    if key not in _base_cache:
        if len(_base_cache) > 6:
            _base_cache.pop(next(iter(_base_cache)))
        base = plate(sh['plate']).convert('RGBA')
        for b in sh['boxes']:
            missing_box(base, *b)
        for lay in sh['layers']:
            place(base, lay)
        _base_cache[key] = base.convert('RGB')
    return _base_cache[key]


def resolve_cams():
    starts = [T(s['start']) for s in S]
    ends = starts[1:] + [DURATION]
    prev_end = None
    for i, sh in enumerate(S):
        sh['t0'], sh['t1'] = starts[i], ends[i]
        c = sh['cam']
        if c == 'continue':
            sh['camv'] = (prev_end, prev_end)
        elif isinstance(c, tuple) and c and c[0] == 'continue_to':
            sh['camv'] = (prev_end, c[1])
        else:
            sh['camv'] = c
        prev_end = sh['camv'][1]


def render(t):
    if t < SEQ01_END:
        return CART.render(t)
    sh = next(s for s in reversed(S) if s['t0'] <= t)
    k = (t - sh['t0']) / max(.01, sh['t1'] - sh['t0'])
    box = cam_box(sh['camv'], k)
    fr = shot_base(sh).crop(box).resize((W, H), Image.BILINEAR)
    fr = fx_apply(fr, sh, t, box, sh['t1'])
    d = ImageDraw.Draw(fr)
    tag(d, f"EP002 FULL ANIMATIC v1 · SEQ {sh['seq']} · PLANNING ONLY")
    subtitle(d, t)
    return fr


def missing_list():
    items = {}
    for sh in S:
        for lay in sh['layers']:
            lab = label_for(lay)
            if lab and 'MISSING' in lab:
                items.setdefault(lab, set()).add(sh['seq'].split(' ')[0])
        for b in sh['boxes']:
            items.setdefault('MISSING · ' + b[1], set()).add(sh['seq'].split(' ')[0])
        if sh['plate'][0] == 'proc' and sh['plate'][1] != 'dark':
            items.setdefault(f"MISSING · plate: {sh['plate'][1]} {dict(sh['plate'][2]) if len(sh['plate']) > 2 else ''}", set()).add(sh['seq'].split(' ')[0])
        for f in sh['fx']:
            if f[0] in ('relic',):
                items.setdefault(f[3], set()).add(sh['seq'].split(' ')[0])
            if f[0] == 'villain':
                items.setdefault('MISSING · villain (Ganondorf-like)', set()).add(sh['seq'].split(' ')[0])
            if f[0] == 'epona':
                items.setdefault('MISSING · adult hero Quest on his horse', set()).add(sh['seq'].split(' ')[0])
    return {k: sorted(v) for k, v in sorted(items.items())}


def main():
    resolve_cams()
    if '--stills' in sys.argv:
        tiles = []
        for sh in S:
            t = (sh['t0'] + sh['t1']) / 2
            im = render(t).resize((320, 180)); d = ImageDraw.Draw(im)
            d.rectangle((0, 160, 320, 180), fill=(0, 0, 0)); d.text((4, 162), f"{sh['seq'][:44]}", font=F(11), fill=(255, 220, 140))
            tiles.append(im)
        cols = 6; rows = math.ceil(len(tiles) / cols)
        sheet = Image.new('RGB', (cols * 320, rows * 180))
        for i, im in enumerate(tiles):
            sheet.paste(im, ((i % cols) * 320, (i // cols) * 180))
        sheet.save(ROOT / 'docs/ep002/EP002_full_animatic_v1_sheet.jpg', quality=85)
        print('sheet', len(tiles), 'shots')
        return
    out = ROOT / 'docs/ep002/EP002_full_animatic_v1.mp4'
    ev = CART.sfx_events()
    ins, chains = [], []
    for k, (name, at_, gain) in enumerate(ev):
        src, vol = (name, 1.0) if isinstance(name, Path) else (ROOT / 'public' / CART.SFX[name]['src'].lstrip('/'), CART.SFX[name]['volume'])
        ins += ['-i', str(src)]
        chains.append(f'[{k + 2}:a]aformat=channel_layouts=mono,volume={vol * gain:.3f},adelay={int(at_ * 1000)}:all=1[s{k}]')
    mix = ';'.join(chains) + ';[1:a]' + ''.join(f'[s{k}]' for k in range(len(ev))) + f'amix=inputs={len(ev) + 1}:normalize=0:duration=first[a]'
    p = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', str(ROOT / 'public/episodes/ep002/audio/narration.wav'), *ins, '-filter_complex', mix, '-map', '0:v', '-map', '[a]',
                          '-c:v', 'libx264', '-crf', '24', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', str(out)], stdin=subprocess.PIPE)
    n = int(DURATION * FPS)
    for i in range(n):
        p.stdin.write(render(i / FPS).tobytes())
        if i % 1200 == 0:
            print(f'{i}/{n}', flush=True)
    p.stdin.close(); p.wait()
    ml = missing_list()
    (ROOT / 'docs/ep002/EP002_full_animatic_v1_MISSING.json').write_text(json.dumps(ml, indent=1, ensure_ascii=False))
    print(out.relative_to(ROOT), f'{DURATION:.1f}s', len(S), 'shots;', len(ml), 'missing items')


if __name__ == '__main__':
    main()
