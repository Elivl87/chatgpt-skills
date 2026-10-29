# QC · blockE1

File: `blockE1_review.mp4` · 48.81 s · 30/1 fps · 8.96 MB · 1.5 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 8.96 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.3 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -2.3 dBTP, LRA 2.7 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 48.8 |
| shots | 20 |
| avg_shot_s | 2.44 |
| longest_shot_s | 4.5 |
| cuts_per_min | 23.3 |
| motion_share | 0.928 |
| still_2s_runs | 0 |
| brightness_mean | 0.64 |
| saturation_mean | 0.312 |
| wpm_overall | 156 |
| wpm_while_speaking | 193 |

```
PASS  cuts_per_min           23.3   target >= 12.0
PASS  avg_shot_s             2.44   target <= 5.0
PASS  longest_shot_s          4.5   target <= 25.0
PASS  motion_share          0.928   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             156   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockE1.jpg` (1 tile every 1 s).
