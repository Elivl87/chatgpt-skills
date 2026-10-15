# QC · blockE2

File: `blockE2_draft.mp4` · 70.47 s · 30/1 fps · 9.19 MB · 1.0 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 854x480 |
| file size <= 30 MB (chat delivery) | **PASS** | 9.19 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **PASS** | -1.4 dBTP |
| no black frames | **PASS** | none |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -1.4 dBTP, LRA 15.1 LU.

## Pacing (secondquest style_bible.py + pacing_qc.py)

| metric | value |
|---|---|
| duration_s | 70.5 |
| shots | 27 |
| avg_shot_s | 2.61 |
| longest_shot_s | 14.5 |
| cuts_per_min | 22.1 |
| motion_share | 0.891 |
| still_2s_runs | 0 |
| brightness_mean | 0.612 |
| saturation_mean | 0.343 |
| wpm_overall | 101 |
| wpm_while_speaking | 210 |

```
PASS  cuts_per_min           22.1   target >= 12.0
PASS  avg_shot_s             2.61   target <= 5.0
PASS  longest_shot_s         14.5   target <= 25.0
PASS  motion_share          0.891   target >= 0.5
PASS  still_2s_per_min        0.0   target <= 6.0
FLAG  wpm_overall             101   target between (135, 165)

1 flag(s): see docs/style/STYLE_BIBLE.md for what to change
```

Contact sheet: `contact_sheet_blockE2.jpg` (1 tile every 1 s).
