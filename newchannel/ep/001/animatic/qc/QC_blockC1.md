# QC · blockC1

File: `blockC1_review.mp4` · 48.70 s · 30/1 fps · 6.02 MB · 1.0 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 6.02 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.1 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.1 dBTP, LRA 2.9 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 48.7 |
| shots | 12 |
| avg_shot_s | 4.06 |
| longest_shot_s | 9.0 |
| cuts_per_min | 13.6 |
| motion_share | 0.89 |
| still_2s_runs | 0 |
| brightness_mean | 0.72 |
| saturation_mean | 0.132 |
| wpm_overall | 138 |
| wpm_while_speaking | 180 |

```
PASS  cuts_per_min           13.6   target >= 12.0
PASS  avg_shot_s             4.06   target <= 5.0
PASS  longest_shot_s          9.0   target <= 25.0
PASS  motion_share           0.89   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             138   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockC1.jpg` (1 tile every 1 s).
