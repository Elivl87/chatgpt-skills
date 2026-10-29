# QC · blockE1

File: `blockE1_review.mp4` · 50.67 s · 30/1 fps · 10.05 MB · 1.6 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 10.05 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.7 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -2.7 dBTP, LRA 3.2 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 50.7 |
| shots | 20 |
| avg_shot_s | 2.53 |
| longest_shot_s | 4.67 |
| cuts_per_min | 22.5 |
| motion_share | 0.921 |
| still_2s_runs | 0 |
| brightness_mean | 0.64 |
| saturation_mean | 0.311 |
| wpm_overall | 150 |
| wpm_while_speaking | 187 |

```
PASS  cuts_per_min           22.5   target >= 12.0
PASS  avg_shot_s             2.53   target <= 5.0
PASS  longest_shot_s         4.67   target <= 25.0
PASS  motion_share          0.921   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             150   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockE1.jpg` (1 tile every 1 s).
