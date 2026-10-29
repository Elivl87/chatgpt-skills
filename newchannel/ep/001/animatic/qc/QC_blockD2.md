# QC · blockD2

File: `blockD2_review.mp4` · 73.83 s · 30/1 fps · 16.05 MB · 1.7 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 16.05 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.5 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -2.5 dBTP, LRA 6.7 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 73.8 |
| shots | 30 |
| avg_shot_s | 2.46 |
| longest_shot_s | 6.0 |
| cuts_per_min | 23.6 |
| motion_share | 0.971 |
| still_2s_runs | 0 |
| brightness_mean | 0.625 |
| saturation_mean | 0.319 |
| wpm_overall | 141 |
| wpm_while_speaking | 190 |

```
PASS  cuts_per_min           23.6   target >= 12.0
PASS  avg_shot_s             2.46   target <= 5.0
PASS  longest_shot_s          6.0   target <= 25.0
PASS  motion_share          0.971   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
PASS  wpm_overall             141   target between (135, 165)

all within the style bible
```

Contact sheet: `contact_sheet_blockD2.jpg` (1 tile every 1 s).
