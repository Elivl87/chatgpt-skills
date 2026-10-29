# QC · blockA

File: `blockA_review.mp4` · 49.77 s · 30/1 fps · 10.62 MB · 1.7 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 10.62 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.7 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.7 dBTP, LRA 12.6 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 49.8 |
| shots | 23 |
| avg_shot_s | 2.17 |
| longest_shot_s | 5.5 |
| cuts_per_min | 26.5 |
| motion_share | 0.809 |
| still_2s_runs | 1 |
| brightness_mean | 0.61 |
| saturation_mean | 0.36 |
| wpm_overall | 105 |
| wpm_while_speaking | 180 |

```
PASS  cuts_per_min           26.5   target >= 12.0
PASS  avg_shot_s             2.17   target <= 5.0
PASS  longest_shot_s          5.5   target <= 25.0
PASS  motion_share          0.809   target >= 0.5
PASS  still_2s_per_min        1.2   target <= 6.0
FLAG  wpm_overall             105   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockA.jpg` (1 tile every 1 s).
