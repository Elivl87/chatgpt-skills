# QC · blockE1

File: `blockE1_draft.mp4` · 54.47 s · 30/1 fps · 6.01 MB · 0.9 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 6.01 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.5 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.5 dBTP, LRA 2.5 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 54.5 |
| shots | 18 |
| avg_shot_s | 3.03 |
| longest_shot_s | 6.66 |
| cuts_per_min | 18.7 |
| motion_share | 0.954 |
| still_2s_runs | 0 |
| brightness_mean | 0.644 |
| saturation_mean | 0.314 |
| wpm_overall | 130 |
| wpm_while_speaking | 166 |

```
PASS  cuts_per_min           18.7   target >= 12.0
PASS  avg_shot_s             3.03   target <= 5.0
PASS  longest_shot_s         6.66   target <= 25.0
PASS  motion_share          0.954   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall             130   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockE1.jpg` (1 tile every 1 s).
