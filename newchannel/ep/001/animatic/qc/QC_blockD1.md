# QC · blockD1

File: `blockD1_review.mp4` · 66.64 s · 30/1 fps · 13.96 MB · 1.7 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 13.96 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.8 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -2.8 dBTP, LRA 2.2 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 66.7 |
| shots | 24 |
| avg_shot_s | 2.78 |
| longest_shot_s | 6.84 |
| cuts_per_min | 20.7 |
| motion_share | 0.932 |
| still_2s_runs | 1 |
| brightness_mean | 0.653 |
| saturation_mean | 0.346 |
| wpm_overall | 154 |
| wpm_while_speaking | 197 |

```
PASS  cuts_per_min           20.7   target >= 12.0
PASS  avg_shot_s             2.78   target <= 5.0
PASS  longest_shot_s         6.84   target <= 25.0
PASS  motion_share          0.932   target >= 0.5
PASS  still_2s_per_min        0.9   target <= 6.0
PASS  wpm_overall             154   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockD1.jpg` (1 tile every 1 s).
