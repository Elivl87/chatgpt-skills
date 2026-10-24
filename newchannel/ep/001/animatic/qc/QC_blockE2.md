# QC · blockE2

File: `blockE2_review.mp4` · 72.36 s · 30/1 fps · 15.87 MB · 1.8 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 15.87 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.1 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -1.1 dBTP, LRA 12.2 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 72.2 |
| shots | 27 |
| avg_shot_s | 2.67 |
| longest_shot_s | 13.34 |
| cuts_per_min | 21.6 |
| motion_share | 0.898 |
| still_2s_runs | 0 |
| brightness_mean | 0.611 |
| saturation_mean | 0.343 |
| wpm_overall | 95 |
| wpm_while_speaking | 176 |

```
PASS  cuts_per_min           21.6   target >= 12.0
PASS  avg_shot_s             2.67   target <= 5.0
PASS  longest_shot_s        13.34   target <= 25.0
PASS  motion_share          0.898   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall              95   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockE2.jpg` (1 tile every 1 s).
