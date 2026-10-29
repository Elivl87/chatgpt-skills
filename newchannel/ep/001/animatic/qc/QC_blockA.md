# QC · blockA

File: `blockA_review.mp4` · 47.10 s · 30/1 fps · 9.71 MB · 1.6 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 9.71 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.6 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.6 dBTP, LRA 7.2 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 47.2 |
| shots | 23 |
| avg_shot_s | 2.05 |
| longest_shot_s | 3.83 |
| cuts_per_min | 28.0 |
| motion_share | 0.837 |
| still_2s_runs | 0 |
| brightness_mean | 0.612 |
| saturation_mean | 0.363 |
| wpm_overall | 111 |
| wpm_while_speaking | 186 |

```
PASS  cuts_per_min           28.0   target >= 12.0
PASS  avg_shot_s             2.05   target <= 5.0
PASS  longest_shot_s         3.83   target <= 25.0
PASS  motion_share          0.837   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall             111   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockA.jpg` (1 tile every 1 s).
