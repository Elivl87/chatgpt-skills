#!/usr/bin/env python3
"""EP002 timing animatic (planning only, never enters the video or the art library).

  python3 scripts/ep002-animatic.py

Places the real-asset audit previews (docs/ep002/audit/*.jpg, MISSING boxes included) on the
Director's Scene Book sequences, timed to the real Bram narration (episodes/ep002/timings.json),
with the script line burned in. Output: docs/ep002/EP002_animatic_v1.mp4 (960x540, 12 fps).
"""
import json, subprocess
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

def main():
    tm = json.loads((ROOT / 'episodes/ep002/timings.json').read_text())
    cues, dur = tm['cues'], tm['duration']
    starts = [0.0] + [cues[c[0]]['start'] - 0.15 for c in CUTS[1:]]
    ends = starts[1:] + [dur]
    imgs = {c[2]: Image.open(AUD / f'{c[2]}.jpg').convert('RGB') for c in CUTS}
    cue_list = list(cues.values())
    out = ROOT / 'docs/ep002/EP002_animatic_v1.mp4'
    p = subprocess.Popen([str(FF), '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', str(ROOT / 'public/episodes/ep002/audio/narration.wav'), '-c:v', 'libx264', '-crf', '26', '-preset', 'medium',
                          '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', str(out)], stdin=subprocess.PIPE)
    seg = 0
    for n in range(int(dur * FPS)):
        t = n / FPS
        while seg + 1 < len(CUTS) and t >= starts[seg + 1]:
            seg += 1
        k = (t - starts[seg]) / max(0.01, ends[seg] - starts[seg])
        z = 1.0 + 0.05 * k
        im = imgs[CUTS[seg][2]]
        cw, ch = W / z, H / z
        fr = im.crop(((W - cw) / 2, H - ch, (W + cw) / 2, H)).resize((W, H), Image.BILINEAR)  # bottom-anchored: keeps the caption bar
        d = ImageDraw.Draw(fr)
        tag = f'SEQ {CUTS[seg][1]}   ·   ANIMATIC v1 · PLANNING ONLY'
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
            y = 470 - 28 * len(rows)
            for r in rows:
                tw = d.textlength(r, font=FSUB)
                d.text(((W - tw) / 2, y), r, font=FSUB, fill='white', stroke_width=3, stroke_fill='black')
                y += 28
        p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait()
    print(out, round(out.stat().st_size / 1e6, 1), 'MB')

main()
