#!/usr/bin/env python3
"""EP002 timing animatic (planning only, never enters the video or the art library).

  python3 scripts/ep002-animatic.py

Places the real-asset audit previews (docs/ep002/audit/*.jpg, MISSING boxes included) on the
Director's Scene Book sequences, timed to the real Bram narration (episodes/ep002/timings.json),
with the script line burned in. Output: docs/ep002/EP002_animatic_v2.mp4 (960x540, 12 fps).
"""
import json, math, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
AUD = ROOT / 'docs/ep002/audit'
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()  # Remotion's bundled ffmpeg has no rawvideo demuxer
W, H, FPS = 960, 540, 12
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s)
FSUB, FTAG = F(22), F(14)

# (first script line, Scene Book sequence, preview)
CUTS = [
    ('l01', '01 PHYSICAL MEMORY', 'A1_memory_room_hook'),
    ('l03', '02 QUEST ENTERS OCARINA', 'B_entry_threshold'),
    ('l04', '03 THE THREE ANCHORS', 'D_relics'),
    ('l07', '04 YOU', 'C1_field_castle_rescue'),
    ('l11', '05 THE GAME + THE ROOM', 'A2_memory_room_child_and_empty'),
    ('l15', '06 SARIA / CHILDHOOD', 'E_kokiri_saria'),
    ('l16', '05 THE GAME + THE ROOM', 'A2_memory_room_child_and_empty'),
    ('l17', '07 BECAUSE YOU WERE SMALLER', 'C1_field_castle_rescue'),
    ('l20', "08 MEMORY DOESN'T REMEMBER SPECS", 'H1_tech_overlay'),
    ('l24', '09 THE WORLD IN YOUR HEAD', 'E_kokiri_saria'),
    ('l25', '09 THE WORLD IN YOUR HEAD', 'C1_field_castle_rescue'),
    ('l27', '09 THE WORLD IN YOUR HEAD', 'C2_field_storm_horizon'),
    ('l28', '09 THE WORLD IN YOUR HEAD', 'A2_memory_room_child_and_empty'),
    ('l32', '10 THE REMAKE UPGRADES THE WORLD', 'C1_field_castle_rescue'),
    ('l42', '11 BETTER IS MEASURABLE', 'H2_measurable'),
    ('l47', '11 FAMILIAR IS NOT (metrics removed)', 'C1_field_castle_rescue'),
    ('l48', '12 EVERY IMPROVEMENT CHANGES SOMETHING', 'C2_field_storm_horizon'),
    ('l51', '12 EVERY IMPROVEMENT CHANGES SOMETHING', 'C1_field_castle_rescue'),
    ('l63', '13 ONE REMAKE, TWO AUDIENCES', 'C1_field_castle_rescue'),
    ('l67', '14 THE RETURNING PLAYER KNOWS (ocarina)', 'D_relics'),
    ('l68', '14 THE RETURNING PLAYER KNOWS (Master Sword)', 'F_temple_of_time'),
    ('l69', '14 THE RETURNING PLAYER KNOWS (Zelda / Ganondorf)', 'I_zelda_ganondorf'),
    ('l71', '15 PLAYER TWO MEETS THE GREAT DEKU TREE', 'G_deku_tree'),
    ('l75', '16 SAME HYRULE, TWO INTERNAL WORLDS', 'C2_field_storm_horizon'),
    ('l84', '16 SAME HYRULE, TWO INTERNAL WORLDS', 'C1_field_castle_rescue'),
    ('l87', '17 THE SAFE REMAKE / MUSEUM', 'H3_museum_glass'),
    ('l94', '18 OCARINA FELT NEW', 'C2_field_storm_horizon'),
    ('l100', '19 TIME MATTERED (Temple of Time)', 'F_temple_of_time'),
    ('l109', '20 PRESERVE THE FEELING', 'H3_museum_glass'),
    ('l115', '21 THE ORIGINAL STILL EXISTS', 'A1_memory_room_hook'),
    ('l121', '22 WHAT STAYS (forest)', 'E_kokiri_saria'),
    ('l122', '22 WHAT STAYS (ocarina)', 'D_relics'),
    ('l123', '22 WHAT STAYS (Master Sword)', 'F_temple_of_time'),
    ('l124', '22 WHAT STAYS (Triforce)', 'D_relics'),
    ('l125', '22 WHAT CHANGES', 'A1_memory_room_hook'),
    ('l126', '23 SARIA CALLBACK', 'E_kokiri_saria'),
    ('l130', '24 EPONA / SAME ROAD', 'C3_road_crossroads'),
    ('l131', '25 SAME ROAD. DIFFERENT PERSON.', 'C3_road_crossroads'),
    ('l137', '26 YOU CANNOT REBUILD THE ROOM', 'A2_memory_room_child_and_empty'),
    ('l145', '27 BUT IT CAN REBUILD HYRULE', 'B_entry_threshold'),
    ('l149', '28 THE PERSON YOU BECAME', 'C1_field_castle_rescue'),
    ('l151', '29 YOU BOTH GREW UP (hold)', 'J_final_epona'),
    ('l155', '30 SECONDQUEST CTA', 'J_final_epona'),
]

# Camera continuity (Producer rule 2026-10-03, mirrors src/engine/cameraContinuity.ts):
# consecutive cuts on the same plate share ONE continuous camera move; a plate that returns
# later opens on a framing clearly different from every earlier opening on it.
NEW_SHOT_ZOOM, NEW_SHOT_FOCUS = 1.25, 0.15
FRAMINGS = [  # (move, start zoom, start x, start y, end zoom, end x, end y)
    ('push_in', 1.00, .50, .50, 1.08, .50, .50),
    ('pan_right', 1.30, .40, .50, 1.30, .60, .50),
    ('pull_out', 1.34, .50, .42, 1.12, .50, .48),
    ('pan_left', 1.30, .60, .55, 1.30, .40, .55),
    ('push_in', 1.15, .40, .58, 1.26, .38, .58),
    ('push_in', 1.15, .60, .44, 1.26, .62, .44),
    ('pan_up', 1.32, .50, .60, 1.32, .50, .42),
    ('pull_out', 1.48, .44, .56, 1.20, .48, .53),
    ('pan_right', 1.42, .38, .40, 1.42, .55, .40),
    ('push_in', 1.26, .50, .38, 1.36, .50, .38),
    ('pan_down', 1.32, .50, .40, 1.32, .50, .58),
    ('pan_left', 1.42, .62, .62, 1.42, .45, .62),
    ('push_in', 1.38, .40, .62, 1.48, .40, .62),
    ('pull_out', 1.30, .62, .40, 1.10, .55, .45),
]

def clamp_focus(z, x, y):
    m = 0.5 / z
    return min(max(x, m), 1 - m), min(max(y, m), 1 - m)

def new_shot(a, b):
    return max(a[0], b[0]) / min(a[0], b[0]) >= NEW_SHOT_ZOOM or ((a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5 >= NEW_SHOT_FOCUS

def plan_shots(starts, ends):
    """Merge consecutive cuts on the same preview into one shot and give every shot a camera."""
    shots = []
    for (lid, label, img), a, b in zip(CUTS, starts, ends):
        if shots and shots[-1]['img'] == img:
            shots[-1]['end'] = b; shots[-1]['labels'].append((a, label))
        else:
            shots.append({'img': img, 'start': a, 'end': b, 'labels': [(a, label)]})
    opened = {}
    for sh in shots:
        prev = opened.setdefault(sh['img'], [])
        for f in FRAMINGS:
            st = (f[1], *clamp_focus(f[1], f[2], f[3]))
            if all(new_shot(st, p_[0]) or p_[1] != f[0] for p_ in prev):
                sh['cam'] = (st, (f[4], *clamp_focus(f[4], f[5], f[6])), f[0])
                prev.append((st, f[0]))
                break
        else:
            raise SystemExit(f"CAMERA_REPEAT: no unused framing left for {sh['img']}")
    return shots

def main():
    tm = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())
    cues, dur = tm['cues'], tm['duration']
    starts = [0.0] + [cues[c[0]]['start'] - 0.15 for c in CUTS[1:]]
    ends = starts[1:] + [dur]
    shots = plan_shots(starts, ends)
    imgs = {c[2]: Image.open(AUD / f'{c[2]}.jpg').convert('RGB') for c in CUTS}
    cue_list = list(cues.values())
    out = ROOT / 'docs/ep002/EP002_animatic_v2.mp4'
    p = subprocess.Popen([str(FF), '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', str(ROOT / 'public/episodes/ep002/audio/narration.wav'), '-c:v', 'libx264', '-crf', '26', '-preset', 'medium',
                          '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', str(out)], stdin=subprocess.PIPE)
    si = 0
    for n in range(int(dur * FPS)):
        t = n / FPS
        while si + 1 < len(shots) and t >= shots[si + 1]['start']:
            si += 1
        sh = shots[si]
        k = (t - sh['start']) / max(0.01, sh['end'] - sh['start'])
        e = 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, k)))  # inOutSine
        (z0, x0, y0), (z1, x1, y1), _ = sh['cam']
        z = z0 * (z1 / z0) ** e; x = x0 + (x1 - x0) * e; y = y0 + (y1 - y0) * e
        im = imgs[sh['img']]
        cw, ch = W / z, H / z
        fr = im.crop((x * W - cw / 2, y * H - ch / 2, x * W + cw / 2, y * H + ch / 2)).resize((W, H), Image.BILINEAR)
        fr.paste(im.crop((0, H - 30, W, H)), (0, H - 30))  # the preview's caption bar stays readable
        d = ImageDraw.Draw(fr)
        label = [l for a, l in sh['labels'] if a <= t + 1e-6][-1]
        tag = f'SEQ {label}   ·   ANIMATIC v2 · PLANNING ONLY'
        d.rectangle((0, 0, d.textlength(tag, font=FTAG) + 20, 24), fill=(0, 0, 0))
        d.text((10, 4), tag, font=FTAG, fill=(255, 210, 90))
        line = next((c['text'] for c in cue_list if c['start'] - 0.1 <= t <= c['end'] + 0.25), '')
        if line:
            words, rows, cur = line.split(), [], ''
            for w_ in words:
                if d.textlength(cur + ' ' + w_, font=FSUB) > W - 120 and cur:
                    rows.append(cur); cur = w_
                else:
                    cur = (cur + ' ' + w_).strip()
            rows.append(cur)
            y_ = 462 - 28 * len(rows)
            for r in rows:
                tw = d.textlength(r, font=FSUB)
                d.text(((W - tw) / 2, y_), r, font=FSUB, fill='white', stroke_width=3, stroke_fill='black')
                y_ += 28
        p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait()
    for sh in shots:
        print(f"{sh['start']:7.1f}s {sh['img']:34s} {sh['cam'][2]:9s} start z{sh['cam'][0][0]:.2f} ({sh['cam'][0][1]:.2f},{sh['cam'][0][2]:.2f})")
    print(out, round(out.stat().st_size / 1e6, 1), 'MB')

main()
