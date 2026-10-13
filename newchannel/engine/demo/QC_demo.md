# QC · demo

File: `demo.mp4` · 18.20 s · 30/1 fps · 24.03 MB · 10.6 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1920x1080 |
| file size <= 30 MB (chat delivery) | **PASS** | 24.03 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.4 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.4 dBTP, LRA 9.5 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 18.2 |
| shots | 4 |
| avg_shot_s | 4.54 |
| longest_shot_s | 6.5 |
| cuts_per_min | 9.9 |
| motion_share | 0.917 |
| still_2s_runs | 0 |
| brightness_mean | 0.868 |
| saturation_mean | 0.104 |

```
FLAG  cuts_per_min            9.9   target >= 12.0
PASS  avg_shot_s             4.54   target <= 5.0
PASS  longest_shot_s          6.5   target <= 25.0
PASS  motion_share          0.917   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_demo.jpg` (1 tile every 0.5 s).

Freeze/silence after the wordmark lands are by design (1 s of air after the sting, README section 6).

Real shot list (timeline.py; style_bible's frame-difference detector misses cuts between two mostly-paper framings, so its cuts/min under-counts):

```
 # shot            start    end   dur  bg
 0 wide_tap         0.00   2.16  2.16  split
 1 ring_count       2.16   4.10  1.94  ring
 2 wide_jam         4.10   5.62  1.52  split
 3 hero_mascot      5.62   9.02  3.40  hero
 4 diagram          9.02  11.72  2.70  dia
 5 wide_end        11.72  14.72  3.00  split
 6 sting           14.72  18.20  3.48  sting
7 shots, 6 camera cuts, 19.8 cuts/min over 18.2 s
```
