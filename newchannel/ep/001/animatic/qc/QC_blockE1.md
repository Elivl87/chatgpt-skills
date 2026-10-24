# QC · blockE1

File: `blockE1_review.mp4` · 52.85 s · 30/1 fps · 9.02 MB · 1.4 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 9.02 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.1 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -2.9 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.1 LUFS, TP -2.9 dBTP, LRA 2.3 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 52.8 |
| shots | 18 |
| avg_shot_s | 2.94 |
| longest_shot_s | 5.84 |
| cuts_per_min | 19.3 |
| motion_share | 0.905 |
| still_2s_runs | 0 |
| brightness_mean | 0.633 |
| saturation_mean | 0.309 |
| wpm_overall | 134 |
| wpm_while_speaking | 169 |

```
PASS  cuts_per_min           19.3   target >= 12.0
PASS  avg_shot_s             2.94   target <= 5.0
PASS  longest_shot_s         5.84   target <= 25.0
PASS  motion_share          0.905   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall             134   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockE1.jpg` (1 tile every 1 s).
