# QC · blockD2

File: `blockD2_review.mp4` · 80.83 s · 30/1 fps · 16.88 MB · 1.7 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 16.88 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.3 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -2.3 dBTP, LRA 11.9 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 80.8 |
| shots | 33 |
| avg_shot_s | 2.45 |
| longest_shot_s | 6.16 |
| cuts_per_min | 23.8 |
| motion_share | 0.99 |
| still_2s_runs | 0 |
| brightness_mean | 0.626 |
| saturation_mean | 0.3 |
| wpm_overall | 125 |
| wpm_while_speaking | 176 |

```
PASS  cuts_per_min           23.8   target >= 12.0
PASS  avg_shot_s             2.45   target <= 5.0
PASS  longest_shot_s         6.16   target <= 25.0
PASS  motion_share           0.99   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall             125   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockD2.jpg` (1 tile every 1 s).
