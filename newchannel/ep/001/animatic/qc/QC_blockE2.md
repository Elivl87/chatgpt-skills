# QC · blockE2

File: `blockE2_review.mp4` · 70.73 s · 30/1 fps · 15.92 MB · 1.8 Mb/s

| Check | Result | Value |
|---|---|---|
| codec H.264 / yuv420p | **PASS** | h264 yuv420p |
| resolution | **PASS** | 1280x720 |
| file size <= 30 MB (chat delivery) | **PASS** | 15.92 MB |
| audio AAC 48 kHz | **PASS** | aac 48000 |
| loudness -14 LUFS (+-1) | **PASS** | -14.0 LUFS |
| true peak <= -1.0 dBTP | **FAIL** | -0.9 dBTP |
| no black frames | **FAIL** | [(70.5333, 70.7)] |
| no undeclared freezes >= 0.5 s | **PASS** | none |
| no undeclared silence >= 0.5 s | **PASS** | none |

Loudness (ffmpeg ebur128 on the final mp4): I -14.0 LUFS, TP -0.9 dBTP, LRA 12.1 LU.

Contact sheet: `contact_sheet_blockE2.jpg` (1 tile every 1 s).

**Notes (v5, 2026-10-28):** the black frames at 70.53-70.70 s are the declared 1 s fade to black that ends the episode
(K06_fade), not a defect. The −0.9 dBTP is this block's preview mix (`sound_block.py`); the pilot is mixed once by
`build_episode.py` (−14 LUFS, TP ≤ −1.5), which is the delivered sound.
