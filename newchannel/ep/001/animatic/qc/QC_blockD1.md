# QC · blockD1

File: `blockD1_draft.mp4` · 63.37 s · 30/1 fps · 7.79 MB · 1.0 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 7.79 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.1 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.1 dBTP, LRA 1.7 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 63.3 |
| shots | 23 |
| avg_shot_s | 2.75 |
| longest_shot_s | 7.16 |
| cuts_per_min | 20.8 |
| motion_share | 0.897 |
| still_2s_runs | 1 |
| brightness_mean | 0.654 |
| saturation_mean | 0.345 |
| wpm_overall | 153 |
| wpm_while_speaking | 193 |

```
PASS  cuts_per_min           20.8   target >= 12.0
PASS  avg_shot_s             2.75   target <= 5.0
PASS  longest_shot_s         7.16   target <= 25.0
PASS  motion_share          0.897   target >= 0.5
PASS  still_2s_per_min        0.9   target <= 6.0
PASS  wpm_overall             153   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockD1.jpg` (1 tile every 1 s).
