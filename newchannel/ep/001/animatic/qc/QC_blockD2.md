# QC · blockD2

File: `blockD2_draft.mp4` · 74.40 s · 30/1 fps · 9.78 MB · 1.1 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 9.78 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.4 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.4 dBTP, LRA 2.7 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 74.3 |
| shots | 34 |
| avg_shot_s | 2.19 |
| longest_shot_s | 4.84 |
| cuts_per_min | 26.6 |
| motion_share | 0.998 |
| still_2s_runs | 0 |
| brightness_mean | 0.617 |
| saturation_mean | 0.292 |
| wpm_overall | 140 |
| wpm_while_speaking | 194 |

```
PASS  cuts_per_min           26.6   target >= 12.0
PASS  avg_shot_s             2.19   target <= 5.0
PASS  longest_shot_s         4.84   target <= 25.0
PASS  motion_share          0.998   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             140   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockD2.jpg` (1 tile every 1 s).
