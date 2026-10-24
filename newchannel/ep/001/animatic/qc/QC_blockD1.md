# QC · blockD1

File: `blockD1_review.mp4` · 71.30 s · 30/1 fps · 13.52 MB · 1.5 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 13.52 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.7 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -2.7 dBTP, LRA 3.1 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 71.3 |
| shots | 24 |
| avg_shot_s | 2.97 |
| longest_shot_s | 5.33 |
| cuts_per_min | 19.3 |
| motion_share | 0.916 |
| still_2s_runs | 1 |
| brightness_mean | 0.654 |
| saturation_mean | 0.345 |
| wpm_overall | 135 |
| wpm_while_speaking | 173 |

```
PASS  cuts_per_min           19.3   target >= 12.0
PASS  avg_shot_s             2.97   target <= 5.0
PASS  longest_shot_s         5.33   target <= 25.0
PASS  motion_share          0.916   target >= 0.5
PASS  still_2s_per_min        0.8   target <= 6.0
PASS  wpm_overall             135   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockD1.jpg` (1 tile every 1 s).
